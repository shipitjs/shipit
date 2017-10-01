import utils from 'shipit-utils'
import chalk from 'chalk'
import extendShipit from '../../extendShipit'

/**
 * Log task.
 */
const logTask = shipit => {
  utils.registerTask(shipit, 'pending:log', async () => {
    extendShipit(shipit)
    const commits = await shipit.getPendingCommits()
    const msg = commits
      ? chalk.yellow(chalk.underline('\nPending commits:\n') + commits)
      : chalk.green('\nNo pending commits.')

    shipit.log(msg)
  })
}

export default logTask
