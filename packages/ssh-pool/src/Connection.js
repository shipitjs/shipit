import { exec } from 'child_process'
import path from 'path'
import LineWrapper from 'stream-line-wrapper'
import { tmpName as asyncTmpName } from 'tmp'
import { formatRsyncCommand, checkRsyncAvailability } from './commands/rsync'
import { formatSshCommand } from './commands/ssh'
import { formatTarCommand } from './commands/tar'
import { formatCdCommand } from './commands/cd'
import { formatMkdirCommand } from './commands/mkdir'
import { formatScpCommand } from './commands/scp'
import { formatRawCommand } from './commands/raw'
import { formatRmCommand } from './commands/rm'
import { joinCommandArgs } from './commands/util'
import { parseRemote, formatRemote } from './remote'
import { series, deprecateV3 } from './util'

const tmpName = async options =>
  new Promise((resolve, reject) =>
    asyncTmpName(options, (err, name) => {
      if (err) reject(err)
      else resolve(name)
    }),
  )

const defaultRunOptions = { maxBuffer: 1000 * 1024 }

class Connection {
  /**
   * Initialize a new `Connection` with `options`.
   *
   * @param {object} options Options
   * @param {string|object} options.remote Remote
   * @param {Stream} [options.stdout] Stdout stream
   * @param {Stream} [options.stderr] Stderr stream
   * @param {string} [options.key] SSH key
   * @param {function} [options.log] Log method
   * @param {boolean} [options.asUser] Use a custom user to run command
   */
  constructor(options = {}) {
    this.options = options
    this.remote = parseRemote(options.remote)
    this.remote.user = this.remote.user || 'deploy'
  }

  /**
   * Run a command remotely using SSH.
   * All exec options are also available.
   *
   * @see https://nodejs.org/dist/latest-v8.x/docs/api/child_process.html#child_process_child_process_exec_command_options_callback
   * @param {string} command Command to run
   * @param {object} [options] Options
   * @param {boolean} [options.tty] Force a TTY allocation.
   * @returns {Promise.<object>} A promise with an object as result: { child, stdout, stderr }
   */
  async run(command, { tty: ttyOption, ...cmdOptions } = {}) {
    let tty = ttyOption
    if (command.startsWith('sudo') && typeof ttyOption === 'undefined') {
      deprecateV3('You should set "tty" option explictly when you use "sudo".')
      tty = true
    }
    this.log('Running "%s" on host "%s".', command, this.remote.host)
    const cmd = this.buildSSHCommand(command, { tty })
    return this.runLocally(cmd, cmdOptions)
  }

  /**
   * Run a copy command using either rsync or scp.
   * All exec options are also available.
   *
   * @see https://nodejs.org/dist/latest-v8.x/docs/api/child_process.html#child_process_child_process_exec_command_options_callback
   * @deprecated
   * @param {string} src Source
   * @param {string} dest Destination
   * @param {object} [options] Options
   * @param {boolean} [options.direction] Specify "remoteToLocal" to copy from "remote". By default it will copy from remote.
   * @param {string[]} [options.ignores] Specify a list of files to ignore.
   * @param {string[]|string} [options.rsync] Specify a set of rsync arguments.
   * @returns {Promise.<object>} A promise with an object as result: { child, stdout, stderr } or { children, stdout, stderr }
   */
  async copy(src, dest, { direction, ...options } = {}) {
    deprecateV3(
      '"copy" method is deprecated, please use "copyToRemote", "copyFromRemote", "scpCopyToRemote" or "scpCopyFromRemote".',
    )
    if (direction === 'remoteToLocal')
      return this.autoCopyFromRemote(src, dest, options)

    return this.autoCopyToRemote(src, dest, options)
  }

