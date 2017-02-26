var mocha = require('mocha')
var _ = require('underscore')
var superagent = require('superagent')
var fs = require('fs')
var leftPad = require('left-pad')

module.exports = GithubReporter

function GithubReporter (runner, options) {
  var getTemplateContent = function (formatterPath, opts) {
    try {
      var content = fs.readFileSync(formatterPath).toString()
      var template = _.template(content, {variable: 'data'})
      return template(opts)
    } catch (err) {
      console.error(err)
      process.exit(1)
    }
  }

  var formatters = {
    'all-suite': function (suite, level) {
      try {
        var suiteContent = ''
        if (level === 0) {
          suiteContent += '### Suite Chart\n'
          suiteContent += '```\n'
        }

        suiteContent += leftPad(suite.title, (suite.title.length + (level * 2))) + '\n'

        _.each(suite.tests, function (test) {
          var testString = '[' + test.state + '] ' + test.title
          suiteContent += leftPad(testString, (testString.length + (level * 4))) + '\n'
        })

        _.each(suite.suites, function (innerSuite) {
          suiteContent += formatters['all-suite'](innerSuite, level + 1)
        })

        if (level === 0) {
          suiteContent += '```\n'
          suiteContent += getTemplateContent('./templates/failed-ordered-list-with-error.template', {
            failedTests: self.failedTests
          })
        }
        return suiteContent
      } catch (err) {
        console.error(err)
        process.exit(1)
      }
    }
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
    formatter: formatters[process.env['REPORT_FORMATTER']] || formatters['all-suite']
  }
  mocha.reporters.Base.call(this, runner)

  runner.on('start', function () {
    console.log(':: Mocha Github Reporter ::')
    console.log()
  })

  self.rootSuite = null
  self.suiteLevel = 0

  runner.on('suite', function (suite) {
    if (self.suiteLevel === 0) {
      self.rootSuite = suite
    }
    self.suiteLevel++
  })

  runner.on('suite end', function () {
    self.suiteLevel--
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
    var opts = {
      passedTests: self.passedTests,
      failedTests: self.failedTests
    }
    var overallContent = getTemplateContent('./templates/overall.template', opts)
    config.reportContent = overallContent + config.formatter(self.rootSuite, 0)
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
