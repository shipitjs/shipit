# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="4.1.0"></a>
# [4.1.0](https://github.com/shipitjs/shipit/compare/v4.0.2...v4.1.0) (2018-04-27)




**Note:** Version bump only for package shipit-deploy

<a name="4.0.2"></a>
## [4.0.2](https://github.com/shipitjs/shipit/compare/v4.0.1...v4.0.2) (2018-03-25)


### Bug Fixes

* be compatible with CommonJS ([abd2316](https://github.com/shipitjs/shipit/commit/abd2316))




<a name="4.0.0"></a>

# 4.0.0 (2018-03-17)

## shipit-deploy

### Fixes

* Use [ instead of [[ to improve compatiblity shipitjs/shipit-deploy#147 shipitjs/shipit-deploy#148
* Use rmfr to improve compatibility shipitjs/shipit-deploy#135 shipitjs/shipit-deploy#155

### Chores

* Move to a Lerna repository
* Add Codecov
* Move to Jest for testing
* Rewrite project in ES2017 targeting Node.js v6+

### BREAKING CHANGES

* Default shallowClone to `true`
* Drop grunt-shipit support
* Workspace is now a temp directory in shallow clone
* An error is thrown if workspace is set to the current directory
