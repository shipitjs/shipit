<h1 align="center">
  <img src="https://raw.githubusercontent.com/shipitjs/shipit/master/resources/shipit-logo-light.png" alt="Shipit" title="Shipit" width="300">
</h1>
<p align="center" style="font-size: 1.2rem;">Universal automation and deployment tool ⛵️</p>

[![Build Status][build-badge]][build]
[![version][version-badge]][package]
[![MIT License][license-badge]][license]

[![PRs Welcome][prs-badge]][prs]

[![Watch on GitHub][github-watch-badge]][github-watch]
[![Star on GitHub][github-star-badge]][github-star]
[![Tweet][twitter-badge]][twitter]

## Install shipit command line tools and shipit-deploy in your project

```
npm install --save-dev shipit-cli
npm install --save-dev shipit-deploy
```

Shipit is an automation engine and a deployment tool.

Shipit provides a good alternative to Capistrano or other build tools. It is easy to deploy or to automate simple tasks on your remote servers.

**Features:**

- Write your task using JavaScript
- Task flow based on [orchestrator](https://github.com/orchestrator/orchestrator)
- Login and interactive SSH commands
- Easily extendable

## Deploy using Shipit

1.  Create a `shipitfile.js` at the root of your project

```js
// shipitfile.js
module.exports = shipit => {
  // Load shipit-deploy tasks
  require('shipit-deploy')(shipit)

  shipit.initConfig({
    default: {
      deployTo: '/var/apps/super-project',
      repositoryUrl: 'https://github.com/user/super-project.git',
    },
    staging: {
      servers: 'deploy@staging.super-project.com',
    },
  })
}
```

2.  Run deploy command using [npx](https://www.npmjs.com/package/npx): `npx shipit staging deploy`

3.  You can rollback using `npx shipit staging rollback`

## Recipes

### Copy config file

Add a custom task in your `shipitfile.js` and run `copyToRemote`.

```js
// shipitfile.js
module.exports = shipit => {
  /* ... */

  shipit.task('copyConfig', async () => {
    await shipit.copyToRemote(
      'config.json',
      '/var/apps/super-project/config.json',
    )
  })
}
```

### Use events

You can add custom event and listen to events.

```js
shipit.task('build', function() {
  // ...
  shipit.emit('built')
})

shipit.on('built', function() {
  shipit.start('start-server')
})
```

Shipit emits the `init` event once initialized, before any tasks are run.

### Use Babel in your `shipitfile.js`

Instead of using a `shipitfile.js`, use `shipitfile.babel.js`:

```js
// shipitfile.babel.js
export default shipit => {
  shipit.initConfig({
    /* ... */
  })
}
```

### Customizing environments

You can overwrite all default variables defined as part of the `default` object:

```js
module.exports = shipit => {
  shipit.initConfig({
    default: {
      branch: 'dev',
    },
    staging: {
      servers: 'staging.myproject.com',
      workspace: '/home/vagrant/website'
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

### Asynchronous config

If you can't call `shipit.initConfig(...)` right away because
you need to get data asynchronously to do so, you can return
a promise from the module:

```js
module.exports = async shipit => {
  const servers = await getServers()
  shipit.initConfig({
    production: {
      servers: servers,
      // ...
    },
  })
}
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

### Global configuration

#### ignores

Type: `Array<String>`

List of files excluded in `copyFromRemote` or `copyToRemote` methods.

#### key

Type: `String`

Path to SSH key.

#### servers

Type: `String` or `Array<String>`

The server can use the shorthand syntax or an object:

- `user@host`: user and host
- `user@host:4000`: user, host and port
- `{ user, host, port, extraSshOptions }`: an object

### Shipit Deploy configuration

#### asUser

Type: `String`

Allows you to ‘become’ another user, different from the user that logged into the machine (remote user). 

#### deleteOnRollback

Type: `Boolean`, default to `false`

Delete release when a rollback is done.

#### deployTo

Type: `String`

Directory where the code will be deployed on remote servers.

#### keepReleases

Type: `Number`

Number of releases kept on remote servers.

#### repositoryUrl

Type: `String`

Repository URL to clone, must be defined using `https` or `git+ssh` format.

#### shallowClone

Type: `Boolean`, default `true`

Clone only the last commit of the repository.

#### workspace

Type: `String`

If `shallowClone` is set to `false`, this directory will be used to clone the repository before deploying it.

#### verboseSSHLevel

Type: `Number`, default `0`

SSH verbosity level to use when connecting to remote servers. **0** (none), **1** (-v), **2** (-vv), **3** (-vvv).

### API

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

Run a command remotely and streams the result. See [ssh-pool#connection.run](https://github.com/shipitjs/shipit/tree/master/packages/ssh-pool#connectionruncommand-options).

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

## Dependencies

- [OpenSSH](http://www.openssh.com/) 5+
- [rsync](https://rsync.samba.org/) 3+

## Known Plugins

### Official

- [shipit-deploy](https://github.com/shipitjs/shipit/tree/master/packages/shipit-deploy)

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
- [shipit-bastion](https://github.com/BrokerageEngine/shipit-bastion)
- [shipit-yaml](https://github.com/davidbernal/shipit-yaml)
- [shipit-conditional](https://github.com/BrokerageEngine/shipit-conditional)

## Who use Shipit?

- [Le Monde](http://www.lemonde.fr)
- [Ghost blogging platform](https://ghost.org/)
- [Fusionary](http://fusionary.com)

## License

MIT

[build-badge]: https://img.shields.io/travis/shipitjs/shipit.svg?style=flat-square
[build]: https://travis-ci.org/shipitjs/shipit
[version-badge]: https://img.shields.io/npm/v/shipit-cli.svg?style=flat-square
[package]: https://www.npmjs.com/package/shipit-cli
[license-badge]: https://img.shields.io/npm/l/shipit-cli.svg?style=flat-square
[license]: https://github.com/shipitjs/shipit/blob/master/LICENSE
[prs-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[prs]: http://makeapullrequest.com
[github-watch-badge]: https://img.shields.io/github/watchers/shipitjs/shipit.svg?style=social
[github-watch]: https://github.com/shipitjs/shipit/watchers
[github-star-badge]: https://img.shields.io/github/stars/shipitjs/shipit.svg?style=social
[github-star]: https://github.com/shipitjs/shipit/stargazers
[twitter]: https://twitter.com/intent/tweet?text=Check%20out%20ShipitJS!%20https://github.com/shipitjs/shipit%20%F0%9F%91%8D
[twitter-badge]: https://img.shields.io/twitter/url/https/github.com/shipitjs/shipit.svg?style=social
