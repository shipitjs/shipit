var util = require('util');
var childProcess = require('child_process');
var sshPool = require('ssh-pool');
var _ = require('lodash');
var LineWrapper = require('stream-line-wrapper');
var Orchestrator = require('orchestrator');
var chalk = require('chalk');
var prettyTime = require('pretty-hrtime');
var Promise = require('bluebird');

// Expose module.
module.exports = Shipit;

/**
 * Initialize a new `Shipit`.
 */

function Shipit(options) {
  this.options = _.defaults(options || {}, {
    stdout: process.stdout,
    stderr: process.stderr,
    log: console.log.bind(console)
  });
  this.environment = this.options.environment;

  this.initializeEvents();

  if (this.options.stdout === process.stdout)
    process.stdout.setMaxListeners(100);

  if (this.options.stderr === process.stderr)
    process.stderr.setMaxListeners(100);

  // Inherits from EventEmitter
  Orchestrator.call(this);
}

/**
 * Inherits from Orchestrator.
 */

util.inherits(Shipit, Orchestrator);

/**
 * Initialize the `shipit`.
 *
 * @returns {shipit} for chaining
 */

Shipit.prototype.initialize = function () {
  this.emit('init');
  return this.initSshPool();
};

/**
 * Initialize events.
 */

Shipit.prototype.initializeEvents = function () {
  var shipit = this;
  var log = shipit.log.bind(shipit);

  shipit.on('task_start', function (e) {
    // Specific log for noop functions.
    if (shipit.tasks[e.task].fn.toString() === 'function () {}')
      return;

    log('\nRunning', '\'' + chalk.cyan(e.task) + '\' task...');
  });

  shipit.on('task_stop', function (e) {
    var task = shipit.tasks[e.task];
    // Specific log for noop functions.
    if (task.fn.toString() === 'function () {}')
      return log(
        'Finished', '\'' + chalk.cyan(e.task) + '\'',
        chalk.cyan('[ ' + task.dep.join(', ') + ' ]')
      );

    var time = prettyTime(e.hrDuration);
    log(
      'Finished', '\'' + chalk.cyan(e.task) + '\'',
      'after', chalk.magenta(time)
    );
  });

  shipit.on('task_err', function (e) {
    var msg = formatError(e);
    var time = prettyTime(e.hrDuration);
    log(
      '\'' + chalk.cyan(e.task) + '\'',
      chalk.red('errored after'),
      chalk.magenta(time)
    );
    log(msg);
  });

  shipit.on('task_not_found', function (err) {
    log(
      chalk.red('Task \'' + err.task + '\' is not in your shipitfile')
    );
    log('Please check the documentation for proper shipitfile formatting');
  });
};

/**
 * Format orchestrator error.
 *
 * @param {Error} e
 * @returns {Error}
 */

function formatError(e) {
  if (!e.err) {
    return e.message;
  }

  // PluginError
  if (typeof e.err.showStack === 'boolean') {
    return e.err.toString();
  }

  // normal error
  if (e.err.stack) {
    return e.err.stack;
  }

  // unknown (string, number, etc.)
  return new Error(String(e.err)).stack;
}

/**
 * Initialize SSH connections.
 *
 * @returns {shipit} for chaining
 */

Shipit.prototype.initSshPool = function () {
  if (!this.config.servers)
    throw new Error('Servers not filled');

  var servers = _.isArray(this.config.servers) ? this.config.servers : [this.config.servers];
  this.pool = new sshPool.ConnectionPool(servers, _.extend({}, this.options, _.pick(this.config, 'key', 'strict')));
  return this;
};

/**
 * Initialize shipit configuration.
 *
 * @param {Object} config
 * @returns {shipit} for chaining
 */

Shipit.prototype.initConfig = function (config) {
  config = config || {};

  if (!config[this.environment])
    throw new Error('Environment "' + this.environment + '" not found in config');

  this.config = _.assign({
    branch: 'master',
    keepReleases: 5,
    shallowClone: false
  }, config.default || {}, config[this.environment]);
  return this;
};

/**
 * Run a command locally.
 *
 * @param {String} command
 * @param {Object} options
 * @param {Function} cb
 * @returns {ChildObject}
 */

Shipit.prototype.local = function (command, options, cb) {
  var shipit = this;

  // local(command, cb)
  if (_.isFunction(options)) {
    cb = options;
    options = undefined;
  }

  return new Promise(function (resolve, reject) {
    shipit.log('Running "%s" on local.', command);

    options = _.defaults(options || {}, {
      maxBuffer: 1000 * 1024
    });

    var stdoutWrapper = new LineWrapper({prefix: '@ '});
    var stderrWrapper = new LineWrapper({prefix: '@ '});

    var child = childProcess.exec(command, options, function (err, stdout, stderr) {
      if (err) return reject(err);
      resolve({
        child: child,
        stdout: stdout,
        stderr: stderr
      });
    });

    if (shipit.options.stdout)
      child.stdout.pipe(stdoutWrapper).pipe(shipit.options.stdout);

    if (shipit.options.stderr)
      child.stderr.pipe(stderrWrapper).pipe(shipit.options.stderr);
  }).nodeify(cb);
};

/**
 * Run a command remotely.
 *
 * @param {String} command
 * @param {Object} options
 * @param {Function} cb
 * @returns {ChildObject}
 */

Shipit.prototype.remote = function (command, options, cb) {
  if (options && options.cwd) {
    command = 'cd "' + options.cwd.replace(/"/g, '\\"') + '" && ' + command;
    delete options.cwd;
  }
  return this.pool.run(command, options, cb);
};

/**
 * Copy from local to remote or vice versa.
 *
 * @param {String} src
 * @param {String} dest
 * @param {Function} callback
 * @returns {ChildObject}
 */

Shipit.prototype.remoteCopy = function (src, dest, options, callback) {

  // remoteCopy(command, callback)
  if (_.isFunction(options)) {
    callback = options;
    options = undefined;
  }

  options = _.defaults(options || {}, {
    ignores: this.config && this.config.ignores ? this.config.ignores : [],
    rsync: this.config && this.config.rsync ? this.config.rsync : []
  });

  return this.pool.copy(src, dest, options, callback);
};

/**
 * Log.
 *
 * @see console.log
 */

Shipit.prototype.log = function () {
  this.options.log.apply(null, arguments);
};

/**
 * Create a new blocking task.
 *
 * @see shipit.task
 */

Shipit.prototype.blTask = function (name) {
  this.task.apply(this, arguments);

  var task = this.tasks[name];
  task.blocking = true;
  return task;
};

/**
 * Test if we are ready to run a task.
 * Implement blocking task.
 */

Shipit.prototype._readyToRunTask = function () {
  if (_.find(this.tasks, {running: true, blocking: true}))
    return false;

  return Orchestrator.prototype._readyToRunTask.apply(this, arguments);
};
