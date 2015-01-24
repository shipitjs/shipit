# grunt-shipit 

[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/shipitjs/shipit-cli?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![Build Status](https://travis-ci.org/shipitjs/shipit-cli.svg?branch=master)](https://travis-ci.org/shipitjs/shipit-cli)
[![Dependency Status](https://david-dm.org/shipitjs/shipit-cli.svg?theme=shields.io)](https://david-dm.org/shipitjs/shipit-cli)
[![devDependency Status](https://david-dm.org/shipitjs/shipit-cli/dev-status.svg?theme=shields.io)](https://david-dm.org/shipitjs/shipit-cli#info=devDependencies)

![Shipit logo](https://cloud.githubusercontent.com/assets/266302/3756454/81df9f46-182e-11e4-9da6-b2c7a6b84136.png)

Shipit is an automation engine and a deployment tool written for node / iojs. Shipit was built to be a Capistrano alternative for people who want to write tasks in JavaScript and don't have a piece of ruby in their beautiful codebase.

**Features:**

- Full JavaScript 
- Login and interactive session
- Task flow based on [orchestrator](https://github.com/orchestrator/orchestrator) ([gulp](http://gulpjs.com/) core)
- Blocking tasks
- [Official deploy task](https://github.com/shipitjs/shipit-deploy-task)
- Easily extendable

## Install

It's recommended to install Shipit locally in your project.

```
npm install --save-dev shipit-cli
```

## Getting Started

One shipit is installed, you must create a shipitfile.js, if you are familiar with grunt or gulp, this is the same.

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

The binary `shipit` is located in `./node_modules/.bin/shipit`. I recommend you to add in your path: `./node_modules/.bin`.

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
  shipit.run('start-server');
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

#### shipit.blTask(name, deps, fn)

Create a new Shipit task, that will block other tasks during its execution. If you use these type of task, the flow will be exactly the same as if you use [grunt](http://gruntjs.com).

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

#### shipit.log()

Log using Shipit, same API as `console.log`.

```js
shipit.log('hello %s', 'world');
```

## Dependencies

- OpenSSH 5+

## Deploy using Shipit

The best way to deploy using Shipit is to use the [Shipit deploy task](https://github.com/shipitjs/shipit-deploy-task).

## License

MIT
