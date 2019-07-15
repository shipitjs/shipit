# shipit-cli

[![Build Status][build-badge]][build]
[![version][version-badge]][package]
[![MIT License][license-badge]][license]

Shipit command line interface.

```
npm install --save-dev shipit-cli
```

## Usage

```
Usage: shipit <environment> <tasks...>

Options:

  -V, --version         output the version number
  --shipitfile <file>   Specify a custom shipitfile to use
  --require <files...>  Script required before launching Shipit
  --tasks               List available tasks
  --environments        List available environments
  -h, --help            output usage information
```

## `shipitfile.js`

```js
module.exports = shipit => {
  shipit.initConfig({
    staging: {
      servers: 'myproject.com',
    },
  })

  shipit.task('pwd', async () => {
    await shipit.remote('pwd')
  })
}
```

## API

#### shipit.task(name, [deps], fn)

Create a new Shipit task. If a promise is returned task will wait for completion.

```js
shipit.task('hello', async () => {
  await shipit.remote('echo "hello on remote"')
  await shipit.local('echo "hello from local"')
})
```

#### shipit.blTask(name, [deps], fn)

Create a new Shipit task that will block other tasks during its execution. If a promise is returned other task will wait before start.

```js
shipit.blTask('hello', async () => {
  await shipit.remote('echo "hello on remote"')
  await shipit.local('echo "hello from local"')
})
```

#### shipit.start(tasks)

Run Shipit tasks.

```js
shipit.start('task')
shipit.start('task1', 'task2')
shipit.start(['task1', 'task2'])
```

#### shipit.local(command, [options])

Run a command locally and streams the result. See [ssh-pool#exec](https://github.com/shipitjs/shipit/tree/master/packages/ssh-pool#exec).

```js
shipit
  .local('ls -lah', {
    cwd: '/tmp/deploy/workspace',
  })
  .then(({ stdout }) => console.log(stdout))
  .catch(({ stderr }) => console.error(stderr))
```

#### shipit.remote(command, [options])

Run a command remotely and streams the result. Run a command locally and streams the result. See [ssh-pool#connection.run](https://github.com/shipitjs/shipit/tree/master/packages/ssh-pool#connectionruncommand-options).

```js
shipit
  .remote('ls -lah')
  .then(([server1Result, server2Result]) => {
    console.log(server1Result.stdout)
    console.log(server2Result.stdout)
  })
  .catch(error => {
    console.error(error.stderr)
  })
```

#### shipit.copyToRemote(src, dest, [options])

Make a remote copy from a local path to a remote path. See [ssh-pool#connection.copyToRemote](https://github.com/shipitjs/shipit/tree/master/packages/ssh-pool#connectioncopytoremotesrc-dest-options).

```js
shipit.copyToRemote('/tmp/workspace', '/opt/web/myapp')
```

#### shipit.copyFromRemote(src, dest, [options])

Make a remote copy from a remote path to a local path. See [ssh-pool#connection.copyFromRemote](https://github.com/shipitjs/shipit/tree/master/packages/ssh-pool#connectioncopyfromremotesrc-dest-options).

```js
shipit.copyFromRemote('/opt/web/myapp', '/tmp/workspace')
```

#### shipit.log(...args)

Log using Shipit, same API as `console.log`.

```js
shipit.log('hello %s', 'world')
```

## Workflow tasks

When the system initializes it automatically emits events:

- Emit event "init"
- Emit event "init:after_ssh_pool"

Each shipit task also generates events:

- Emit event "task_start"
- Emit event "task_stop"
- Emit event "task_err"
- Emit event "task_not_found"

Inside the task events, you can test for the task name.

```js
shipit.on('task_start', event => {
  if (event.task == 'first_task') {
    shipit.log("I'm the first task")
  }
})
```

## License

MIT

[build-badge]: https://img.shields.io/travis/shipitjs/shipit.svg?style=flat-square
[build]: https://travis-ci.org/shipitjs/shipit
[version-badge]: https://img.shields.io/npm/v/shipit-cli.svg?style=flat-square
[package]: https://www.npmjs.com/package/shipit-cli
[license-badge]: https://img.shields.io/npm/l/shipit-cli.svg?style=flat-square
[license]: https://github.com/shipitjs/shipit/blob/master/LICENSE
