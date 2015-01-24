var util = require('util');
var events = require('events');
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

  this.initializeOrchestator();

  if (this.options.stdout === process.stdout)
    process.stdout.setMaxListeners(100);

  if (this.options.stderr === process.stderr)
    process.stderr.setMaxListeners(100);

  // Inherits from EventEmitter
  events.EventEmitter.call(this);
}

/**
 * Inherits from EventEmitter.
 */

util.inherits(Shipit, events.EventEmitter);

/**
 * Initialize the `shipit`.
 *
 * @returns {shipit} for chaining
 */

Shipit.prototype.initialize = function () {
  return this.initSshPool();
};

/**
 * Initialize orchestrator.
 */

Shipit.prototype.initializeOrchestator = function () {
  this.orchestrator = new Orchestrator();
  var log = this.log.bind(this);

  this.orchestrator.on('task_start', function (e) {
    log('Starting', '\'' + chalk.cyan(e.task) + '\'...');
  });

  this.orchestrator.on('task_stop', function (e) {
    var time = prettyTime(e.hrDuration);
    log(
      'Finished', '\'' + chalk.cyan(e.task) + '\'',
      'after', chalk.magenta(time)
    );
  });

  this.orchestrator.on('task_err', function (e) {
    var msg = formatError(e);
    var time = prettyTime(e.hrDuration);
    log(
      '\'' + chalk.cyan(e.task) + '\'',
      chalk.red('errored after'),
      chalk.magenta(time)
    );
    log(msg);
  });

  this.orchestrator.on('task_not_found', function (err) {
    log(
      chalk.red('Task \'' + err.task + '\' is not in your shipitfile')
    );
    log('Please check the documentation for proper shipitfile formatting');
    process.exit(1);
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
  this.pool = new sshPool.ConnectionPool(servers, _.extend({}, this.options, _.pick(this.config, 'key')));
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

  this.config = _.extend({
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
  return this.pool.run(command, options, cb);
};

/**
 * Copy from local to remote.
 *
 * @param {String} src
 * @param {String} dest
 * @param {Function} callback
 * @returns {ChildObject}
 */

Shipit.prototype.remoteCopy = function (src, dest, callback) {
  var ignores = this.config && this.config.ignores ? this.config.ignores : [];
  return this.pool.copy(src, dest, {ignores: ignores}, callback);
};

/**
 * Add a task to shipit.
 *
 * @param {string} name Name of the task
 * @param {string[]} [dep] Dependencies
 * @param {function} [fn] Function of task
 */

Shipit.prototype.task = function () {
  this.orchestrator.add.apply(this.orchestrator, arguments);
};

/**
 * Run tasks.
 *
 * @param {string[]} tasks Tasks
 */

Shipit.prototype.run = function (tasks) {
  this.orchestrator.start.apply(this.orchestrator, arguments);
};

/**
 * Log.
 */

Shipit.prototype.log = function () {
  this.options.log.apply(null, arguments);
};
