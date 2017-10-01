import utils from 'shipit-utils'
import extendShipit from '../../extendShipit'

/**
 * Finish task.
 * - Emit an event "deployed".
 */

const finishTask = shipit => {
  utils.registerTask(shipit, 'deploy:finish', () => {
    extendShipit(shipit)
    shipit.emit('deployed')
  })
}

export default finishTask
