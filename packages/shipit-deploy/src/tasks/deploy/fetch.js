import path from 'path'
import utils from 'shipit-utils'
import chalk from 'chalk'
import tmp from 'tmp-promise'
import extendShipit from '../../extendShipit'

/**
 * Fetch task.
 * - Create workspace.
 * - Fetch repository.
 * - Checkout commit-ish.
 */
const fetchTask = shipit => {
  utils.registerTask(shipit, 'deploy:fetch', async () => {
    extendShipit(shipit)

    /**
     * Create workspace.
     */
    async function createWorkspace() {
      async function create() {
        shipit.log('Create workspace...')
        /* eslint-disable no-param-reassign */
        if (shipit.config.shallowClone) {
          const tmpDir = await tmp.dir({ mode: '0755' })
          shipit.workspace = tmpDir.path
        } else {
          shipit.workspace = shipit.config.workspace
          if (path.resolve(shipit.workspace) === process.cwd()) {
            throw new Error('Workspace should be a temporary directory')
          }
        }
        /* eslint-enable no-param-reassign */
        shipit.log(chalk.green(`Workspace created: "${shipit.workspace}"`))
      }

      return create()
    }

    /**
     * Initialize repository.
     */
    async function initRepository() {
      shipit.log('Initialize local repository in "%s"', shipit.workspace)
      await shipit.local('git init', { cwd: shipit.workspace })
      shipit.log(chalk.green('Repository initialized.'))
    }

    /**
     * Set git config.
     */
    async function setGitConfig() {
      if (!shipit.config.gitConfig) return

      shipit.log('Set custom git config options for "%s"', shipit.workspace)

      await Promise.all(
        Object.keys(shipit.config.gitConfig || {}).map(key =>
          shipit.local(`git config ${key} "${shipit.config.gitConfig[key]}"`, {
            cwd: shipit.workspace,
          }),
        ),
      )
      shipit.log(chalk.green('Git config set.'))
    }

    /**
     * Add remote.
     */
    async function addRemote() {
      shipit.log('List local remotes.')

      const res = await shipit.local('git remote', {
        cwd: shipit.workspace,
      })

      const remotes = res.stdout ? res.stdout.split(/\s/) : []
      const method = remotes.indexOf('shipit') !== -1 ? 'set-url' : 'add'

      shipit.log(
        'Update remote "%s" to local repository "%s"',
        shipit.config.repositoryUrl,
        shipit.workspace,
      )

      // Update remote.
      await shipit.local(
        `git remote ${method} shipit ${shipit.config.repositoryUrl}`,
        { cwd: shipit.workspace },
      )

      shipit.log(chalk.green('Remote updated.'))
    }

    /**
     * Fetch repository.
     */
    async function fetch() {
      let fetchCommand = 'git fetch shipit --prune'
      const fetchDepth = shipit.config.shallowClone ? ' --depth=1' : ''

      // fetch branches and tags separate to be compatible with git versions < 1.9
      fetchCommand += `${fetchDepth} && ${fetchCommand} "refs/tags/*:refs/tags/*"`

      shipit.log('Fetching repository "%s"', shipit.config.repositoryUrl)

      await shipit.local(fetchCommand, { cwd: shipit.workspace })
      shipit.log(chalk.green('Repository fetched.'))
    }

    /**
     * Checkout commit-ish.
     */
    async function checkout() {
      shipit.log('Checking out commit-ish "%s"', shipit.config.branch)
      await shipit.local(`git checkout ${shipit.config.branch}`, {
        cwd: shipit.workspace,
      })
      shipit.log(chalk.green('Checked out.'))
    }

    /**
     * Hard reset of working tree.
     */
    async function reset() {
      shipit.log('Resetting the working tree')
      await shipit.local('git reset --hard HEAD', {
        cwd: shipit.workspace,
      })
      shipit.log(chalk.green('Reset working tree.'))
    }

    /**
     * Merge branch.
     */
    async function merge() {
      shipit.log('Testing if commit-ish is a branch.')

      const res = await shipit.local(
        `git branch --list ${shipit.config.branch}`,
        {
          cwd: shipit.workspace,
        },
      )

      const isBranch = !!res.stdout

      if (!isBranch) {
        shipit.log(chalk.green('No branch, no merge.'))
        return
      }

      shipit.log('Commit-ish is a branch, merging...')

      // Merge branch.
      await shipit.local(`git merge shipit/${shipit.config.branch}`, {
        cwd: shipit.workspace,
      })

      shipit.log(chalk.green('Branch merged.'))
    }

    /**
     * update submodules
     */
    async function updateSubmodules() {
      if (!shipit.config.updateSubmodules) return

      shipit.log('Updating submodules.')
      await shipit.local('git submodule update --init --recursive', {
        cwd: shipit.workspace,
      })
      shipit.log(chalk.green('Submodules updated'))
    }

    await createWorkspace()

    if (shipit.config.repositoryUrl) {
      await initRepository()
      await setGitConfig()
      await addRemote()
      await fetch()
      await checkout()
      await reset()
      await merge()
      await updateSubmodules()
    } else {
      shipit.log(chalk.yellow('Skip fetching repo. No repositoryUrl provided'))
    }

    shipit.emit('fetched')
  })
}

export default fetchTask
