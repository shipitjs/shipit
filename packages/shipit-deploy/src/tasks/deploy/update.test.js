import moment from 'moment'
import _ from 'lodash'
import rmfr from 'rmfr'
import path from 'path2/posix'
import Shipit from 'shipit-cli'
import { start } from '../../../tests/util'
import updateTask from './update'

jest.mock('rmfr')

function createShipitInstance(config) {
  const shipit = new Shipit({
    environment: 'test',
    log: jest.fn(),
  })

  updateTask(shipit)

  // Shipit config
  shipit.initConfig({
    test: _.merge(
      {
        workspace: '/tmp/workspace',
        deployTo: '/remote/deploy',
      },
      config,
    ),
  })

  shipit.workspace = '/tmp/workspace'
  shipit.currentPath = path.join(shipit.config.deployTo, 'current')
  shipit.releasesPath = path.join(shipit.config.deployTo, 'releases')

  return shipit
}

function stubShipit(shipit) {
  /* eslint-disable no-param-reassign */
  shipit.remote = jest.fn(async () => [])
  shipit.remoteCopy = jest.fn(async () => [])
  shipit.local = jest.fn(async command => {
    switch (command) {
      case `git rev-parse ${shipit.config.branch}`:
        return { stdout: '9d63d434a921f496c12854a53cef8d293e2b4756\n' }
      default:
        return {}
    }
  })
  /* eslint-enable no-param-reassign */
}

describe('deploy:update task', () => {
  let shipit

  beforeEach(() => {
    shipit = createShipitInstance()
    moment.utc = () => ({
      format: jest.fn(format => format),
    })
  })

  describe('update release', () => {
    beforeEach(() => {
      stubShipit(shipit)
    })

    it('should create release path, and do a remote copy', async () => {
      await start(shipit, 'deploy:update')
      expect(shipit.releaseDirname).toBe('YYYYMMDDHHmmss')
      expect(shipit.releasesPath).toBe('/remote/deploy/releases')
      expect(shipit.releasePath).toBe('/remote/deploy/releases/YYYYMMDDHHmmss')
      expect(shipit.remote).toBeCalledWith(
        'mkdir -p /remote/deploy/releases/YYYYMMDDHHmmss',
      )
      expect(shipit.remoteCopy).toBeCalledWith(
        '/tmp/workspace/',
        '/remote/deploy/releases/YYYYMMDDHHmmss',
        { rsync: '--del' },
      )
    })

    describe('dirToCopy option', () => {
      it('should correct join relative path', () => {
        const paths = [
          { res: '/tmp/workspace/build/', dirToCopy: 'build' },
          { res: '/tmp/workspace/build/', dirToCopy: './build' },
          { res: '/tmp/workspace/build/', dirToCopy: './build/' },
          { res: '/tmp/workspace/build/', dirToCopy: 'build/.' },
          { res: '/tmp/workspace/build/src/', dirToCopy: 'build/src' },
          { res: '/tmp/workspace/build/src/', dirToCopy: 'build/src' },
        ]
        return Promise.all(
          paths.map(async p => {
            const sh = createShipitInstance({
              dirToCopy: p.dirToCopy,
            })
            stubShipit(sh)
            await start(sh, 'deploy:update')
            expect(sh.remoteCopy).toBeCalledWith(
              p.res,
              '/remote/deploy/releases/YYYYMMDDHHmmss',
              {
                rsync: '--del',
              },
            )
          }),
        )
      })
    })

    describe('remoteCopy option', () => {
      it('should accept rsync options', async () => {
        const sh = createShipitInstance({
          deploy: { remoteCopy: { rsync: '--foo' } },
        })
        stubShipit(sh)

        await start(sh, 'deploy:update')

        expect(sh.remoteCopy).toBeCalledWith(
          '/tmp/workspace/',
          '/remote/deploy/releases/YYYYMMDDHHmmss',
          { rsync: '--foo' },
        )
      })
    })
  })

  describe('#setPreviousRevision', () => {
    beforeEach(() => {
      stubShipit(shipit)
    })

    describe('no previous revision', () => {
      it('should set shipit.previousRevision to null', async () => {
        await start(shipit, 'deploy:update')

        expect(shipit.previousRevision).toBe(null)
        expect(shipit.local).toBeCalledWith(
          `git rev-parse ${shipit.config.branch}`,
          { cwd: '/tmp/workspace' },
        )
      })
    })
  })

  describe('#setPreviousRelease', () => {
    beforeEach(() => {
      stubShipit(shipit)
    })

    it('should set shipit.previousRelease to null when no previous release', async () => {
      await start(shipit, 'deploy:update')
      expect(shipit.previousRelease).toBe(null)
    })

    it('should set shipit.previousRelease to (still) current release when one release exist', async () => {
      shipit.remote = jest.fn(async () => [{ stdout: '20141704123137\n' }])
      await start(shipit, 'deploy:update')
      expect(shipit.previousRelease).toBe('20141704123137')
    })
  })

  describe('#copyPreviousRelease', () => {
    beforeEach(() => {
      stubShipit(shipit)
    })

    describe('no previous release', () => {
      it('should proceed with rsync', async () => {
        await start(shipit, 'deploy:update')
        expect(shipit.previousRelease).toBe(null)
      })
    })
  })

  describe('#setCurrentRevision', () => {
    beforeEach(() => {
      stubShipit(shipit)
      shipit.remote = jest.fn(async command => {
        if (/^if \[ -f/.test(command)) {
          return [{ stdout: '9d63d434a921f496c12854a53cef8d293e2b4756\n' }]
        }

        if (
          command ===
          'if [ -h /remote/deploy/current ]; then readlink /remote/deploy/current; fi'
        ) {
          return [{ stdout: '/remote/deploy/releases/20141704123137' }]
        }

        if (command === 'ls -r1 /remote/deploy/releases') {
          return [
            { stdout: '20141704123137\n20141704123133\n' },
            { stdout: '20141704123137\n20141704123133\n' },
          ]
        }

        if (/^cp/.test(command)) {
          const args = command.split(' ')
          if (/\/.$/.test(args[args.length - 2]) === false) {
            throw new Error('Copy folder contents, not the folder itself')
          }
        }

        return [{ stdout: '' }]
      })
    })

    it('should set shipit.currentRevision', async () => {
      await start(shipit, 'deploy:update')
      expect(shipit.currentRevision).toBe(
        '9d63d434a921f496c12854a53cef8d293e2b4756',
      )
    })

    it('should update remote REVISION file', async () => {
      await start(shipit, 'deploy:update')
      const revision = await shipit.getRevision('20141704123137')
      expect(revision).toBe('9d63d434a921f496c12854a53cef8d293e2b4756')
    })

    it('should copy contents of previous release into new folder', async () => {
      await start(shipit, 'deploy:update')
      expect(shipit.previousRelease).not.toBe(null)
    })
  })

  it('should remove workspace when shallow cloning', async () => {
    shipit.config.shallowClone = true
    stubShipit(shipit)
    rmfr.mockClear()
    expect(rmfr).not.toHaveBeenCalled()
    await start(shipit, 'deploy:update')
    expect(rmfr).toHaveBeenCalledWith('/tmp/workspace')
  })

  it('should keep workspace when not shallow cloning', async () => {
    shipit.config.shallowClone = false
    stubShipit(shipit)
    rmfr.mockClear()
    expect(rmfr).not.toHaveBeenCalled()
    await start(shipit, 'deploy:update')
    expect(rmfr).not.toHaveBeenCalledWith('/tmp/workspace')
  })
})
