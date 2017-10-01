import utils from 'shipit-utils'
import initTask from './init'
import fetchTask from '../deploy/fetch'
import cleanTask from '../deploy/clean'
import finishTask from './finish'

/**
 * Rollback task.
 * - rollback:init
 * - deploy:publish
 * - deploy:clean
 */
export default shipit => {
  initTask(shipit)
  fetchTask(shipit)
  cleanTask(shipit)
  finishTask(shipit)

  utils.registerTask(shipit, 'rollback', [
    'rollback:init',
    'deploy:publish',
    'deploy:clean',
    'rollback:finish',
  ])
}
