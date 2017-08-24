/* eslint-disable no-console */
import childProcess from 'child_process'
import { ConnectionPool } from 'ssh-pool'
import _ from 'lodash'
import LineWrapper from 'stream-line-wrapper'
import Orchestrator from 'orchestrator'
import chalk from 'chalk'
import prettyTime from 'pretty-hrtime'

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

    const servers = _.isArray(this.config.servers)
      ? this.config.servers
      : [this.config.servers]

    this.pool = new ConnectionPool(
      servers,
      _.extend({}, this.options, _.pick(this.config, 'key', 'strict')),
    )

    return this
  }

  /**
   * Initialize shipit configuration.
   *
   * @param {object} config
   * @returns {Shipit} for chaining
   */
  initConfig(config = {}) {
    if (!config[this.environment])
      throw new Error(`Environment '${this.environment}' not found in config`)

    this.config = _.assign(
      {
        branch: 'master',
        keepReleases: 5,
        shallowClone: false,
      },
      config.default || {},
      config[this.environment],
    )

    return this
  }

  /**
   * Run a command locally.
   *
   * @param {string} command
   * @param {object} options
   * @returns {ChildObject}
   */
  local(command, options) {
    const defaultOptions = { maxBuffer: 1024000 }
    const cmdOptions = { ...defaultOptions, ...options }

    return new Promise((resolve, reject) => {
      this.log('Running "%s" on local.', command)

      const stdoutWrapper = new LineWrapper({ prefix: '@ ' })
      const stderrWrapper = new LineWrapper({ prefix: '@ ' })

      const child = childProcess.exec(
        command,
        cmdOptions,
        (err, stdout, stderr) => {
          if (err) {
            reject({
              child,
              stdout,
              stderr,
              err,
            })
          } else {
            resolve({
              child,
              stdout,
              stderr,
            })
          }
        },
      )

      if (this.options.stdout)
        child.stdout.pipe(stdoutWrapper).pipe(this.options.stdout)

      if (this.options.stderr)
        child.stderr.pipe(stderrWrapper).pipe(this.options.stderr)
    })
  }

  /**
   * Run a command remotely.
   *
   * @param {string} command
   * @param {object} options
   * @returns {ChildObject}
   */
  remote(command, { cwd, ...options } = {}) {
    return this.pool.run(
      cwd ? `cd "${cwd.replace(/"/g, '\\"')}" && ${command}` : command,
      options,
    )
  }

  /**
   * Copy from local to remote or vice versa.
   *
   * @param {string} src
   * @param {string} dest
   * @returns {ChildObject}
   */
  remoteCopy(src, dest, options) {
    const defaultOptions = {
      ignores: this.config && this.config.ignores ? this.config.ignores : [],
      rsync: this.config && this.config.rsync ? this.config.rsync : [],
    }
    const copyOptions = { ...defaultOptions, ...options }

    return this.pool.copy(src, dest, copyOptions)
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
    if (_.find(this.tasks, { running: true, blocking: true })) return false

    return super._readyToRunTask(...args) // eslint-disable-line no-underscore-dangle
  }
}

export default Shipit
