import stream from 'mock-utf8-stream'
import { ConnectionPool } from 'ssh-pool'
import Shipit from './Shipit'

describe('Shipit', () => {
  let shipit
  let stdout
  let stderr

  beforeEach(() => {
    stdout = new stream.MockWritableStream()
    stderr = new stream.MockWritableStream()
    shipit = new Shipit({
      stdout,
      stderr,
      environment: 'stage',
    })
    shipit.stage = 'stage'
  })

  describe('#initConfig', () => {
    it('should set config and envConfig', () => {
      const config = {
        default: { foo: 'bar', servers: ['1', '2'] },
        stage: { kung: 'foo', servers: ['3'] },
      }

      shipit.initConfig(config)

      expect(shipit.config).toEqual({
        branch: 'master',
        keepReleases: 5,
        foo: 'bar',
        kung: 'foo',
        servers: ['3'],
        shallowClone: false,
      })

      expect(shipit.envConfig).toBe(config)
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
  })

  describe('#initSshPool', () => {
    it('should initialize an ssh pool', () => {
      shipit.config = { servers: ['deploy@my-server'] }
      shipit.initSshPool()

      expect(shipit.pool).toEqual(expect.any(ConnectionPool))
      expect(shipit.pool.connections[0].remote.user).toBe('deploy')
      expect(shipit.pool.connections[0].remote.host).toBe('my-server')
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

      expect(shipit.pool.run).toBeCalledWith('my-command', {})
    })

    it('should cd and run command on pool', () => {
      shipit.remote('my-command', { cwd: '/my-directory' })

      expect(shipit.pool.run).toBeCalledWith(
        'cd "/my-directory" && my-command',
        {},
      )
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
  })
})
