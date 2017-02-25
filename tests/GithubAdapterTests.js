/* globals describe it before */
var GithubAdapter = require('../GithubAdapter.js')
var gApi

describe('Issue API', function () {
  before(function () {
    gApi = new GithubAdapter({
      token: process.env['GITHUB_ACCESS_TOKEN']
    })
  })
  it('Should Create New Issue', function (done) {
    gApi.createIssue(
      {
        owner: 'ShipSamples',
        repo: 'ci-min-node',
        title: 'Test GithubAdapter API'
      },
      function (err, res) {
        if (err || !res) {
          return done(err)
        }
        if (!res.body) {
          return done('No response body')
        }
        done()
      }
    )
  })
})
