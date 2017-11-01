import Shipit from 'shipit-cli'
import path from 'path2/posix'
import { start } from '../../../tests/util'
import finishTask from './finish'

describe('rollback:finish task', () => {
  let shipit
  const readLinkCommand =
    'if [ -h /remote/deploy/current ]; then readlink /remote/deploy/current; fi'

  beforeEach(() => {
    shipit = new Shipit({
      environment: 'test',
      log: jest.fn(),
    })

    finishTask(shipit)

    // Shipit config
    shipit.initConfig({
      test: {
        deployTo: '/remote/deploy',
        deleteOnRollback: false,
      },
    })

    shipit.releasePath = '/remote/deploy/releases/20141704123137'
    shipit.releaseDirname = '20141704123137'
    shipit.currentPath = path.join(shipit.config.deployTo, 'current')
    shipit.releasesPath = path.join(shipit.config.deployTo, 'releases')
    shipit.rollbackDirName = '20141704123137'
  })

  describe('delete rollbacked release', () => {
    beforeEach(() => {
      shipit.remote = jest.fn(async command => {
        switch (command) {
          case readLinkCommand:
            return [{ stdout: '/remote/deploy/releases/20141704123136\n' }]
          case 'ls -r1 /remote/deploy/releases':
            return [{ stdout: '20141704123137\n20141704123136\n' }]
          case 'rm -rf /remote/deploy/releases/20141704123137':
          default:
            return []
        }
      })
      shipit.config.deleteOnRollback = true
    })

    it('undefined releases path', async () => {
      expect.assertions(1)
      try {
        await start(shipit, 'rollback:finish')
      } catch (err) {
        expect(err.message).toBe("Can't find release to delete")
      }
    })

    it('undefined previous directory name', async () => {
      shipit.prevReleasePath = '/remote/deploy/releases/'
      expect.assertions(1)
      try {
        await start(shipit, 'rollback:finish')
      } catch (err) {
        expect(err.message).toBe("Can't find release to delete")
      }
    })

    it('successful delete', async () => {
      // set up test specific variables
      shipit.prevReleaseDirname = '20141704123137'
      shipit.prevReleasePath = '/remote/deploy/releases/20141704123137'

      const spy = jest.fn()
      shipit.on('rollbacked', spy)
      await start(shipit, 'rollback:finish')
      expect(shipit.prevReleaseDirname).toBe('20141704123137')
      expect(shipit.remote).toBeCalledWith(
        'rm -rf /remote/deploy/releases/20141704123137',
      )
      expect(spy).toBeCalled()
    })
  })

  it('should emit an event', async () => {
    const spy = jest.fn()
    shipit.on('rollbacked', spy)
    await start(shipit, 'rollback:finish')
    expect(spy).toBeCalled()
  })
})
