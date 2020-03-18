# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [5.3.0](https://github.com/shipitjs/shipit/tree/master/packages/shipit-deploy/compare/v5.2.0...v5.3.0) (2020-03-18)


### Features

* add support of `asUser` ([#260](https://github.com/shipitjs/shipit/tree/master/packages/shipit-deploy/issues/260)) ([4e79edb](https://github.com/shipitjs/shipit/tree/master/packages/shipit-deploy/commit/4e79edb))





# [5.2.0](https://github.com/shipitjs/shipit/tree/master/packages/shipit-deploy/compare/v5.1.0...v5.2.0) (2020-03-07)


### Bug Fixes

* **windows:** cd must run the specified drive letter ([#252](https://github.com/shipitjs/shipit/tree/master/packages/shipit-deploy/issues/252)) ([ab916a9](https://github.com/shipitjs/shipit/tree/master/packages/shipit-deploy/commit/ab916a9))
* fix remote command wont reject on error, when cwd option is used ([#265](https://github.com/shipitjs/shipit/tree/master/packages/shipit-deploy/issues/265)) ([986aec1](https://github.com/shipitjs/shipit/tree/master/packages/shipit-deploy/commit/986aec1))





# [5.1.0](https://github.com/shipitjs/shipit/tree/master/packages/shipit-deploy/compare/v5.0.0...v5.1.0) (2019-08-28)


### Features

* **ssh-pool:** Added ssh config array to remote server ([#248](https://github.com/shipitjs/shipit/tree/master/packages/shipit-deploy/issues/248)) ([ba1d8c2](https://github.com/shipitjs/shipit/tree/master/packages/shipit-deploy/commit/ba1d8c2))





## [4.1.2](https://github.com/shipitjs/shipit/tree/master/packages/shipit-deploy/compare/v4.1.1...v4.1.2) (2018-11-04)


### Bug Fixes

* **security:** use which instead of whereis ([#220](https://github.com/shipitjs/shipit/tree/master/packages/shipit-deploy/issues/220)) ([6f46cad](https://github.com/shipitjs/shipit/tree/master/packages/shipit-deploy/commit/6f46cad))
* use correct deprecation warning ([#219](https://github.com/shipitjs/shipit/tree/master/packages/shipit-deploy/issues/219)) ([e0c0fa5](https://github.com/shipitjs/shipit/tree/master/packages/shipit-deploy/commit/e0c0fa5))





<a name="4.1.0"></a>
# [4.1.0](https://github.com/babel/babel/tree/master/packages/babel-traverse/compare/v4.0.2...v4.1.0) (2018-04-27)


### Features

* **ssh-pool:** add SSH Verbosity Levels ([#191](https://github.com/babel/babel/tree/master/packages/babel-traverse/issues/191)) ([327c63e](https://github.com/babel/babel/tree/master/packages/babel-traverse/commit/327c63e))




<a name="4.0.2"></a>
## [4.0.2](https://github.com/babel/babel/tree/master/packages/babel-traverse/compare/v4.0.1...v4.0.2) (2018-03-25)


### Bug Fixes

* be compatible with CommonJS ([abd2316](https://github.com/babel/babel/tree/master/packages/babel-traverse/commit/abd2316))
* fix scpCopyFromRemote & scpCopyToRemote ([01bc213](https://github.com/babel/babel/tree/master/packages/babel-traverse/commit/01bc213)), closes [#178](https://github.com/babel/babel/tree/master/packages/babel-traverse/issues/178)




<a name="4.0.0"></a>

# 4.0.0 (2018-03-17)

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

### Chores

* Move to a Lerna repository
* Add Codecov
* Move to Jest for testing
* Rewrite project in ES2017 targeting Node.js v6+

### Deprecations

* Deprecate automatic "sudo" removing when using "asUser" #56 #12
* Deprecate "copy" method in favor of "copyToRemote", "copyFromRemote", "scpCopyToRemote" and "scpCopyFromRemote"
* Deprecate using "deploy" as default user
* Deprecate automatic "tty" when detecting "sudo" #56

### BREAKING CHANGES

* Drop callbacks support and use native Promises
* Standardise errors #154
* Replace "cwd" behaviour in "run" command #9