  /**
   * Run a copy from the local to the remote using rsync.
   * All exec options are also available.
   *
   * @see https://nodejs.org/dist/latest-v8.x/docs/api/child_process.html#child_process_child_process_exec_command_options_callback
   * @param {string} src Source
   * @param {string} dest Destination
   * @param {object} [options] Options
   * @param {string[]} [options.ignores] Specify a list of files to ignore.
   * @param {string[]|string} [options.rsync] Specify a set of rsync arguments.
   * @returns {Promise.<object>} A promise with an object as result: { child, stdout, stderr }
   */
  async copyToRemote(src, dest, options) {
    const remoteDest = `${formatRemote(this.remote)}:${dest}`
    return this.rsyncCopy(src, remoteDest, options)
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
   * @returns {Promise.<object>} A promise with an object as result: { child, stdout, stderr }
   */
  async copyFromRemote(src, dest, options) {
    const remoteSrc = `${formatRemote(this.remote)}:${src}`
    return this.rsyncCopy(remoteSrc, dest, options)
  }

  /**
   * Run a copy from the local to the remote using scp.
   * All exec options are also available.
   *
   * @see https://nodejs.org/dist/latest-v8.x/docs/api/child_process.html#child_process_child_process_exec_command_options_callback
   * @param {string} src Source
   * @param {string} dest Destination
   * @param {object} [options] Options
   * @param {string[]} [options.ignores] Specify a list of files to ignore.
   * @returns {Promise.<object>} A promise with an object as result: { children, stdout, stderr }
   */
  async scpCopyToRemote(src, dest, { ignores, ...cmdOptions } = {}) {
    const archive = path.basename(await tmpName({ postfix: '.tar.gz' }))
    const srcDir = path.dirname(src)
    const remoteDest = `${formatRemote(this.remote)}:${dest}`

    const compress = joinCommandArgs([
      formatCdCommand({ folder: srcDir }),
      '&&',
      formatTarCommand({
        mode: 'compress',
        file: path.basename(src),
        archive,
        excludes: ignores,
      }),
    ])

    const createDestFolder = formatMkdirCommand({ folder: dest })

    const copy = joinCommandArgs([
      formatCdCommand({ folder: srcDir }),
      '&&',
      formatScpCommand({
        port: this.remote.port,
        key: this.options.key,
        src: archive,
        dest: remoteDest,
      }),
    ])

    const cleanSrc = joinCommandArgs([
      formatCdCommand({ folder: srcDir }),
      '&&',
      formatRmCommand({ file: archive }),
    ])

    const extract = joinCommandArgs([
      formatCdCommand({ folder: dest }),
      '&&',
      formatTarCommand({ mode: 'extract', archive }),
    ])

    const cleanDest = joinCommandArgs([
      formatCdCommand({ folder: dest }),
      '&&',
      formatRmCommand({ file: archive }),
    ])

    return this.aggregate([
      () => this.runLocally(compress, cmdOptions),
      () => this.run(createDestFolder, cmdOptions),
      () => this.runLocally(copy, cmdOptions),
      () => this.runLocally(cleanSrc, cmdOptions),
      () => this.run(extract, cmdOptions),
      () => this.run(cleanDest, cmdOptions),
    ])
  }

  /**
   * Run a copy from the remote to the local using scp.
   * All exec options are also available.
   *
   * @see https://nodejs.org/dist/latest-v8.x/docs/api/child_process.html#child_process_child_process_exec_command_options_callback
   * @param {string} src Source
   * @param {string} dest Destination
   * @param {object} [options] Options
   * @param {string[]} [options.ignores] Specify a list of files to ignore.
   * @returns {Promise.<object>} A promise with an object as result: { children, stdout, stderr }
   */
  async scpCopyFromRemote(src, dest, { ignores, ...cmdOptions } = {}) {
    const archive = path.basename(await tmpName({ postfix: '.tar.gz' }))
    const srcDir = path.dirname(src)
    const srcArchive = path.join(srcDir, archive)
    const remoteSrcArchive = `${formatRemote(this.remote)}:${srcArchive}`

    const compress = joinCommandArgs([
      formatCdCommand({ folder: srcDir }),
      '&&',
      formatTarCommand({
        mode: 'compress',
        file: path.basename(src),
        archive,
        excludes: ignores,
      }),
    ])

    const createDestFolder = formatMkdirCommand({ folder: dest })

    const copy = formatScpCommand({
      port: this.remote.port,
      key: this.options.key,
      src: remoteSrcArchive,
      dest,
    })

    const cleanSrc = joinCommandArgs([
      formatCdCommand({ folder: srcDir }),
      '&&',
      formatRmCommand({ file: archive }),
    ])

    const extract = joinCommandArgs([
      formatCdCommand({ folder: dest }),
      '&&',
      formatTarCommand({ mode: 'extract', archive }),
    ])

    const cleanDest = joinCommandArgs([
      formatCdCommand({ folder: dest }),
      '&&',
      formatRmCommand({ file: archive }),
    ])

    return this.aggregate([
      () => this.run(compress, cmdOptions),
      () => this.runLocally(createDestFolder, cmdOptions),
      () => this.runLocally(copy, cmdOptions),
      () => this.run(cleanSrc, cmdOptions),
      () => this.runLocally(extract, cmdOptions),
      () => this.runLocally(cleanDest, cmdOptions),
    ])
  }

  buildSSHCommand(command, options) {
    return formatSshCommand({
      port: this.remote.port,
      key: this.options.key,
      strict: this.options.strict,
      tty: this.options.tty,
      remote: formatRemote(this.remote),
      command: formatRawCommand({ command, asUser: this.options.asUser }),
      ...options,
    })
  }

  async rsyncCopy(src, dest, { rsync, ignores, ...cmdOptions } = {}) {
    this.log('Copy "%s" to "%s" via rsync', src, dest)

    const sshCommand = formatSshCommand({
      port: this.remote.port,
      key: this.options.key,
      strict: this.options.strict,
      tty: this.options.tty,
    })

    const cmd = formatRsyncCommand({
      src,
      dest,
      remoteShell: sshCommand,
      additionalArgs: typeof rsync === 'string' ? [rsync] : rsync,
      excludes: ignores,
    })

    return this.runLocally(cmd, cmdOptions)
  }

  async autoCopyToRemote(src, dest, options) {
    const rsyncAvailable = await checkRsyncAvailability()
    const method = rsyncAvailable ? 'copyToRemote' : 'scpCopyToRemote'
    return this[method](src, dest, options)
  }

  async autoCopyFromRemote(src, dest, options) {
    const rsyncAvailable = await checkRsyncAvailability()
    const method = rsyncAvailable ? 'copyFromRemote' : 'scpCopyFromRemote'
    return this[method](src, dest, options)
  }

  async aggregate(tasks) {
    const results = await series(tasks)

    return results.reduce(
      (aggregate, result) => ({
        stdout: Buffer.concat([aggregate.stdout, result.stdout]),
        stderr: Buffer.concat([aggregate.stderr, result.stderr]),
        children: [...aggregate.children, result.child],
      }),
      {
        stdout: Buffer.from([]),
        stderr: Buffer.from([]),
        children: [],
      },
    )
  }

  log(...args) {
    if (this.options.log) this.options.log(...args)
  }

  async runLocally(cmd, { stdout, stderr, ...cmdOptions } = {}) {
    const stdoutPipe = this.options.stdout || stdout
    const stderrPipe = this.options.stderr || stderr

    return new Promise((resolve, reject) => {
      // Exec command.
      const child = exec(
        cmd,
        { ...defaultRunOptions, ...cmdOptions },
        (err, cmdStdout, cmdStderr) => {
          if (err) reject(err)
          else resolve({ child, stdout: cmdStdout, stderr: cmdStderr })
        },
      )

      if (stdoutPipe)
        child.stdout
          .pipe(new LineWrapper({ prefix: `@${this.remote.host} ` }))
          .pipe(stdoutPipe)

      if (stderrPipe)
        child.stderr
          .pipe(new LineWrapper({ prefix: `@${this.remote.host}-err ` }))
          .pipe(stderrPipe)
    })
  }
}

export default Connection
