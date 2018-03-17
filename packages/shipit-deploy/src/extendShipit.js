import path from 'path2/posix'
import _ from 'lodash'
import util from 'util'

/**
 * Compute the current release dir name.
 *
 * @param {object} result
 * @returns {string}
 */
function computeReleases(result) {
  if (!result.stdout) return null

  // Trim last breakline.
  const dirs = result.stdout.replace(/\n$/, '')

  // Convert releases to an array.
  return dirs.split('\n')
}

/**
 * Test if all values are equal.
 *
 * @param {*[]} values
 * @returns {boolean}
 */
function equalValues(values) {
  return values.every(value => _.isEqual(value, values[0]))
}

/**
 * Compute the current release dir name.
 *
 * @param {object} result
 * @returns {string}
 */
function computeReleaseDirname(result) {
  if (!result.stdout) return null

  // Trim last breakline.
  const target = result.stdout.replace(/\n$/, '')
  return target.split(path.sep).pop()
}

function extendShipit(shipit) {
  /* eslint-disable no-param-reassign */
  shipit.currentPath = path.join(shipit.config.deployTo, 'current')
  shipit.releasesPath = path.join(shipit.config.deployTo, 'releases')
  const config = {
    branch: 'master',
    keepReleases: 5,
    shallowClone: true,
    gitLogFormat: '%h: %s - %an',
    ...shipit.config,
  }
  Object.assign(shipit.config, config)
  /* eslint-enable no-param-reassign */

  const Shipit = shipit.constructor

  /**
   * Return the current release dirname.
   */
  Shipit.prototype.getCurrentReleaseDirname = async function getCurrentReleaseDirname() {
    const results =
      (await this.remote(
        util.format(
          'if [ -h %s ]; then readlink %s; fi',
          this.currentPath,
          this.currentPath,
        ),
      )) || []

    const releaseDirnames = results.map(computeReleaseDirname)

    if (!equalValues(releaseDirnames)) {
      throw new Error('Remote servers are not synced.')
    }

    if (!releaseDirnames[0]) {
      this.log('No current release found.')
      return null
    }

    return releaseDirnames[0]
  }

  /**
   * Return all remote releases (newest first)
   */
  Shipit.prototype.getReleases = async function getReleases() {
    const results = await this.remote(`ls -r1 ${this.releasesPath}`)
    const releases = results.map(computeReleases)

    if (!equalValues(releases)) {
      throw new Error('Remote servers are not synced.')
    }

    return releases[0]
  }

  /**
   * Return SHA from remote REVISION file.
   *
   * @param {string} releaseDir Directory name of the relesase dir (YYYYMMDDHHmmss).
   */
  Shipit.prototype.getRevision = async function getRevision(releaseDir) {
    const file = path.join(this.releasesPath, releaseDir, 'REVISION')
    const response = await this.remote(
      `if [ -f ${file} ]; then cat ${file} 2>/dev/null; fi;`,
    )
    return response[0].stdout.trim()
  }

  Shipit.prototype.getPendingCommits = async function getPendingCommits() {
    const currentReleaseDirname = await this.getCurrentReleaseDirname()
    if (!currentReleaseDirname) return null

    const deployedRevision = await this.getRevision(currentReleaseDirname)
    if (!deployedRevision) return null

    const res = await this.local('git remote', { cwd: this.config.workspace })
    const remotes = res && res.stdout ? res.stdout.split(/\s/) : []
    if (remotes.length < 1) return null

    // Compare against currently undeployed revision
    const compareRevision = `${remotes[0]}/${this.config.branch}`

    const response = await this.local(
      `git log --pretty=format:"${
        shipit.config.gitLogFormat
      }" ${deployedRevision}..${compareRevision}`,
      { cwd: shipit.workspace },
    )
    const commits = response.stdout.trim()
    return commits || null
  }
}

export default extendShipit
