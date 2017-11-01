import utils from 'shipit-utils'
import logTask from './log'

/**
 * Pending task.
 * - pending:init
 * - pending:log
 */
export default shipit => {
  logTask(shipit)
  utils.registerTask(shipit, 'pending', ['pending:log'])
}
