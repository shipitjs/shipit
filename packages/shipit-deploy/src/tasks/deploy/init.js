import utils from 'shipit-utils'
import extendShipit from '../../extendShipit'

/**
 * Init task.
 * - Emit deploy event.
 */
const initTask = shipit => {
  utils.registerTask(shipit, 'deploy:init', () => {
    extendShipit(shipit)
    shipit.emit('deploy')
  })
}

export default initTask
