import utils from 'shipit-utils'
import path from 'path2/posix'
import extendShipit from '../../extendShipit'

/**
 * Update task.
 * - Create and define release path.
 * - Remote copy project.
 */
export default shipit => {
  utils.registerTask(shipit, 'rollback:init', async () => {
    extendShipit(shipit)

    shipit.log('Get current release dirname.')

    const currentRelease = await shipit.getCurrentReleaseDirname()

    if (!currentRelease) {
      throw new Error('Cannot find current release dirname.')
    }

    shipit.log('Current release dirname : %s.', currentRelease)
    shipit.log('Getting dist releases.')

    const releases = await shipit.getReleases()

    if (!releases) {
      throw new Error('Cannot read releases.')
    }

    shipit.log('Dist releases : %j.', releases)

    const currentReleaseIndex = releases.indexOf(currentRelease)
    const rollbackReleaseIndex = currentReleaseIndex + 1

    /* eslint-disable no-param-reassign */
    shipit.releaseDirname = releases[rollbackReleaseIndex]

    // Save the previous release in case we need to delete it later
    shipit.prevReleaseDirname = releases[currentReleaseIndex]
    shipit.prevReleasePath = path.join(
      shipit.releasesPath,
      shipit.prevReleaseDirname,
    )

    shipit.log('Will rollback to %s.', shipit.releaseDirname)

    if (!shipit.releaseDirname) {
      throw new Error('Cannot rollback, release not found.')
    }

    shipit.releasePath = path.join(shipit.releasesPath, shipit.releaseDirname)
    /* eslint-enable no-param-reassign */

    shipit.emit('rollback')
  })
}
