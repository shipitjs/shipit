import utils from 'shipit-utils'
import chalk from 'chalk'
import mkdirp from 'mkdirp'

/**
 * Fetch task.
 * - Create workspace.
 * - Fetch repository.
 * - Checkout commit-ish.
 */
const fetchTask = shipit => {
  utils.registerTask(shipit, 'deploy:fetch', async () => {
    /**
     * Create workspace.
     */
    function createWorkspace() {
      function create() {
        shipit.log('Create workspace "%s"', shipit.config.workspace)
        return Promise.promisify(mkdirp)(shipit.config.workspace).then(() => {
          shipit.log(chalk.green('Workspace created.'))
        })
      }

      if (shipit.config.shallowClone) {
        shipit.log('Deleting existing workspace "%s"', shipit.config.workspace)
        return shipit.local(`rm -rf ${shipit.config.workspace}`).then(create)
      }

      return create()
    }

    /**
     * Initialize repository.
     */
    async function initRepository() {
      shipit.log('Initialize local repository in "%s"', shipit.config.workspace)
      await shipit.local('git init', { cwd: shipit.config.workspace })
      shipit.log(chalk.green('Repository initialized.'))
    }

    /**
     * Set git config.
     */
    async function setGitConfig() {
      if (!shipit.config.gitConfig) return

      shipit.log(
        'Set custom git config options for "%s"',
        shipit.config.workspace,
      )

      await Promise.all(
        Object.keys(shipit.config.gitConfig || {}).map(key =>
          shipit.local(`git config ${key} "${shipit.config.gitConfig[key]}"`, {
            cwd: shipit.config.workspace,
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
        cwd: shipit.config.workspace,
      })

      const remotes = res.stdout ? res.stdout.split(/\s/) : []
      const method = remotes.indexOf('shipit') !== -1 ? 'set-url' : 'add'

      shipit.log(
        'Update remote "%s" to local repository "%s"',
        shipit.config.repositoryUrl,
        shipit.config.workspace,
      )

      // Update remote.
      await shipit.local(
        `git remote ${method} shipit ${shipit.config.repositoryUrl}`,
        { cwd: shipit.config.workspace },
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

      await shipit.local(fetchCommand, { cwd: shipit.config.workspace })
      shipit.log(chalk.green('Repository fetched.'))
    }

    /**
     * Checkout commit-ish.
     */
    async function checkout() {
      shipit.log('Checking out commit-ish "%s"', shipit.config.branch)
      await shipit.local(`git checkout ${shipit.config.branch}`, {
        cwd: shipit.config.workspace,
      })
      shipit.log(chalk.green('Checked out.'))
    }

    /**
     * Hard reset of working tree.
     */
    async function reset() {
      shipit.log('Resetting the working tree')
      await shipit.local('git reset --hard HEAD', {
        cwd: shipit.config.workspace,
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
          cwd: shipit.config.workspace,
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
        cwd: shipit.config.workspace,
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
        cwd: shipit.config.workspace,
      })
      shipit.log(chalk.green('Submodules updated'))
    }

    await createWorkspace()
    await initRepository()
    await setGitConfig()
    await addRemote()
    await fetch()
    await checkout()
    await reset()
    await merge()
    await updateSubmodules()
    shipit.emit('fetched')
  })
}

export default fetchTask
