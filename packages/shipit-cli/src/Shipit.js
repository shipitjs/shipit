/* eslint-disable no-console */
import { ConnectionPool, exec } from 'ssh-pool'
import LineWrapper from 'stream-line-wrapper'
import Orchestrator from 'orchestrator'
import chalk from 'chalk'
import prettyTime from 'pretty-hrtime'

/**
 * An ExecResult returned when a command is executed with success.
 * @typedef {object} ExecResult
 * @property {Buffer} stdout
 * @property {Buffer} stderr
 * @property {ChildProcess} child
 */

/**
 * An ExecResult returned when a command is executed with success.
 * @typedef {object} MultipleExecResult
 * @property {Buffer} stdout
 * @property {Buffer} stderr
 * @property {ChildProcess[]} children
 */

/**
 * An ExecError returned when a command is executed with an error.
 * @typedef {Error} ExecError
 * @property {Buffer} stdout
 * @property {Buffer} stderr
 * @property {ChildProcess} child
 */

/**
 * Format orchestrator error.
 *
 * @param {Error} e
 * @returns {Error}
 */
function formatError(e) {
  if (!e.err) {
    return e.message
  }

  // PluginError
  if (typeof e.err.showStack === 'boolean') {
    return e.err.toString()
  }

  // normal error
  if (e.err.stack) {
    return e.err.stack
  }

  // unknown (string, number, etc.)
  return new Error(String(e.err)).stack
}

class Shipit extends Orchestrator {
  constructor(options) {
    super()

    const defaultOptions = {
      stdout: process.stdout,
      stderr: process.stderr,
      log: console.log.bind(console),
    }

    this.config = {}
    this.globalConfig = {}
    this.options = { ...defaultOptions, ...options }
    this.environment = options.environment

    this.initializeEvents()

    if (this.options.stdout === process.stdout)
      process.stdout.setMaxListeners(100)

    if (this.options.stderr === process.stderr)
      process.stderr.setMaxListeners(100)
  }

  /**
   * Initialize the `shipit`.
   *
   * @returns {Shipit} for chaining
   */
  initialize() {
    if (!this.globalConfig[this.environment])
      throw new Error(`Environment '${this.environment}' not found in config`)

    this.emit('init')
    return this.initSshPool()
  }

  /**
   * Initialize events.
   */
  initializeEvents() {
    this.on('task_start', e => {
      // Specific log for noop functions.
      if (this.tasks[e.task].fn.toString() === 'function () {}') return

      this.log('\nRunning', `'${chalk.cyan(e.task)}' task...`)
    })

    this.on('task_stop', e => {
      const task = this.tasks[e.task]
      // Specific log for noop functions.
      if (task.fn.toString() === 'function () {}') {
        this.log(
          'Finished',
          `'${chalk.cyan(e.task)}'`,
          chalk.cyan(`[ ${task.dep.join(', ')} ]`),
        )
        return
      }

      const time = prettyTime(e.hrDuration)
      this.log(
        'Finished',
        `'${chalk.cyan(e.task)}'`,
        'after',
        chalk.magenta(time),
      )
    })

    this.on('task_err', e => {
      const msg = formatError(e)
      const time = prettyTime(e.hrDuration)
      this.log(
        `'${chalk.cyan(e.task)}'`,
        chalk.red('errored after'),
        chalk.magenta(time),
      )
      this.log(msg)
    })

    this.on('task_not_found', err => {
      this.log(chalk.red(`Task '${err.task}' is not in your shipitfile`))
      this.log(
        'Please check the documentation for proper shipitfile formatting',
      )
    })
  }

  /**
   * Initialize SSH connections.
   *
   * @returns {Shipit} for chaining
   */
  initSshPool() {
    if (!this.config.servers) throw new Error('Servers not filled')

    const servers = Array.isArray(this.config.servers)
      ? this.config.servers
      : [this.config.servers]

    const options = {
      ...this.options,
      key: this.config.key,
      strict: this.config.strict,
      verbosityLevel:
        this.config.verboseSSHLevel === undefined
          ? 0
          : this.config.verboseSSHLevel,
    }

    this.pool = new ConnectionPool(servers, options)

    this.emit('init:after_ssh_pool')
    return this
  }

