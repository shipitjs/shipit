# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="4.0.0"></a>

# 4.0.0 (2018-03-17)

### Features

* Improve Shipit cli utilities #75
* Support ES6 modules in shipitfile.babel.js
* Give access to raw config #93
* Standardize errors #154

### Fixes

* Fix usage of user directory #160
* Fix SSH key config shipitjs/shipit-deploy#151 shipitjs/shipit-deploy#126

### Chores

* Move to a Lerna repository
* Add Codecov
* Move to Jest for testing
* Rewrite project in ES2017 targeting Node.js v6+

### Docs

* Improve documentation #69 #148 #81

### Deprecations

* Deprecate `remoteCopy` in favor of `copyToRemote` and `copyFromRemote`

### BREAKING CHANGES

* Drop callbacks support and use native Promises
