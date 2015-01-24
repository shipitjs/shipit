# grunt-shipit 

[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/shipitjs/shipit-cli?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![Build Status](https://travis-ci.org/shipitjs/shipit-cli.svg?branch=master)](https://travis-ci.org/shipitjs/shipit-cli)
[![Dependency Status](https://david-dm.org/shipitjs/shipit-cli.svg?theme=shields.io)](https://david-dm.org/shipitjs/shipit-cli)
[![devDependency Status](https://david-dm.org/shipitjs/shipit-cli/dev-status.svg?theme=shields.io)](https://david-dm.org/shipitjs/shipit-cli#info=devDependencies)

![Shipit logo](https://cloud.githubusercontent.com/assets/266302/3756454/81df9f46-182e-11e4-9da6-b2c7a6b84136.png)

Shipit is a deploy tool written for node / iojs. Shipit was built to be a Capistrano alternative for people who want to write tasks in JavaScript and don't have a piece of ruby in their beautiful codebase.

## Install

It's recommended to install Shipit locally in your project.

```
npm install --save-dev shipit-cli
```

## Getting Started

One shipit is installed, you must create a shipitfile.js, if you are familiar with grunt or gulp, this is the same.

### Sample `shipitfile.js`

```js
module.exports = function (shipit) {
  shipit.initConfig({
    default: {
      workspace: '/tmp/deploy/my-project',
      deployTo: '/opt/web/my-project',
      repositoryUrl: 'git@github.com:neoziro/my-project.git',
      ignores: ['.*'],
      keepReleases: 5
    },
    staging: {
      servers: 'myproject.com'
    }
  });

  shipit.task('pwd', function () {
    return shipit.remote('pwd');
  });
};
```

You can now try to run shipit command, the binary `shipit` is located in `./node_modules/.bin/shipit`. I recommend you to add in your path: `./node_modules/.bin`.

### Usage

```
shipit <environment> <tasks ...>
```

## Dependencies

### Local

- git 1.7.8+
- rsync 3+
- OpenSSH 5+

### Remote

- GNU coreutils 5+

## Shipit tasks

### Run task

```
shipit <environment> <tasks ...>
```

### Basic options

#### servers

Type: `String` or `Array<String>`

Servers on which the project will be deployed. Pattern must be `user@myserver.com` if user is not specified (`myserver.com`) the default user will be "deploy".

#### key

Type: `String`

Path to SSH key

### Events

Shipit has several events describe in the workflow, you can add custom event and listen to events.

```js
shipit.task('build', function () {
  // ...
  shipit.emit('built');
});

shipit.on('fetched', function () {
  shipit.run('build');
});

```

### Methods

#### shipit.task(name, deps, fn)

Create a new Shipit task, if you are familiar with gulp, this is the same API. You can use a callback or a promise in your task.

For more documentation, please refer to [orchestrator documentation](https://github.com/orchestrator/orchestrator#orchestratoraddname-deps-function).

```js
shipit.task('pwd', function () {
  return shipit.remote('pwd');
});
```

#### shipit.run(tasks)

Run Shipit tasks.

For more documentation, please refer to [orchestrator documentation](https://github.com/orchestrator/orchestrator#orchestratorstarttasks-cb).

```js
shipit.run('task');
shipit.run('task1', 'task2');
shipit.run(['task1', 'task2']);
```

#### shipit.local(command, [options], [callback])

Run a command locally and streams the result. This command take a callback or return a promise.

```js
shipit.local('ls -lah', {cwd: '/tmp/deploy/workspace'}).then(...);
```

#### shipit.remote(command, [options], [callback])

Run a command remotely and streams the result. This command take a callback or return a promise.

If you want to run a `sudo` command, the ssh connection will use the TTY mode automatically.

```js
shipit.remote('ls -lah').then(...);
```

#### shipit.remoteCopy(src, dest, callback)

Make a remote copy from a local path to a dest path.

```js
shipit.remoteCopy('/tmp/workspace', '/opt/web/myapp').then(...);
```

## Deploy task

Shipit is built-in with a deploy and a rollback task. You can replace them by defining a new task named "deploy" and a new task named "rollback".

### Options

#### workspace

Type: `String`

Define the local working path of the project deployed.

#### deployTo

Type: `String`

Define the remote path where the project will be deployed. A directory `releases` is automatically created. A symlink `current` is linked to the current release.

#### repositoryUrl

Type: `String`

Git URL of the project repository.

#### branch

Type: `String`

Tag, branch or commit to deploy.

#### ignores

Type: `Array<String>`

An array of paths that match ignored files. These paths are used in the rsync command.

#### keepReleases

Type: `String`

Number of release to keep on the remote server.

#### shallowClone

Type: `Boolean`

Perform a shallow clone. Default: `false`.

### Example

```js
shipit: {
  default: {
    workspace: '/tmp/github-monitor',
    deployTo: '/tmp/deploy_to',
    repositoryUrl: 'https://github.com/user/repo.git',
    ignores: ['.git', 'node_modules'],
    keepReleases: 2,
    key: '/path/to/key',
    shallowClone: true
  },
  staging: {
    servers: 'user@myserver.com'
  }
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

### Variables

Shipit attach several variables during the deploy and the rollback process:

#### shipit.config.*

All options describe in the config sections are avalaible in the `shipit.config` object.

#### shipit.repository

Attached during `deploy:fetch` task.

You can manipulate the repository using git command, the API is describe in [gift](https://github.com/sentientwaffle/gift).

#### shipit.releaseDirname

Attached during `deploy:update` and `rollback:init` task.

The current release dirname of the project, the format used is "yyyymmddHHMMss" (grunt.template.date format).

#### shipit.releasesPath

Attached during `deploy:update` and `rollback:init` task.

The remote releases path.

#### shipit.releasePath

Attached during `deploy:update` and `rollback:init` task.

The complete release path : `path.join(shipit.releasesPath, shipit.releaseDirname)`.

#### shipit.currentPath

Attached during `deploy:publish` and `rollback:init` task.

The current symlink path : `path.join(shipit.config.deployTo, 'current')`.

### Workflow tasks

- deploy
  - deploy:init
    - Emit event "deploy".
  - deploy:fetch
    - Create workspace.
    - Initialize repository.
    - Add remote.
    - Fetch repository.
    - Checkout commit-ish.
    - Merge remote branch in local branch.
    - Emit event "fetched".
  - deploy:update
    - Create and define release path.
    - Remote copy project.
    - Emit event "updated".
  - deploy:publish
    - Update symlink.
    - Emit event "published".
  - deploy:clean
    - Remove old releases.
    - Emit event "cleaned".
- rollback
  - rollback:init
    - Define release path.
    - Emit event "rollback".
  - deploy:publish
    - Update symlink.
    - Emit event "published".
  - deploy:clean
    - Remove old releases.
    - Emit event "cleaned".

## License

MIT