  /**
   * Initialize shipit configuration.
   *
   * @param {object} config
   * @returns {Shipit} for chaining
   */
  initConfig(config = {}) {
    this.globalConfig = config
    this.config = {
      ...config.default,
      ...config[this.environment],
    }
    return this
  }

  /**
   * Run a command locally.
   *
   * @param {string} command
   * @param {object} options
   * @returns {ChildObject}
   */
  local(command, { stdout, stderr, ...cmdOptions } = {}) {
    this.log('Running "%s" on local.', command)
    const prefix = '@ '
    return exec(command, cmdOptions, child => {
      if (this.options.stdout)
        child.stdout.pipe(new LineWrapper({ prefix })).pipe(this.options.stdout)

      if (this.options.stderr)
        child.stderr.pipe(new LineWrapper({ prefix })).pipe(this.options.stderr)
    })
  }

  /**
   * Run a command remotely.
   *
   * @param {string} command
   * @returns {ExecResult}
   * @throws {ExecError}
   */
  async remote(command, options) {
    return this.pool.run(command, options)
  }

  /**
   * Copy from local to remote or vice versa.
   *
   * @param {string} src
   * @param {string} dest
   * @returns {ExecResult|MultipleExecResult}
   * @throws {ExecError}
   */
  async remoteCopy(src, dest, options) {
    const defaultOptions = {
      ignores: this.config && this.config.ignores ? this.config.ignores : [],
      rsync: this.config && this.config.rsync ? this.config.rsync : [],
    }
    const copyOptions = { ...defaultOptions, ...options }

    return this.pool.copy(src, dest, copyOptions)
  }

  /**
   * Run a copy from the local to the remote using rsync.
   * All exec options are also available.
   *
   * @see https://nodejs.org/dist/latest-v8.x/docs/api/child_process.html#child_process_child_process_exec_command_options_callback
   *
   * @param {string} src
   * @param {string} dest
   * @param {object} [options] Options
   * @param {string[]} [options.ignores] Specify a list of files to ignore.
   * @param {string[]|string} [options.rsync] Specify a set of rsync arguments.
   * @returns {MultipleExecResult}
   * @throws {ExecError}
   */
  async copyToRemote(src, dest, options) {
    const defaultOptions = {
      ignores: this.config && this.config.ignores ? this.config.ignores : [],
      rsync: this.config && this.config.rsync ? this.config.rsync : [],
    }
    const copyOptions = { ...defaultOptions, ...options }
    return this.pool.copyToRemote(src, dest, copyOptions)
  }

  /**
   * Run a copy from the remote to the local using rsync.
   * All exec options are also available.
   *
   * @see https://nodejs.org/dist/latest-v8.x/docs/api/child_process.html#child_process_child_process_exec_command_options_callback
   * @param {string} src Source
   * @param {string} dest Destination
   * @param {object} [options] Options
   * @param {string[]} [options.ignores] Specify a list of files to ignore.
   * @param {string[]|string} [options.rsync] Specify a set of rsync arguments.
   * @returns {MultipleExecResult}
   * @throws {ExecError}
   */
  async copyFromRemote(src, dest, options) {
    const defaultOptions = {
      ignores: this.config && this.config.ignores ? this.config.ignores : [],
      rsync: this.config && this.config.rsync ? this.config.rsync : [],
    }
    const copyOptions = { ...defaultOptions, ...options }
    return this.pool.copyFromRemote(src, dest, copyOptions)
  }

  /**
   * Log.
   *
   * @see console.log
   */
  log(...args) {
    this.options.log(...args)
  }

  /**
   * Create a new blocking task.
   *
   * @see shipit.task
   */
  blTask(name, ...rest) {
    this.task(name, ...rest)
    const task = this.tasks[name]
    task.blocking = true
    return task
  }

  /**
   * Test if we are ready to run a task.
   * Implement blocking task.
   */
  _readyToRunTask(...args) {
    if (
      Object.keys(this.tasks).some(key => {
        const task = this.tasks[key]
        return task.running === true && task.blocking === true
      })
    )
      return false

    return super._readyToRunTask(...args) // eslint-disable-line no-underscore-dangle
  }
}

export default Shipit
