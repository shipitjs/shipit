import utils from 'shipit-utils'
import chalk from 'chalk'
import path from 'path2/posix'
import extendShipit from '../../extendShipit'

/**
 * Publish task.
 * - Update symbolic link.
 */
const publishTask = shipit => {
  utils.registerTask(shipit, 'deploy:publish', async () => {
    extendShipit(shipit)

    shipit.log('Publishing release "%s"', shipit.releasePath)

    const relativeReleasePath = path.join('releases', shipit.releaseDirname)

    /* eslint-disable prefer-template */
    const res = await shipit.remote(
      'cd ' +
        shipit.config.deployTo +
        ' && ' +
        'if [ -d current ] && [ ! -L current ]; then ' +
        'echo "ERR: could not make symlink"; ' +
        'else ' +
        'ln -nfs ' +
        relativeReleasePath +
        ' current_tmp && ' +
        'mv -f current_tmp current; ' +
        'fi',
    )
    /* eslint-enable prefer-template */

    const failedresult =
      res && res.stdout
        ? res.stdout.filter(r => r.indexOf('could not make symlink') > -1)
        : []
    if (failedresult.length && failedresult.length > 0) {
      shipit.log(
        chalk.yellow(
          `Symbolic link at remote not made, as something already exists at ${path(
            shipit.config.deployTo,
            'current',
          )}`,
        ),
      )
    }

    shipit.log(chalk.green('Release published.'))

    shipit.emit('published')
  })
}

export default publishTask
