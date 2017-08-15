# ssh-pool
[![Build Status](https://travis-ci.org/shipitjs/ssh-pool.svg?branch=master)](https://travis-ci.org/shipitjs/ssh-pool)
[![Dependency Status](https://david-dm.org/shipitjs/ssh-pool.svg?theme=shields.io)](https://david-dm.org/shipitjs/ssh-pool)
[![devDependency Status](https://david-dm.org/shipitjs/ssh-pool/dev-status.svg?theme=shields.io)](https://david-dm.org/shipitjs/ssh-pool#info=devDependencies)

Run remote commands over a pool of server using SSH.

## Install

```
npm install ssh-pool
```

## Usage

```js
var sshPool = require('ssh-pool');

var pool = new sshPool.ConnectionPool(['user@server1', 'user@server2']);

pool.run('hostname')
.then(function (results) {
  console.log(results[0].stdout); // 'server1'
  console.log(results[1].stdout); // 'server2'
});
```

### new Connection(options)

Create a new connection to run command on a remote server.

**Arguments:**

```
@param {object} options Options
@param {string|object} options.remote Remote
@param {Stream} [options.stdout] Stdout stream
@param {Stream} [options.stderr] Stderr stream
@param {string} [options.key] SSH key
@param {function} [options.log] Log method
```

The remote can use the shorthand syntax or an object:

```js
// Default user will be deploy and ssh default port.
new Connection({remote: 'localhost'});

// Default ssh port will be used.
new Connection({remote: 'user@localhost'});

// Custom user and custom port.
new Connection({remote: 'user@localhost:22'});

// Object syntax.
new Connection({remote: {user: 'user', host: 'localhost', port: 22}});
```

The log method is used to log output directly:

```js
var connection = new Connection({
  remote: 'localhost',
  log: console.log.bind(console)
});

connection.run('pwd');

// Will output:
// Running "pwd" on host "localhost".
// @localhost /my/directory
```

### connection.run(command, [options], [cb])

Run a command on the remote server, you can specify custom `childProcess.exec` options. A callback or a promise can be used.

**Arguments:**

```
@param {string} command Command
@param {object} [options] Exec options
@param {function} [cb] Callback
@returns {Promise}
```

```js
connection.run('ls', {env: {NODE_ENV: 'test'}})
.then(function (result) {
  result.stdout; // stdout output
  result.stderr; // stderr output
  result.child; // child object
});
```

### connection.copy(src, dest, [options], [cb])

Copy a file or a directory to a remote server, you can specify custom `childProcess.exec` options. A callback or a promise can be used.

**Arguments:**

```
@param {string} src Source
@param {string} dest Destination
@param {object} [options] Exec Options
@param {function} [cb] Callback
@returns {Promise}
```

```js
connection.copy('./localfile', '/remote-file', {env: {NODE_ENV: 'test'}})
.then(function (result) {
  result.stdout; // stdout output
  result.stderr; // stderr output
  result.child; // child object
});
```

### new ConnectionPool(connections, [options])

Create a new pool of connections and custom options for all connections.

If you use the short syntax, connections will be automatically created, else you can use previous created connections.

```js
// Use shorthand.
var pool = new ConnectionPool(['server1', 'server2']);

// Use previously created connections.
var connection1 = new Connection({remote: 'server1'});
var connection2 = new Connection({remote: 'server2'});
var pool = new ConnectionPool([connection1, connection2]);
```

### pool.run(command, [options], [cb])

Same as `connection.run`, except that the command is executed in parallel on each server of the pool.

**Arguments:**

```
@param {string} command Command
@param {object} [options] Options
@param {function} [cb] Callback
@returns {Promise}
```

```js
pool.run('hostname')
.then(function (results) {
  // ...
});
```

### pool.copy(src, dest, [options], [cb])

Same as `connection.copy`, except that the copy is done in parallel on each server of the pool.

**Options:**

```
@param {object} [options.direction] Direction of copy
```

Also all exec options are supported.

**Arguments:**

```
@param {string} src Source
@param {string} dest Destination
@param {object} options Options
@param {function} [cb] Callback
@returns {Promise}
```

```js
pool.copy('./localfile', '/remote-file')
.then(function (results) {
  // ...
});
```


## License

MIT
