/* eslint-disable no-console */
import chalk from 'chalk'
import interpret from 'interpret'
import v8flags from 'v8flags'
import Liftoff from 'liftoff'
import minimist from 'minimist'
import Shipit from './Shipit'
import pkg from '../package.json'

const argv = minimist(process.argv.slice(2))

// Initialize cli.
const cli = new Liftoff({
  name: 'shipit',
  extensions: interpret.jsVariants,
  v8flags,
})

/**
 * Properly exit.
 * Even on Windows.
 *
 * @param {number} code Exit code
 */
function exit(code) {
  if (process.platform === 'win32' && process.stdout.bufferSize) {
    process.stdout.once('drain', () => {
      process.exit(code)
    })
    return
  }

  process.exit(code)
}

/**
 * Initialize shipit.
 *
 * @param {string} env Shipit environement
 * @param {string} shipfile Shipitfile path
 * @param {string[]} tasks Tasks
 */

function initShipit(env, shipfile, tasks) {
  // Create.
  const shipit = new Shipit({ environment: env })

  // Load shipfile.
  const pendingConfig = require(shipfile)(shipit) // eslint-disable-line global-require, import/no-dynamic-import, import/no-dynamic-require

  const done = () => {
    // Initialize shipit.
    shipit.initialize()

    // Run tasks.
    shipit.start(tasks)

    shipit.on('task_err', () => {
      exit(1)
    })

    shipit.on('task_not_found', () => {
      exit(1)
    })
  }

  Promise.resolve(pendingConfig).then(done).catch(err => {
    console.error('Could not load async config.', err)
  })
}

/**
 * Invoke CLI.
 *
 * @param {object} env CLI environment
 */
function invoke(env) {
  if (argv.version) {
    console.info('v%s', pkg.version)
    exit(0)
  }

  if (!env.configPath) {
    console.error(chalk.red('shipitfile not found'))
    exit(1)
  }

  if (argv._.length === 0) {
    console.error(chalk.red('environment not found'))
    exit(1)
  }

  // Run the 'default' task if no task is specified
  const tasks = argv._.slice(1)
  if (tasks.length === 0) {
    tasks.push('default')
  }

  try {
    initShipit(argv._[0], env.configPath, tasks)
  } catch (e) {
    console.error(chalk.red(e.message))
    exit(1)
  }
}

// Launch cli.
cli.launch(
  {
    cwd: argv.cwd,
    configPath: argv.shipitfile,
    require: argv.require,
    completion: argv.completion,
  },
  invoke,
)
