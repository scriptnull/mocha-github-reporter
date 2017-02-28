# mocha-github-reporter

[![Run Status](https://api.shippable.com/projects/58b1d2d35b77cc06007641a6/badge?branch=master)](https://app.shippable.com/projects/58b1d2d35b77cc06007641a6) [![npm](https://img.shields.io/npm/v/mocha-github-reporter.svg)]() [![David](https://img.shields.io/david/scriptnull/mocha-github-reporter.svg)]() [![David](https://img.shields.io/david/dev/scriptnull/mocha-github-reporter.svg)]() ![code style standard](https://img.shields.io/badge/code_style-standard-brightgreen.svg) ![license](https://img.shields.io/github/license/scriptnull/mocha-github-reporter.svg)

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
## Reports

### all-suites
![all-suites](https://cloud.githubusercontent.com/assets/4211715/23343448/bea6fb28-fc91-11e6-9692-a710dd5659e2.png)

## Contribute
- Bug fixes.
- Adding new formatters.

[Open issue](https://github.com/scriptnull/mocha-github-reporter/issues/new) to discuss more.

## Thanks
> "Thanks for taking time to evaluate `mocha-github-reporter`. It means a lot to this project. I hope that, this project takes you one step closer to a supercharged workflow" - [scriptnull](https://twitter.com/scriptnull)
