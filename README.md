# mocha-github-reporter

[![Run Status](https://api.shippable.com/projects/58b1d2d35b77cc06007641a6/badge?branch=master)](https://app.shippable.com/projects/58b1d2d35b77cc06007641a6) ![license](https://img.shields.io/github/license/scriptnull/mocha-github-reporter.svg)

Delivering mocha results from CI to Github. 📋

## Install
```bash
$ npm install --save-dev mocha-github-reporter
```

## Usage
Setup environment variables.

| ENVIRONMENT VARIABLE | EXAMPLE |
|----------------------|---------|
| GITHUB_ACCESS_TOKEN | XXXXX |
| GITHUB_REPO_SLUG | scriptnull/mocha-github-reporter |
| REPORT_TITLE | Mocha report for Build $BUILD_NUMBER |
| REPORT_ALWAYS | true |

Run mocha.

```bash
$ mocha --reporter mocha-github-reporter tests/
```
