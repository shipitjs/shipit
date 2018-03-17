# shipit-deploy

[![Build Status][build-badge]][build]
[![version][version-badge]][package]
[![MIT License][license-badge]][license]

Set of deployment tasks for [Shipit](https://github.com/shipitjs/shipit).

**Features:**

* Deploy tag, branch or commit
* Add additional behaviour using hooks
* Build your project locally or remotely
* Easy rollback

## Install

```
npm install shipit-deploy
```

If you are deploying from Windows, you may want to have a look at the [wiki page about usage in Windows](https://github.com/shipitjs/shipit/blob/master/packages/shipit-deploy/docs/Windows.md).

## Usage

### Example `shipitfile.js`

```js
module.exports = shipit => {
  require('shipit-deploy')(shipit)

  shipit.initConfig({
    default: {
      workspace: '/tmp/myapp',
      deployTo: '/var/myapp',
      repositoryUrl: 'https://github.com/user/myapp.git',
      ignores: ['.git', 'node_modules'],
      keepReleases: 2,
      deleteOnRollback: false,
      key: '/path/to/key',
      shallowClone: true,
    },
    staging: {
      servers: 'user@myserver.com',
    },
  })
}
```

To deploy on staging, you must use the following command :

```
shipit staging deploy
```

You can rollback to the previous releases with the command :

```
shipit staging rollback
```

## Options

### workspace

Type: `String`

Define a path to an empty directory where Shipit builds it's syncing source. **Beware to not set this path to the root of your repository as shipit-deploy cleans the directory at the given path as a first step.**

### dirToCopy

Type: `String`
Default: same as workspace

Define directory within the workspace which should be deployed.

### deployTo

Type: `String`

Define the remote path where the project will be deployed. A directory `releases` is automatically created. A symlink `current` is linked to the current release.

### repositoryUrl

Type: `String`

Git URL of the project repository.

If empty Shipit will try to deploy without pulling the changes.

In edge cases like quick PoC projects without a repository or a living on the edge production patch applying this can be helpful.

### branch

Type: `String`

Tag, branch or commit to deploy.

### ignores

Type: `Array<String>`

An array of paths that match ignored files. These paths are used in the rsync command.

### deleteOnRollback

Type: `Boolean`

Whether or not to delete the old release when rolling back to a previous release.

### key

Type: `String`

Path to SSH key

### keepReleases

Type: `Number`

Number of releases to keep on the remote server.

### shallowClone

Type: `Boolean`

Perform a shallow clone. Default: `false`.

### updateSubmodules

Type: Boolean

Update submodules. Default: `false`.

### gitConfig

type: `Object`

Custom git configuration settings for the cloned repo.

### gitLogFormat

Type: `String`

Log format to pass to [`git log`](http://git-scm.com/docs/git-log#_pretty_formats). Used to display revision diffs in `pending` task. Default: `%h: %s - %an`.

### rsyncFrom

Type: `String` _Optional_

When deploying from Windows, prepend the workspace path with the drive letter. For example `/d/tmp/workspace` if your workspace is located in `d:\tmp\workspace`.
By default, it will run rsync from the workspace folder.

### copy

Type: `String`

Parameter to pass to `cp` to copy the previous release. Non NTFS filesystems support `-r`. Default: `-a`

## Variables

Several variables are attached during the deploy and the rollback process:

### shipit.config.\*

All options described in the config sections are available in the `shipit.config` object.

### shipit.repository

Attached during `deploy:fetch` task.

You can manipulate the repository using git command, the API is describe in [gift](https://github.com/sentientwaffle/gift).

### shipit.releaseDirname

Attached during `deploy:update` and `rollback:init` task.

The current release dirname of the project, the format used is "YYYYMMDDHHmmss" (moment format).

### shipit.releasesPath

Attached during `deploy:init`, `rollback:init`, and `pending:log` tasks.

The remote releases path.

### shipit.releasePath

Attached during `deploy:update` and `rollback:init` task.

The complete release path : `path.join(shipit.releasesPath, shipit.releaseDirname)`.

### shipit.currentPath

Attached during `deploy:init`, `rollback:init`, and `pending:log` tasks.

The current symlink path : `path.join(shipit.config.deployTo, 'current')`.

## Workflow tasks

* deploy
  * deploy:init
    * Emit event "deploy".
  * deploy:fetch
    * Create workspace.
    * Initialize repository.
    * Add remote.
    * Fetch repository.
    * Checkout commit-ish.
    * Merge remote branch in local branch.
    * Emit event "fetched".
  * deploy:update
    * Create and define release path.
    * Remote copy project.
    * Emit event "updated".
  * deploy:publish
    * Update symlink.
    * Emit event "published".
  * deploy:clean
    * Remove old releases.
    * Emit event "cleaned".
  * deploy:finish
    * Emit event "deployed".
* rollback
  * rollback:init
    * Define release path.
    * Emit event "rollback".
  * deploy:publish
    * Update symlink.
    * Emit event "published".
  * deploy:clean
    * Remove old releases.
    * Emit event "cleaned".
  * rollback:finish
    * Emit event "rollbacked".
* pending
  * pending:log
    * Log pending commits (diff between HEAD and currently deployed revision) to console.

## License

MIT

[build-badge]: https://img.shields.io/travis/shipitjs/shipit.svg?style=flat-square
[build]: https://travis-ci.org/shipitjs/shipit
[version-badge]: https://img.shields.io/npm/v/shipit-deploy.svg?style=flat-square
[package]: https://www.npmjs.com/package/shipit-deploy
[license-badge]: https://img.shields.io/npm/l/shipit-deploy.svg?style=flat-square
[license]: https://github.com/shipitjs/shipit/blob/master/LICENSE
