import Shipit from 'shipit-cli'
import { start } from '../../../tests/util'
import logTask from './log'

describe('pending:log task', () => {
  let shipit

  beforeEach(() => {
    shipit = new Shipit({
      environment: 'test',
      log: jest.fn(),
    })

    logTask(shipit)

    // Shipit config
    shipit.initConfig({
      test: {
        deployTo: '/remote/deploy',
      },
    })

    shipit.releasePath = '/remote/deploy/releases/20141704123138'
    shipit.releaseDirname = '20141704123138'

    shipit.remote = jest.fn(async () => [])
  })

  describe('#getPendingCommits', () => {
    describe('no current release', () => {
      it('should return null', async () => {
        await start(shipit, 'pending:log')
        const commits = await shipit.getPendingCommits()
        expect(commits).toBe(null)
      })
    })
  })
})
