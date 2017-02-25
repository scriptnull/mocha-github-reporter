var superagent = require('superagent')

module.exports = GithubAdapter

function GithubAdapter (opts) {
  this.apiEndpoint = 'https://api.github.com'
  this.token = opts.token
}

GithubAdapter.prototype.createIssue = function (opts, callback) {
  superagent
    .post(this.apiEndpoint + '/repos/' + opts.owner + '/' + opts.repo + '/issues')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'token ' + this.token)
    .set('User-Agent', 'mocha github reporter')
    .set('Accept', 'application/vnd.github.v3+json')
    .send({
      title: opts.title
    })
    .end(callback)
}
