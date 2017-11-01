import Shipit from 'shipit-cli'
import mkdirp from 'mkdirp-promise'
import { start } from '../../../tests/util'
import fetchTask from './fetch'

jest.mock('mkdirp-promise')

describe('deploy:fetch task', () => {
  let shipit

  beforeEach(() => {
    shipit = new Shipit({
      environment: 'test',
      log: jest.fn(),
    })

    fetchTask(shipit)

    // Shipit config
    shipit.initConfig({
      test: {
        workspace: '/tmp/workspace',
        repositoryUrl: 'git://website.com/user/repo',
      },
    })

    shipit.local = jest.fn(async () => ({ stdout: 'ok' }))
  })

  it('should create workspace, create repo, checkout and call sync', async () => {
    await start(shipit, 'deploy:fetch')
    expect(mkdirp).toBeCalledWith('/tmp/workspace')
    expect(shipit.local).toBeCalledWith('git init', { cwd: '/tmp/workspace' })
    expect(shipit.local).toBeCalledWith('git remote', { cwd: '/tmp/workspace' })
    expect(
      shipit.local,
    ).toBeCalledWith('git remote add shipit git://website.com/user/repo', {
      cwd: '/tmp/workspace',
    })
    expect(
      shipit.local,
    ).toBeCalledWith(
      'git fetch shipit --prune && git fetch shipit --prune "refs/tags/*:refs/tags/*"',
      { cwd: '/tmp/workspace' },
    )
    expect(shipit.local).toBeCalledWith('git checkout master', {
      cwd: '/tmp/workspace',
    })
    expect(shipit.local).toBeCalledWith('git branch --list master', {
      cwd: '/tmp/workspace',
    })
  })

  it('should create workspace, create repo, checkout shallow and call sync', async () => {
    shipit.config.shallowClone = true
    await start(shipit, 'deploy:fetch')

    expect(shipit.local).toBeCalledWith('rm -rf /tmp/workspace')
    expect(mkdirp).toBeCalledWith('/tmp/workspace')
    expect(shipit.local).toBeCalledWith('git init', {
      cwd: '/tmp/workspace',
    })
    expect(shipit.local).toBeCalledWith('git remote', {
      cwd: '/tmp/workspace',
    })
    expect(
      shipit.local,
    ).toBeCalledWith('git remote add shipit git://website.com/user/repo', {
      cwd: '/tmp/workspace',
    })
    expect(
      shipit.local,
    ).toBeCalledWith(
      'git fetch shipit --prune --depth=1 && git fetch shipit --prune "refs/tags/*:refs/tags/*"',
      { cwd: '/tmp/workspace' },
    )
    expect(shipit.local).toBeCalledWith('git checkout master', {
      cwd: '/tmp/workspace',
    })
    expect(shipit.local).toBeCalledWith('git branch --list master', {
      cwd: '/tmp/workspace',
    })
  })

  it('should create workspace, create repo, checkout and call sync, update submodules', async () => {
    shipit.config.updateSubmodules = true

    await start(shipit, 'deploy:fetch')

    expect(mkdirp).toBeCalledWith('/tmp/workspace')
    expect(shipit.local).toBeCalledWith('git init', {
      cwd: '/tmp/workspace',
    })
    expect(shipit.local).toBeCalledWith('git remote', {
      cwd: '/tmp/workspace',
    })
    expect(
      shipit.local,
    ).toBeCalledWith('git remote add shipit git://website.com/user/repo', {
      cwd: '/tmp/workspace',
    })
    expect(
      shipit.local,
    ).toBeCalledWith(
      'git fetch shipit --prune && git fetch shipit --prune "refs/tags/*:refs/tags/*"',
      { cwd: '/tmp/workspace' },
    )
    expect(shipit.local).toBeCalledWith('git checkout master', {
      cwd: '/tmp/workspace',
    })
    expect(shipit.local).toBeCalledWith('git branch --list master', {
      cwd: '/tmp/workspace',
    })
    expect(
      shipit.local,
    ).toBeCalledWith('git submodule update --init --recursive', {
      cwd: '/tmp/workspace',
    })
  })

  it('should create workspace, create repo, set repo config, checkout and call sync', async () => {
    shipit.config.gitConfig = {
      foo: 'bar',
      baz: 'quux',
    }

    await start(shipit, 'deploy:fetch')

    expect(mkdirp).toBeCalledWith('/tmp/workspace')
    expect(shipit.local).toBeCalledWith('git init', {
      cwd: '/tmp/workspace',
    })
    expect(shipit.local).toBeCalledWith('git config foo "bar"', {
      cwd: '/tmp/workspace',
    })
    expect(shipit.local).toBeCalledWith('git config baz "quux"', {
      cwd: '/tmp/workspace',
    })
    expect(shipit.local).toBeCalledWith('git remote', {
      cwd: '/tmp/workspace',
    })
    expect(
      shipit.local,
    ).toBeCalledWith('git remote add shipit git://website.com/user/repo', {
      cwd: '/tmp/workspace',
    })
    expect(
      shipit.local,
    ).toBeCalledWith(
      'git fetch shipit --prune && git fetch shipit --prune "refs/tags/*:refs/tags/*"',
      { cwd: '/tmp/workspace' },
    )
    expect(shipit.local).toBeCalledWith('git checkout master', {
      cwd: '/tmp/workspace',
    })
    expect(shipit.local).toBeCalledWith('git branch --list master', {
      cwd: '/tmp/workspace',
    })
  })
})