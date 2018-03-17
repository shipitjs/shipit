# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
