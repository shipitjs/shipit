# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [5.3.0](https://github.com/shipitjs/shipit/tree/master/packages/shipit-deploy/compare/v5.2.0...v5.3.0) (2020-03-18)


### Features

* add support of `asUser` ([#260](https://github.com/shipitjs/shipit/tree/master/packages/shipit-deploy/issues/260)) ([4e79edb](https://github.com/shipitjs/shipit/tree/master/packages/shipit-deploy/commit/4e79edb))





# [5.2.0](https://github.com/shipitjs/shipit/tree/master/packages/shipit-deploy/compare/v5.1.0...v5.2.0) (2020-03-07)


### Features

* add a config validation function ([#258](https://github.com/shipitjs/shipit/tree/master/packages/shipit-deploy/issues/258)) ([d98ec8e](https://github.com/shipitjs/shipit/tree/master/packages/shipit-deploy/commit/d98ec8e))





# [5.1.0](https://github.com/shipitjs/shipit/tree/master/packages/shipit-deploy/compare/v5.0.0...v5.1.0) (2019-08-28)


### Bug Fixes

* correct peerDependencies field for shipit-deploy package ([#243](https://github.com/shipitjs/shipit/tree/master/packages/shipit-deploy/issues/243)) ([3586c21](https://github.com/shipitjs/shipit/tree/master/packages/shipit-deploy/commit/3586c21))


### Features

* **shipit-deploy:** Added config so you can rsync including the folder ([#246](https://github.com/shipitjs/shipit/tree/master/packages/shipit-deploy/issues/246)) ([64481f8](https://github.com/shipitjs/shipit/tree/master/packages/shipit-deploy/commit/64481f8))





## [4.1.4](https://github.com/shipitjs/shipit/tree/master/packages/shipit-deploy/compare/v4.1.3...v4.1.4) (2019-02-19)


### Bug Fixes

* **shipit-deploy:** skip fetching git in case when repositoryUrl was not provided (closes [#207](https://github.com/shipitjs/shipit/tree/master/packages/shipit-deploy/issues/207)) ([#226](https://github.com/shipitjs/shipit/tree/master/packages/shipit-deploy/issues/226)) ([4ae0f89](https://github.com/shipitjs/shipit/tree/master/packages/shipit-deploy/commit/4ae0f89))





## [4.1.3](https://github.com/shipitjs/shipit/tree/master/packages/shipit-deploy/compare/v4.1.2...v4.1.3) (2018-11-11)


### Bug Fixes

* fixes directory permissions ([#224](https://github.com/shipitjs/shipit/tree/master/packages/shipit-deploy/issues/224)) ([3277adf](https://github.com/shipitjs/shipit/tree/master/packages/shipit-deploy/commit/3277adf)), closes [#189](https://github.com/shipitjs/shipit/tree/master/packages/shipit-deploy/issues/189)





## [4.1.2](https://github.com/shipitjs/shipit/tree/master/packages/shipit-deploy/compare/v4.1.1...v4.1.2) (2018-11-04)


### Bug Fixes

* **shipit-deploy:** only remove workspace if not shallow clone ([#200](https://github.com/shipitjs/shipit/tree/master/packages/shipit-deploy/issues/200)) ([6ba6f00](https://github.com/shipitjs/shipit/tree/master/packages/shipit-deploy/commit/6ba6f00))





<a name="4.1.1"></a>
## [4.1.1](https://github.com/shipitjs/shipit/compare/v4.1.0...v4.1.1) (2018-05-30)


### Bug Fixes

* update shipit-deploy's peerDependency to v4.1.0 ([#192](https://github.com/shipitjs/shipit/issues/192)) ([6f7b407](https://github.com/shipitjs/shipit/commit/6f7b407))




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
