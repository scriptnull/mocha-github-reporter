var mocha = require('mocha')
var _ = require('underscore')
var superagent = require('superagent')
var fs = require('fs')

module.exports = GithubReporter

function GithubReporter (runner, options) {
  var formatters = {
    'overall': './templates/overall.template',

    'all-unordered-list-with-error': './templates/all-unordered-list-with-error.template',
    'all-ordered-list-with-error': './templates/all-ordered-list-with-error.template',

    'all-unordered-list-without-error': './templates/all-unordered-list-without-error.template',
    'all-ordered-list-without-error': './templates/all-ordered-list-without-error.template',

    'passed-unordered-list': './templates/passed-unordered-list.template',
    'failed-unordered-list-with-error': './templates/failed-unordered-list-with-error.template',
    'failed-unordered-list-without-error': './templates/failed-unordered-list-without-error.template',

    'passed-ordered-list': './templates/passed-ordered-list',
    'failed-ordered-list-with-error': './templates/failed-ordered-list-with-error.template',
    'failed-ordered-list-without-error': './templates/failed-ordered-list-without-error.template'
  }

  var self = this
  self.passedTests = []
  self.failedTests = []
  self.config = {
    githubAccessToken: process.env['GITHUB_ACCESS_TOKEN'],
    githubRepoSlug: process.env['GITHUB_REPO_SLUG'],
    githubIssueAssignees: process.env['GITHUB_ISSUE_ASSIGNEES'] || '',
    reportTitle: process.env['REPORT_TITLE'],
    githubCommiter: process.env['COMMITTER'],
    formatter: formatters['all-ordered-list-with-error']
  }
  mocha.reporters.Base.call(this, runner)

  var getTemplateContent = function (formatter) {
    var content = fs.readFileSync(formatter).toString()
    var template = _.template(content, {variable: 'data'})
    return template({
      passedTests: self.passedTests,
      failedTests: self.failedTests
    })
  }

  var format = function (formatter) {
    try {
      var issueContent = ''
      issueContent += getTemplateContent(formatters.overall)
      issueContent += getTemplateContent(formatter)
      return issueContent
    } catch (err) {
      console.error(err)
      process.exit(1)
    }
  }

  runner.on('start', function () {
    console.log(':: Github Mocha Reporter ::')
    console.log()
  })

  runner.on('pass', function (test) {
    self.passedTests.push({test: test})
  })

  runner.on('fail', function (test, err) {
    self.failedTests.push({test: test, error: err})
  })

  runner.on('end', function () {
    var config = self.config

    if (!_.isEmpty(options)) {
      config.githubAccessToken = config.githubAccessToken || options.token
      config.githubRepoSlug = config.githubRepoSlug || options.slug
      config.githubIssueAssignees = config.githubIssueAssignees || options.assignees

      if (!_.isEmpty(config.githubIssueAssignees)) {
        config.githubIssueAssignees = config.githubIssueAssignees.split(',')
      }

      if (!_.isEmpty(options.formatter)) {
        var formatter = formatters[options.formatter]
        if (!_.isEmpty(formatter)) {
          config.formatter = formatter
        }
      }
    }

    var missingConfigs = []

    if (_.isEmpty(config.githubAccessToken)) {
      missingConfigs.push('GITHUB_ACCESS_TOKEN env or --reporter-options token=XXXX')
    }

    if (_.isEmpty(config.githubRepoSlug)) {
      missingConfigs.push('GITHUB_REPO_SLUG env or --reporter-options slug=owner/repo')
    }

    var splittedSlug = config.githubRepoSlug.split('/')
    config.githubRepoOwner = splittedSlug[0]
    config.githubRepoName = splittedSlug[1]

    if (_.isEmpty(config.githubRepoOwner) || _.isEmpty(config.githubRepoName)) {
      missingConfigs.push('GITHUB_REPO_SLUG="owner/repo" or --reporter-options slug=owner/repo')
    }

    if (!_.isEmpty(missingConfigs)) {
      console.error('Missing Configurations. Please provide ')
      _.each(missingConfigs, function (c) {
        console.error(' ->> ' + c)
      })
      console.error()
      process.exit(1)
    }

    config.reportContent = format(config.formatter)
  })
}

GithubReporter.prototype.done = function () {
  var self = this
  superagent
    .post('https://api.github.com/repos/' + this.config.githubRepoOwner + '/' + this.config.githubRepoName + '/issues')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'token ' + this.config.githubAccessToken)
    .set('User-Agent', 'mocha github reporter')
    .set('Accept', 'application/vnd.github.v3+json')
    .send({
      title: this.config.reportTitle,
      body: this.config.reportContent
    })
    .end(function (err, res) {
      if (err || !res || (res && !res.body)) {
        console.error('Error creating issue in the repository')
        console.error(err)
        process.exit(1)
      }

      console.log('Report created => ' + res.body.html_url)
      console.log()

      process.exit(_.isEmpty(self.failedTests) ? 0 : 1)
    })
}
