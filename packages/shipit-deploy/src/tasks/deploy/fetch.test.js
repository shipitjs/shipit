import Shipit from 'shipit-cli'
import fs from 'fs'
import tmp from 'tmp-promise'
import { start } from '../../../tests/util'
import fetchTask from './fetch'

jest.mock('tmp-promise', () => ({
  dir: jest.fn(),
}))
jest.mock('fs')

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

    fs.existsSync.mockImplementation(() => true)
    tmp.dir.mockImplementation(() =>
      Promise.resolve({
        path: '/tmp/workspace-generated',
      }),
    )
  })

  it('should throw an error if workspace is current directory', async () => {
    jest.spyOn(process, 'cwd').mockImplementation(() => '/tmp/workspace')
    expect.assertions(1)

    await expect(start(shipit, 'deploy:fetch')).rejects.toMatchInlineSnapshot(
      `[Error: Workspace should be a temporary directory. To use current working directory set keepWorkspace: true]`,
    )

    process.cwd.mockRestore()
  })

  describe('setup workspace', () => {
    it('should use config.workspace if any', async () => {
      await start(shipit, 'deploy:fetch')

      expect(shipit.workspace).toBe('/tmp/workspace')
    })

    it('should throw if workspace dir does not exists', async () => {
      fs.existsSync.mockImplementation(() => false)

      await expect(start(shipit, 'deploy:fetch')).rejects.toMatchInlineSnapshot(
        `[Error: Workspace dir is required. Current value is: /tmp/workspace]`,
      )
    })

    it('should create temp dir if shallowClone: true', async () => {
      shipit.config.shallowClone = true

      await start(shipit, 'deploy:fetch')

      expect(tmp.dir).toHaveBeenCalledWith({ mode: '0755' })
      expect(shipit.workspace).toBe('/tmp/workspace-generated')
    })

    it('should throw if workspace dir was not configured', async () => {
      delete shipit.config.workspace

      await expect(start(shipit, 'deploy:fetch')).rejects.toMatchInlineSnapshot(
        `[Error: Workspace dir is required. Current value is: undefined]`,
      )
    })
  })

  describe('fetch repo', () => {
    it('should create repo, checkout and call sync', async () => {
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

    it('should create repo, checkout shallow and call sync', async () => {
      shipit.config.shallowClone = true
      delete shipit.config.workspace

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

    it('should create repo, checkout and call sync, update submodules', async () => {
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

    it('should create repo, set repo config, checkout and call sync', async () => {
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
        expect.stringContaining(
          'Skip fetching repo. No repositoryUrl provided',
        ),
      )
    })
  })
})
