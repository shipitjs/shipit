# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
