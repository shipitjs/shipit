/* eslint-disable prefer-template */
import utils from 'shipit-utils'
import extendShipit from '../../extendShipit'

/**
 * Clean task.
 * - Remove old releases.
 */
const cleanTask = shipit => {
  utils.registerTask(shipit, 'deploy:clean', async () => {
    extendShipit(shipit)

    shipit.log(
      'Keeping "%d" last releases, cleaning others',
      shipit.config.keepReleases,
    )

    const command =
      '(ls -rd ' +
      shipit.releasesPath +
      '/*|head -n ' +
      shipit.config.keepReleases +
      ';ls -d ' +
      shipit.releasesPath +
      '/*)|sort|uniq -u|xargs rm -rf'
    await shipit.remote(command)

    shipit.emit('cleaned')
  })
}

export default cleanTask
