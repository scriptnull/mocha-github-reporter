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
| REPORT_FORMATTER | `all-suites` (default). See below for more. |

Run mocha.

```bash
$ mocha --reporter mocha-github-reporter tests/
```
## Reports
Any one of the following report formats could be setup by specifying it as `REPORT_FORMATTER` environment variable.

### all-suites
Resembles default mocha reporting.
![all-suites](/screens/all-suites.png)

### all-suites-emoji
emoji can be configured via `PASSED_EMOJI` and `FAILED_EMOJI` environment variables. Example: FAILED_EMOJI='poop'
![all-suites-emoji](/screens/all-suites-emoji.png)

### failed-checklist
Suited to be used as a checklist for sending PR fixes.
![failed-checklist](/screens/failed-checklist.png)

## Contribute
- Bug fixes.
- Adding new formatters.

[Open issue](https://github.com/scriptnull/mocha-github-reporter/issues/new) to discuss more.

## Thanks
> "Thanks for taking time to evaluate `mocha-github-reporter`. It means a lot to this project. I hope that, this project takes you one step closer to a supercharged workflow" - [scriptnull](https://twitter.com/scriptnull)
