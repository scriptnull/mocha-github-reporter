var mocha = require('mocha')
var _ = require('underscore')
var superagent = require('superagent')
var fs = require('fs')

module.exports = GithubReporter

function GithubReporter (runner, options) {
  var self = this
  mocha.reporters.Base.call(this, runner)

  var formatters = {
    default: {
      format: function (passedTests, failedTests) {
        try {
          var content = fs.readFileSync('./templates/default.template').toString()
          var template = _.template(content, {variable: 'data'})
          return template({
            passedTests: passedTests,
            failedTests: failedTests
          })
        } catch (err) {
          console.error(err)
          process.exit(1)
        }
      }
    },
    onlyFailed: {
      format: function (passedTests, failedTests) {

      }
    }
  }
  var passedTests = []
  var failedTests = []

  runner.on('pass', function (test) {
    passedTests.push(test)
  })

  runner.on('fail', function (test, err) {
    failedTests.push({test: test, error: err})
  })

  runner.on('end', function () {
    var config = {
      githubAccessToken: process.env['GITHUB_ACCESS_TOKEN'],
      githubRepoSlug: process.env['GITHUB_REPO_SLUG'],
      githubIssueAssignees: process.env['GITHUB_ISSUE_ASSIGNEES'] || '',
      reportTitle: process.env['REPORT_TITLE'],
      formatter: formatters.default
    }

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

    config.reportContent = config.formatter.format(passedTests, failedTests)

    self.config = config
  })
}

GithubReporter.prototype.done = function () {
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

      console.log(':: Github Mocha Reporter ::')
      console.log('Report - ' + res.body.html_url)
    })
}
