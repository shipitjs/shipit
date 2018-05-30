# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="4.1.1"></a>
## [4.1.1](https://github.com/shipitjs/shipit/compare/v4.1.0...v4.1.1) (2018-05-30)


### Bug Fixes

* update shipit-deploy's peerDependency to v4.1.0 ([#192](https://github.com/shipitjs/shipit/issues/192)) ([6f7b407](https://github.com/shipitjs/shipit/commit/6f7b407))




<a name="4.1.0"></a>
# [4.1.0](https://github.com/shipitjs/shipit/compare/v4.0.2...v4.1.0) (2018-04-27)


### Features

* **ssh-pool:** add SSH Verbosity Levels ([#191](https://github.com/shipitjs/shipit/issues/191)) ([327c63e](https://github.com/shipitjs/shipit/commit/327c63e))




<a name="4.0.2"></a>
## [4.0.2](https://github.com/shipitjs/shipit/compare/v4.0.1...v4.0.2) (2018-03-25)


### Bug Fixes

* be compatible with CommonJS ([abd2316](https://github.com/shipitjs/shipit/commit/abd2316))
* fix scpCopyFromRemote & scpCopyToRemote ([01bc213](https://github.com/shipitjs/shipit/commit/01bc213)), closes [#178](https://github.com/shipitjs/shipit/issues/178)




<a name="4.0.1"></a>
## [4.0.1](https://github.com/shipitjs/shipit/compare/v4.0.0...v4.0.1) (2018-03-18)


### Bug Fixes

* **shipit-cli:** correctly publish binary ([6b60f20](https://github.com/shipitjs/shipit/commit/6b60f20))




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
