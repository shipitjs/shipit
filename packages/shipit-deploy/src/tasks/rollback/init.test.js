import Shipit from 'shipit-cli'
import { start } from '../../../tests/util'
import initTask from './init'

describe('rollback:init task', () => {
  let shipit
  const readLinkCommand =
    'if [ -h /remote/deploy/current ]; then readlink /remote/deploy/current; fi'

  beforeEach(() => {
    shipit = new Shipit({
      environment: 'test',
      log: jest.fn(),
    })

    initTask(shipit)

    // Shipit config
    shipit.initConfig({
      test: {
        deployTo: '/remote/deploy',
      },
    })
  })

  describe('#getCurrentReleaseDirName', () => {
    describe('unsync server', () => {
      beforeEach(() => {
        shipit.remote = jest.fn(async () => [
          { stdout: '/remote/deploy/releases/20141704123138' },
          { stdout: '/remote/deploy/releases/20141704123137' },
        ])
      })

      it('should return an error', async () => {
        expect.assertions(2)
        try {
          await start(shipit, 'rollback:init')
        } catch (err) {
          expect(shipit.remote).toBeCalledWith(readLinkCommand)
          expect(err.message).toBe('Remote servers are not synced.')
        }
      })
    })

    describe('bad release dirname', () => {
      beforeEach(() => {
        shipit.remote = jest.fn(async () => [])
      })

      it('should return an error', async () => {
        expect.assertions(2)
        try {
          await start(shipit, 'rollback:init')
        } catch (err) {
          expect(shipit.remote).toBeCalledWith(readLinkCommand)
          expect(err.message).toBe('Cannot find current release dirname.')
        }
      })
    })
  })

  describe('#getReleases', () => {
    describe('unsync server', () => {
      beforeEach(() => {
        shipit.remote = jest.fn(async command => {
          if (command === readLinkCommand)
            return [{ stdout: '/remote/deploy/releases/20141704123137' }]
          if (command === 'ls -r1 /remote/deploy/releases')
            return [
              { stdout: '20141704123137\n20141704123134\n' },
              { stdout: '20141704123137\n20141704123133\n' },
            ]
          return null
        })
      })

      it('should return an error', async () => {
        expect.assertions(2)
        try {
          await start(shipit, 'rollback:init')
        } catch (err) {
          expect(shipit.remote).toBeCalledWith('ls -r1 /remote/deploy/releases')
          expect(err.message).toBe('Remote servers are not synced.')
        }
      })
    })

    describe('bad releases', () => {
      beforeEach(() => {
        shipit.remote = jest.fn(async command => {
          if (command === readLinkCommand)
            return [{ stdout: '/remote/deploy/releases/20141704123137' }]
          if (command === 'ls -r1 /remote/deploy/releases') return []

          return null
        })
      })

      it('should return an error', async () => {
        expect.assertions(3)
        try {
          await start(shipit, 'rollback:init')
        } catch (err) {
          expect(shipit.remote).toBeCalledWith(readLinkCommand)
          expect(shipit.remote).toBeCalledWith('ls -r1 /remote/deploy/releases')
          expect(err.message).toBe('Cannot read releases.')
        }
      })
    })
  })

  describe('release not exists', () => {
    beforeEach(() => {
      shipit.remote = jest.fn(async command => {
        if (command === readLinkCommand)
          return [{ stdout: '/remote/deploy/releases/20141704123137' }]
        if (command === 'ls -r1 /remote/deploy/releases')
          return [{ stdout: '20141704123137' }]

        return null
      })
    })

    it('should return an error', async () => {
      expect.assertions(3)
      try {
        await start(shipit, 'rollback:init')
      } catch (err) {
        expect(shipit.remote).toBeCalledWith(readLinkCommand)
        expect(shipit.remote).toBeCalledWith('ls -r1 /remote/deploy/releases')
        expect(err.message).toBe('Cannot rollback, release not found.')
      }
    })
  })

  describe('all good', () => {
    beforeEach(() => {
      shipit.remote = jest.fn(async command => {
        if (command === readLinkCommand)
          return [{ stdout: '/remote/deploy/releases/20141704123137\n' }]
        if (command === 'ls -r1 /remote/deploy/releases')
          return [{ stdout: '20141704123137\n20141704123136\n' }]
        return null
      })
    })

    it('define path', async () => {
      await start(shipit, 'rollback:init')
      expect(shipit.currentPath).toBe('/remote/deploy/current')
      expect(shipit.releasesPath).toBe('/remote/deploy/releases')
      expect(shipit.remote).toBeCalledWith(readLinkCommand)
      expect(shipit.remote).toBeCalledWith('ls -r1 /remote/deploy/releases')
      expect(shipit.releaseDirname).toBe('20141704123136')
      expect(shipit.releasePath).toBe('/remote/deploy/releases/20141704123136')
    })
  })
})
