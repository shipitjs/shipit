# Shipit

[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/shipitjs/shipit?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![Build Status](https://travis-ci.org/shipitjs/shipit.svg?branch=master)](https://travis-ci.org/shipitjs/shipit)
[![Dependency Status](https://david-dm.org/shipitjs/shipit.svg?theme=shields.io)](https://david-dm.org/shipitjs/shipit)
[![devDependency Status](https://david-dm.org/shipitjs/shipit/dev-status.svg?theme=shields.io)](https://david-dm.org/shipitjs/shipit#info=devDependencies)
[![Inline docs](http://inch-ci.org/github/shipitjs/shipit.svg?branch=master)](http://inch-ci.org/github/shipitjs/shipit)

![Shipit logo](https://cloud.githubusercontent.com/assets/266302/3756454/81df9f46-182e-11e4-9da6-b2c7a6b84136.png)

Shipit is an automation engine and a deployment tool written for node / iojs.

Shipit was built to be a Capistrano alternative for people who don't know ruby, or who experienced some issues with it. If you want to write tasks in JavaScript and enjoy the node ecosystem, Shipit is also for you.

You can automate anything with Shipit but most of the time you will want to deploy your project using
the [Shipit deploy task](https://github.com/shipitjs/shipit-deploy-task).

**Features:**

- Full JavaScript (all npm package availables)
- Task flow based on [orchestrator](https://github.com/orchestrator/orchestrator) ([gulp](http://gulpjs.com/) core)
- [Official deploy task](https://github.com/shipitjs/shipit-deploy)
- Login and interactive SSH commands
- Easily extendable

## Install

### Globally

```
npm install --global shipit-cli
```

### Locally

```
npm install --save-dev shipit-cli
```

## Getting Started

Once shipit is installed, you must create a shipitfile.js.

If you are familiar with grunt or gulp, you will feel at home.

### Create a `shipitfile.js`

```js
module.exports = function (shipit) {
  shipit.initConfig({
    staging: {
      servers: 'myproject.com'
    }
  });

  shipit.task('pwd', function () {
    return shipit.remote('pwd');
  });
};
```

### Launch command

```
shipit staging pwd
```

## Deploy using Shipit

You can easily deploy a project using Shipit and its plugin [shipit-deploy](https://github.com/shipitjs/shipit-deploy).

### Example `shipitfile.js`

```js
module.exports = function (shipit) {
  require('shipit-deploy')(shipit);

  shipit.initConfig({
    default: {
      workspace: '/tmp/github-monitor',
      deployTo: '/tmp/deploy_to',
      repositoryUrl: 'https://github.com/user/repo.git',
      ignores: ['.git', 'node_modules'],
      rsync: ['--del'],
      keepReleases: 2,
      key: '/path/to/key',
      shallowClone: true
    },
    staging: {
      servers: 'user@myserver.com'
    }
  });
};
```

To deploy on staging, you must use the following command :

```
shipit staging deploy
```

You can rollback to the previous releases with the command :

```
shipit staging rollback
```

## Usage

```
shipit <environment> <tasks ...>
```

### Options

#### servers

Type: `String` or `Array<String>`

Servers on which the project will be deployed. Pattern must be `user@myserver.com` if user is not specified (`myserver.com`) the default user will be "deploy".

#### key

Type: `String`

Path to SSH key

### Events

You can add custom event and listen to events.

```js
shipit.task('build', function () {
  // ...
  shipit.emit('built');
});

shipit.on('built', function () {
  shipit.start('start-server');
});
```

Shipit emits the `init` event once initialized, before any tasks are run.

### Methods

#### shipit.task(name, [deps], fn)

Create a new Shipit task, if you are familiar with gulp, this is the same API. You can use a callback or a promise in your task.

For more documentation, please refer to [orchestrator documentation](https://github.com/orchestrator/orchestrator#orchestratoraddname-deps-function).

```js
shipit.task('pwd', function () {
  return shipit.remote('pwd');
});
```

#### shipit.blTask(name, [deps], fn)

Create a new Shipit task that will block other tasks during its execution (synchronous).

If you use these type of task, the flow will be exactly the same as if you use [grunt](http://gruntjs.com).

```js
shipit.blTask('pwd', function () {
  return shipit.remote('pwd');
});
```

#### shipit.start(tasks)

Run Shipit tasks.

For more documentation, please refer to [orchestrator documentation](https://github.com/orchestrator/orchestrator#orchestratorstarttasks-cb).

```js
shipit.start('task');
shipit.start('task1', 'task2');
shipit.start(['task1', 'task2']);
```

#### shipit.local(command, [[options]](https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback), [callback])

Run a command locally and streams the result. This command take a callback or return a promise. It returns a result object containing stdout, stderr and the child process object.

```js
shipit.local('ls -lah', {cwd: '/tmp/deploy/workspace'}).then(function (res) {
  console.log(res.stdout);
  console.log(res.stderr);
  res.child.stdout.pipe(...);
});
```

#### shipit.remote(command, [[options]](https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback), [callback])

Run a command remotely and streams the result. This command take a callback or return a promise.

If you want to run a `sudo` command, the ssh connection will use the TTY mode automatically.

It returns an array of result objects containing stdout, stderr and the child process object. The list of results matchs the list of servers specified in configuration.

```js
shipit.remote('ls -lah').then(function (res) {
  console.log(res[0].stdout); // stdout for first server
  console.log(res[0].stderr); // stderr for first server
  res[0].child.stdout.pipe(...); // child of first server

  console.log(res[1].stdout); // stdout for second server
  console.log(res[1].stderr); // stderr for second server
  res[0].child.stdout.pipe(...); // child of second server
});
```

#### shipit.remoteCopy(src, dest, [options], [callback])

Make a remote copy from a local path to a dest path.

```js
shipit.remoteCopy('/tmp/workspace', '/opt/web/myapp').then(...);
```

#### shipit.log()

Log using Shipit, same API as `console.log`.

```js
shipit.log('hello %s', 'world');
```

## Dependencies

- [OpenSSH](http://www.openssh.com/) 5+
- [rsync](https://rsync.samba.org/) 3+

### Customising environments

You can overwrite all default variables defined as part of the `default` object.

```js
module.exports = function (shipit) {
  shipit.initConfig({
    staging: {
      servers: 'staging.myproject.com',
      workspace: '/home/vagrant/website'
      branch: 'dev'
    },
    production: {
      servers: [{
        host: 'app1.myproject.com',
        user: 'john',
      }, {
        host: 'app2.myproject.com',
        user: 'rob',
      }],
      branch: 'production',
      workspace: '/var/www/website'
    }
  });

  ...
  shipit.task('pwd', function () {
    return shipit.remote('pwd');
  });
  ...
};
```

### Async Config

If you can't call `shipit.initConfig(...)` right away because
you need to get data asynchronously to do so, you can return
a promise from the module:

```js
module.exports = function (shipit) {
  return getServersAsync().then( function( servers ) {
    shipit.initConfig({
      production: {
        servers: servers,
        // ...
      }
    })
  } )
}
```

If you need to use a function that works with callbacks
instead of promises, you can wrap it manually:


```js
module.exports = function (shipit) {
  return new Promise( function( resolve ) {
    getServersAsync( function( servers ) {
      shipit.initConfig({
        production: {
          servers: servers,
          // ...
        }
      })
      resolve()
    } )
  } )
}
```

## Known Plugins

### Official

- [shipit-deploy](https://github.com/shipitjs/shipit-deploy)

### Third Party

- [shipit-shared](https://github.com/timkelty/shipit-shared)
- [shipit-db](https://github.com/timkelty/shipit-db)
- [shipit-assets](https://github.com/timkelty/shipit-assets)
- [shipit-ssh](https://github.com/timkelty/shipit-ssh)
- [shipit-utils](https://github.com/timkelty/shipit-utils)
- [shipit-npm](https://github.com/callerc1/shipit-npm)
- [shipit-aws](https://github.com/KrashStudio/shipit-aws)
- [shipit-captain](https://github.com/timkelty/shipit-captain/)
- [shipit-bower](https://github.com/willsteinmetz/shipit-bower)
- [shipit-composer](https://github.com/jeremyzahner/shipit-composer)

## Who use Shipit?

- [Le Monde](http://www.lemonde.fr)
- [Ghost blogging platform](https://ghost.org/)
- [Fusionary](http://fusionary.com)

## License

MIT
