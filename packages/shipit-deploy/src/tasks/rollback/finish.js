import utils from 'shipit-utils'
import extendShipit from '../../extendShipit'

/**
 * Update task.
 * - Emit an event "rollbacked".
 */
export default shipit => {
  utils.registerTask(shipit, 'rollback:finish', async () => {
    extendShipit(shipit)

    if (shipit.config.deleteOnRollback) {
      if (!shipit.prevReleaseDirname || !shipit.prevReleasePath) {
        throw new Error("Can't find release to delete")
      }

      const command = `rm -rf ${shipit.prevReleasePath}`
      await shipit.remote(command)
    }

    shipit.emit('rollbacked')
  })
}
