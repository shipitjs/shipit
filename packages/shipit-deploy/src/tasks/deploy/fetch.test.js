import Shipit from 'shipit-cli'
import { start } from '../../../tests/util'
import fetchTask from './fetch'

jest.mock('tmp-promise')

describe('deploy:fetch task', () => {
  let shipit
  let log

  beforeEach(() => {
    log = jest.fn()
    shipit = new Shipit({
      environment: 'test',
      log,
    })

    fetchTask(shipit)

    // Shipit config
    shipit.initConfig({
      test: {
        deployTo: '/var/apps/dep',
        shallowClone: false,
        workspace: '/tmp/workspace',
        repositoryUrl: 'git://website.com/user/repo',
      },
    })

    shipit.local = jest.fn(async () => ({ stdout: 'ok' }))
  })

  it('should throw an error if workspace is current directory', async () => {
    jest.spyOn(process, 'cwd').mockImplementation(() => '/tmp/workspace')
    expect.assertions(1)
    try {
      await start(shipit, 'deploy:fetch')
    } catch (error) {
      expect(error.message).toBe('Workspace should be a temporary directory')
    }
    process.cwd.mockRestore()
  })

  it('should create workspace, create repo, checkout and call sync', async () => {
    await start(shipit, 'deploy:fetch')

    const opts = { cwd: '/tmp/workspace' }

    expect(shipit.local).toBeCalledWith('git init', opts)
    expect(shipit.local).toBeCalledWith('git remote', opts)
    expect(shipit.local).toBeCalledWith(
      'git remote add shipit git://website.com/user/repo',
      opts,
    )
    expect(shipit.local).toBeCalledWith(
      'git fetch shipit --prune && git fetch shipit --prune "refs/tags/*:refs/tags/*"',
      opts,
    )
    expect(shipit.local).toBeCalledWith('git checkout master', opts)
    expect(shipit.local).toBeCalledWith('git branch --list master', opts)
  })

  it('should create workspace, create repo, checkout shallow and call sync', async () => {
    shipit.config.shallowClone = true

    await start(shipit, 'deploy:fetch')

    const opts = { cwd: '/tmp/workspace-generated' }

    expect(shipit.local).toBeCalledWith('git init', opts)
    expect(shipit.local).toBeCalledWith('git remote', opts)
    expect(shipit.local).toBeCalledWith(
      'git remote add shipit git://website.com/user/repo',
      opts,
    )
    expect(shipit.local).toBeCalledWith(
      'git fetch shipit --prune --depth=1 && git fetch shipit --prune "refs/tags/*:refs/tags/*"',
      opts,
    )
    expect(shipit.local).toBeCalledWith('git checkout master', opts)
    expect(shipit.local).toBeCalledWith('git branch --list master', opts)
  })

  it('should create workspace, create repo, checkout and call sync, update submodules', async () => {
    shipit.config.updateSubmodules = true

    await start(shipit, 'deploy:fetch')

    const opts = { cwd: '/tmp/workspace' }

    expect(shipit.local).toBeCalledWith('git init', opts)
    expect(shipit.local).toBeCalledWith('git remote', opts)
    expect(shipit.local).toBeCalledWith(
      'git remote add shipit git://website.com/user/repo',
      opts,
    )
    expect(shipit.local).toBeCalledWith(
      'git fetch shipit --prune && git fetch shipit --prune "refs/tags/*:refs/tags/*"',
      opts,
    )
    expect(shipit.local).toBeCalledWith('git checkout master', opts)
    expect(shipit.local).toBeCalledWith('git branch --list master', opts)
    expect(shipit.local).toBeCalledWith(
      'git submodule update --init --recursive',
      opts,
    )
  })

  it('should create workspace, create repo, set repo config, checkout and call sync', async () => {
    shipit.config.gitConfig = {
      foo: 'bar',
      baz: 'quux',
    }

    await start(shipit, 'deploy:fetch')

    const opts = { cwd: '/tmp/workspace' }

    expect(shipit.local).toBeCalledWith('git init', opts)
    expect(shipit.local).toBeCalledWith('git config foo "bar"', opts)
    expect(shipit.local).toBeCalledWith('git config baz "quux"', opts)
    expect(shipit.local).toBeCalledWith('git remote', opts)
    expect(shipit.local).toBeCalledWith(
      'git remote add shipit git://website.com/user/repo',
      opts,
    )
    expect(shipit.local).toBeCalledWith(
      'git fetch shipit --prune && git fetch shipit --prune "refs/tags/*:refs/tags/*"',
      opts,
    )
    expect(shipit.local).toBeCalledWith('git checkout master', opts)
    expect(shipit.local).toBeCalledWith('git branch --list master', opts)
  })

  it('should skip fetching if no repositoryUrl provided', async () => {
    delete shipit.config.repositoryUrl

    await start(shipit, 'deploy:fetch')

    expect(shipit.local).not.toHaveBeenCalled()
    expect(log).toBeCalledWith(
      expect.stringContaining('Skip fetching repo. No repositoryUrl provided'),
    )
  })
})
