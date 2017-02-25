var mocha = require('mocha')
var _ = require('underscore')
var util = require('util')
var GithubAdapter = require('./GithubAdapter.js')

module.exports = GithubReporter

function GithubReporter (runner, options) {
  mocha.reporters.Base.call(this, runner)
  var formatters = {
    default: {
      format: function (passedTests, failedTests) {

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
    failedTests.push(test)
  })

  runner.on('end', function () {
    var config = {
      githubAccessToken: process.env['GITHUB_ACCESS_TOKEN'],
      githubRepoSlug: process.env['GITHUB_REPO_SLUG'],
      githubIssueAssignees: process.env['GITHUB_ISSUE_ASSIGNEES'] || '',
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

    var gApi = new GithubAdapter({
      token: process.env['GITHUB_ACCESS_TOKEN']
    })

    gApi.createIssue(
      {
        owner: 'ShipSamples',
        repo: 'ci-min-node',
        title: 'Test GithubAdapter API in index'
      }
    ).done(
      function (err, res) {
        if (err || !res) {
          console.error('Failed to create Github issue')
          console.error(err)
          process.exit(1)
        }
        console.log(res.body)
        var totalTests = passedTests.length + failedTests.length
        console.log(':: Github Reporter ::')
        console.log(util.format('Passed %s/%s', passedTests.length, totalTests))
        console.log(util.format('Failed %s/%s', failedTests.length, totalTests))
      }
    )

    // var issueContent = config.formatter.format(passedTests, failedTests)
  })
}
