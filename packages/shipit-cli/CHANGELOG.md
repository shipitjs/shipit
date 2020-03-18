# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [5.3.0](https://github.com/shipitjs/shipit/tree/master/packages/shipit-deploy/compare/v5.2.0...v5.3.0) (2020-03-18)


### Features

* add support of `asUser` ([#260](https://github.com/shipitjs/shipit/tree/master/packages/shipit-deploy/issues/260)) ([4e79edb](https://github.com/shipitjs/shipit/tree/master/packages/shipit-deploy/commit/4e79edb))





# [5.2.0](https://github.com/shipitjs/shipit/tree/master/packages/shipit-deploy/compare/v5.1.0...v5.2.0) (2020-03-07)

**Note:** Version bump only for package shipit-cli





# [5.1.0](https://github.com/shipitjs/shipit/tree/master/packages/shipit-deploy/compare/v5.0.0...v5.1.0) (2019-08-28)

**Note:** Version bump only for package shipit-cli





# [4.2.0](https://github.com/shipitjs/shipit/tree/master/packages/shipit-deploy/compare/v4.1.4...v4.2.0) (2019-03-01)


### Features

* add "init:after_ssh_pool" event ([#230](https://github.com/shipitjs/shipit/tree/master/packages/shipit-deploy/issues/230)) ([e864338](https://github.com/shipitjs/shipit/tree/master/packages/shipit-deploy/commit/e864338))





## [4.1.2](https://github.com/shipitjs/shipit/tree/master/packages/shipit-deploy/compare/v4.1.1...v4.1.2) (2018-11-04)

**Note:** Version bump only for package shipit-cli





<a name="4.1.1"></a>
## [4.1.1](https://github.com/shipitjs/shipit/compare/v4.1.0...v4.1.1) (2018-05-30)




**Note:** Version bump only for package shipit-cli

<a name="4.1.0"></a>
# [4.1.0](https://github.com/shipitjs/shipit/compare/v4.0.2...v4.1.0) (2018-04-27)


### Features

* **ssh-pool:** add SSH Verbosity Levels ([#191](https://github.com/shipitjs/shipit/issues/191)) ([327c63e](https://github.com/shipitjs/shipit/commit/327c63e))




<a name="4.0.2"></a>
## [4.0.2](https://github.com/shipitjs/shipit/compare/v4.0.1...v4.0.2) (2018-03-25)


### Bug Fixes

* be compatible with CommonJS ([abd2316](https://github.com/shipitjs/shipit/commit/abd2316))




<a name="4.0.1"></a>
## [4.0.1](https://github.com/shipitjs/shipit/compare/v4.0.0...v4.0.1) (2018-03-18)


### Bug Fixes

* **shipit-cli:** correctly publish binary ([6b60f20](https://github.com/shipitjs/shipit/commit/6b60f20))




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
