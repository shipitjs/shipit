/* eslint-disable import/no-extraneous-dependencies */
import Stream from 'mock-utf8-stream'
import { ConnectionPool } from 'ssh-pool'
import Shipit from './Shipit'

describe('Shipit', () => {
  let shipit
  let stdout
  let stderr

  beforeEach(() => {
    stdout = new Stream.MockWritableStream()
    stderr = new Stream.MockWritableStream()
    shipit = new Shipit({
      stdout,
      stderr,
      environment: 'stage',
      log: jest.fn(),
    })
    shipit.stage = 'stage'
  })

  describe('#initConfig', () => {
    it('should set config and globalConfig', () => {
      const config = {
        default: { foo: 'bar', servers: ['1', '2'] },
        stage: { kung: 'foo', servers: ['3'] },
      }

      shipit.initConfig(config)

      expect(shipit.config).toEqual({ foo: 'bar', kung: 'foo', servers: ['3'] })

      expect(shipit.globalConfig).toBe(config)
    })
  })

  describe('#initialize', () => {
    beforeEach(() => {
      shipit.initConfig({ stage: {} })
      shipit.initSshPool = jest.fn(() => shipit)
    })

    it('should return an error if environment is not found', () => {
      shipit.initConfig({})
      expect(() => shipit.initialize()).toThrow(
        "Environment 'stage' not found in config",
      )
    })

    it('should add stage and initialize shipit', () => {
      shipit.initialize()
      expect(shipit.initSshPool).toBeCalled()
    })
    it('should emit a "init" event', async () => {
	    const spy = jest.fn()
	    shipit.on('init', spy)
	    expect(spy).toHaveBeenCalledTimes(0)
      	    shipit.initialize()
	    expect(spy).toHaveBeenCalledTimes(1)
    })

  })

  describe('#initSshPool', () => {
    it('should initialize an ssh pool', () => {
      shipit.config = { servers: ['deploy@my-server'] }
      shipit.initSshPool()

      expect(shipit.pool).toEqual(expect.any(ConnectionPool))
      expect(shipit.pool.connections[0].remote.user).toBe('deploy')
      expect(shipit.pool.connections[0].remote.host).toBe('my-server')
    })
    it('should emit a "init:after_ssh_pool" event', async () => {
      shipit.config = { servers: ['deploy@my-server'] }
	    const spy = jest.fn()
	    shipit.on('init:after_ssh_pool', spy)
	    expect(spy).toHaveBeenCalledTimes(0)
      	    shipit.initSshPool()
	    expect(spy).toHaveBeenCalledTimes(1)
    })
  })

  describe('#local', () => {
    it('should wrap and log to stdout', async () => {
      stdout.startCapture()
      const res = await shipit.local('echo "hello"')
      expect(stdout.capturedData).toBe('@ hello\n')
      expect(res.stdout).toBeDefined()
      expect(res.stderr).toBeDefined()
      expect(res.child).toBeDefined()
    })
  })

  describe('#remote', () => {
    beforeEach(() => {
      shipit.pool = { run: jest.fn() }
    })

    it('should run command on pool', () => {
      shipit.remote('my-command')

      expect(shipit.pool.run).toBeCalledWith('my-command', undefined)
    })

    it('should support options', () => {
      shipit.remote('my-command', { cwd: '/my-directory' })

      expect(shipit.pool.run).toBeCalledWith('my-command', {
        cwd: '/my-directory',
      })
    })
  })

  describe('#remoteCopy', () => {
    beforeEach(() => {
      shipit.pool = { copy: jest.fn() }
    })

    it('should run command on pool', () => {
      shipit.remoteCopy('src', 'dest')

      expect(shipit.pool.copy).toBeCalledWith('src', 'dest', {
        ignores: [],
        rsync: [],
      })
    })

    it('should accept options for shipit.pool.copy', () => {
      shipit.remoteCopy('src', 'dest', {
        direction: 'remoteToLocal',
      })

      expect(shipit.pool.copy).toBeCalledWith('src', 'dest', {
        direction: 'remoteToLocal',
        ignores: [],
        rsync: [],
      })
    })

    it('should support options specified in config', () => {
      shipit.config = {
        ignores: ['foo'],
        rsync: ['--bar'],
      }

      shipit.remoteCopy('src', 'dest', {
        direction: 'remoteToLocal',
      })

      expect(shipit.pool.copy).toBeCalledWith('src', 'dest', {
        direction: 'remoteToLocal',
        ignores: ['foo'],
        rsync: ['--bar'],
      })
    })

    it('should support show-progress flag', () => {

      shipit.setShowProgress()

      shipit.remoteCopy('src', 'dest', {
        direction: 'remoteToLocal',
      })

      expect(shipit.pool.copy).toBeCalledWith('src', 'dest', {
        direction: 'remoteToLocal',
        ignores: [],
        rsync: ["--progress"],
      })
    })

    it('should support show-stats flag', () => {

      shipit.setShowStats()

      shipit.remoteCopy('src', 'dest', {
        direction: 'remoteToLocal',
      })

      expect(shipit.pool.copy).toBeCalledWith('src', 'dest', {
        direction: 'remoteToLocal',
        ignores: [],
        rsync: ["--stats"],
      })
    })
  })

  describe('#copyFromRemote', () => {
    beforeEach(() => {
      shipit.pool = { copyFromRemote: jest.fn() }
    })

    it('should run command on pool', () => {
      shipit.copyFromRemote('src', 'dest')

      expect(shipit.pool.copyFromRemote).toBeCalledWith('src', 'dest', {
        ignores: [],
        rsync: [],
      })
    })

    it('should accept options for shipit.pool.copyFromRemote', () => {
      shipit.copyFromRemote('src', 'dest', {
        ignores: ['foo'],
      })

      expect(shipit.pool.copyFromRemote).toBeCalledWith('src', 'dest', {
        ignores: ['foo'],
        rsync: [],
      })
    })

    it('should support options specified in config', () => {
      shipit.config = {
        ignores: ['foo'],
        rsync: ['--bar'],
      }

      shipit.copyFromRemote('src', 'dest')

      expect(shipit.pool.copyFromRemote).toBeCalledWith('src', 'dest', {
        ignores: ['foo'],
        rsync: ['--bar'],
      })
    })

    it('should support show-progress flag', () => {

      shipit.setShowProgress()

      shipit.copyFromRemote('src', 'dest')

      expect(shipit.pool.copyFromRemote).toBeCalledWith('src', 'dest', {
        ignores: [],
        rsync: ["--progress"],
      })
    })

    it('should support show-stats flag', () => {

      shipit.setShowStats()

      shipit.copyFromRemote('src', 'dest')

      expect(shipit.pool.copyFromRemote).toBeCalledWith('src', 'dest', {
        ignores: [],
        rsync: ["--stats"],
      })
    })
  })

  describe('#copyToRemote', () => {
    beforeEach(() => {
      shipit.pool = { copyToRemote: jest.fn() }
    })

    it('should run command on pool', () => {
      shipit.copyToRemote('src', 'dest')

      expect(shipit.pool.copyToRemote).toBeCalledWith('src', 'dest', {
        ignores: [],
        rsync: [],
      })
    })

    it('should accept options for shipit.pool.copyToRemote', () => {
      shipit.copyToRemote('src', 'dest', {
        ignores: ['foo'],
      })

      expect(shipit.pool.copyToRemote).toBeCalledWith('src', 'dest', {
        ignores: ['foo'],
        rsync: [],
      })
    })

    it('should support options specified in config', () => {
      shipit.config = {
        ignores: ['foo'],
        rsync: ['--bar'],
      }

      shipit.copyToRemote('src', 'dest')

      expect(shipit.pool.copyToRemote).toBeCalledWith('src', 'dest', {
        ignores: ['foo'],
        rsync: ['--bar'],
      })
    })

    it('should support show-progress flag', () => {

      shipit.setShowProgress()

      shipit.copyToRemote('src', 'dest')

      expect(shipit.pool.copyToRemote).toBeCalledWith('src', 'dest', {
        ignores: [],
        rsync: ["--progress"],
      })
    })

    it('should support show-stats flag', () => {

      shipit.setShowStats()

      shipit.copyToRemote('src', 'dest')

      expect(shipit.pool.copyToRemote).toBeCalledWith('src', 'dest', {
        ignores: [],
        rsync: ["--stats"],
      })
    })
  })
})
