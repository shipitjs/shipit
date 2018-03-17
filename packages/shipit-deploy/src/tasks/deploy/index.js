import utils from 'shipit-utils'
import init from './init'
import fetch from './fetch'
import update from './update'
import publish from './publish'
import clean from './clean'
import finish from './finish'

/**
 * Deploy task.
 * - deploy:fetch
 * - deploy:update
 * - deploy:publish
 * - deploy:clean
 * - deploy:finish
 */

export default shipit => {
  init(shipit)
  fetch(shipit)
  update(shipit)
  publish(shipit)
  clean(shipit)
  finish(shipit)

  utils.registerTask(shipit, 'deploy', [
    'deploy:init',
    'deploy:fetch',
    'deploy:update',
    'deploy:publish',
    'deploy:clean',
    'deploy:finish',
  ])
}
