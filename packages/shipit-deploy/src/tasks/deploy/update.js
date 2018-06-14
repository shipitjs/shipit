import utils from 'shipit-utils'
import path from 'path2/posix'
import moment from 'moment'
import chalk from 'chalk'
import util from 'util'
import rmfr from 'rmfr'
import _ from 'lodash'
import extendShipit from '../../extendShipit'

/**
 * Update task.
 * - Set previous release.
 * - Set previous revision.
 * - Create and define release path.
 * - Copy previous release (for faster rsync)
 * - Set current revision and write REVISION file.
 * - Remote copy project.
 * - Remove workspace.
 */
const updateTask = shipit => {
  utils.registerTask(shipit, 'deploy:update', async () => {
    extendShipit(shipit)

    /**
     * Copy previous release to release dir.
     */

    async function copyPreviousRelease() {
      const copyParameter = shipit.config.copy || '-a'
      if (!shipit.previousRelease || shipit.config.copy === false) return
      shipit.log('Copy previous release to "%s"', shipit.releasePath)
      await shipit.remote(
        util.format(
          'cp %s %s/. %s',
          copyParameter,
          path.join(shipit.releasesPath, shipit.previousRelease),
          shipit.releasePath,
        ),
      )
    }

    /**
     * Create and define release path.
     */
    async function createReleasePath() {
      /* eslint-disable no-param-reassign */
      shipit.releaseDirname = moment.utc().format('YYYYMMDDHHmmss')
      shipit.releasePath = path.join(shipit.releasesPath, shipit.releaseDirname)
      /* eslint-enable no-param-reassign */

      shipit.log('Create release path "%s"', shipit.releasePath)
      await shipit.remote(`mkdir -p ${shipit.releasePath}`)
      shipit.log(chalk.green('Release path created.'))
    }

    /**
     * Remote copy project.
     */

    async function remoteCopy() {
      const options = _.get(shipit.config, 'deploy.remoteCopy') || {
        rsync: '--del',
      }
      const rsyncFrom = shipit.config.rsyncFrom || shipit.workspace
      const uploadDirPath = path.resolve(
        rsyncFrom,
        shipit.config.dirToCopy || '',
      )

      shipit.log('Copy project to remote servers.')

      await shipit.remoteCopy(`${uploadDirPath}/`, shipit.releasePath, options)
      shipit.log(chalk.green('Finished copy.'))
    }

    /**
     * Set shipit.previousRevision from remote REVISION file.
     */
    async function setPreviousRevision() {
      /* eslint-disable no-param-reassign */
      shipit.previousRevision = null
      /* eslint-enable no-param-reassign */

      if (!shipit.previousRelease) return

      const revision = await shipit.getRevision(shipit.previousRelease)
      if (revision) {
        shipit.log(chalk.green('Previous revision found.'))
        /* eslint-disable no-param-reassign */
        shipit.previousRevision = revision
        /* eslint-enable no-param-reassign */
      }
    }

    /**
     * Set shipit.previousRelease.
     */
    async function setPreviousRelease() {
      /* eslint-disable no-param-reassign */
      shipit.previousRelease = null
      /* eslint-enable no-param-reassign */
      const currentReleaseDirname = await shipit.getCurrentReleaseDirname()
      if (currentReleaseDirname) {
        shipit.log(chalk.green('Previous release found.'))
        /* eslint-disable no-param-reassign */
        shipit.previousRelease = currentReleaseDirname
        /* eslint-enable no-param-reassign */
      }
    }

    /**
     * Set shipit.currentRevision and write it to REVISION file.
     */
    async function setCurrentRevision() {
      shipit.log('Setting current revision and creating revision file.')

      const response = await shipit.local(
        `git rev-parse ${shipit.config.branch}`,
        {
          cwd: shipit.workspace,
        },
      )

      /* eslint-disable no-param-reassign */
      shipit.currentRevision = response.stdout.trim()
      /* eslint-enable no-param-reassign */

      await shipit.remote(
        `echo "${shipit.currentRevision}" > ${path.join(
          shipit.releasePath,
          'REVISION',
        )}`,
      )
      shipit.log(chalk.green('Revision file created.'))
    }

    async function removeWorkspace() {
      if (shipit.config.shallowClone) {
        shipit.log(`Removing workspace "${shipit.workspace}"`)
        await rmfr(shipit.workspace)
        shipit.log(chalk.green('Workspace removed.'))
      }
    }

    await setPreviousRelease()
    await setPreviousRevision()
    await createReleasePath()
    await copyPreviousRelease()
    await remoteCopy()
    await setCurrentRevision()
    await removeWorkspace()
    shipit.emit('updated')
  })
}

export default updateTask
