# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="4.0.0"></a>

# 4.0.0 (2018-03-17)

## global

### Chores

* Move to a Lerna repository
* Add Codecov
* Move to Jest for testing
* Rewrite project in ES2017 targeting Node.js v6+

## shipit-cli

### Features

* Improve Shipit cli utilities #75
* Support ES6 modules in shipitfile.babel.js
* Give access to raw config #93
* Standardize errors #154

### Fixes

* Fix usage of user directory #160
* Fix SSH key config shipitjs/shipit-deploy#151 shipitjs/shipit-deploy#126

### Docs

* Improve documentation #69 #148 #81

### Deprecations

* Deprecate `remoteCopy` in favor of `copyToRemote` and `copyFromRemote`

### BREAKING CHANGES

* Drop callbacks support and use native Promises

## ssh-pool

### Features

* Introduce a "tty" option in "run" method #56
* Support "cwd" in "run" command #9
* Expose a "isRsyncSupported" method

### Fixes

* Fix parallel issues using scp copy shipitjs/ssh-pool#22
* Fix command escaping #91 #152

### Docs

* Update readme with new documentation

### Deprecations

* Deprecate automatic "sudo" removing when using "asUser" #56 #12
* Deprecate "copy" method in favor of "copyToRemote", "copyFromRemote", "scpCopyToRemote" and "scpCopyFromRemote"
* Deprecate using "deploy" as default user
* Deprecate automatic "tty" when detecting "sudo" #56

### BREAKING CHANGES

* Drop callbacks support and use native Promises
* Standardise errors #154
* Replace "cwd" behaviour in "run" command #9

## shipit-deploy

### Fixes

* Use [ instead of [[ to improve compatiblity shipitjs/shipit-deploy#147 shipitjs/shipit-deploy#148
* Use rmfr to improve compatibility shipitjs/shipit-deploy#135 shipitjs/shipit-deploy#155

### BREAKING CHANGES

* Default shallowClone to `true`
* Drop grunt-shipit support
* Workspace is now a temp directory in shallow clone
* An error is thrown if workspace is set to the current directory
