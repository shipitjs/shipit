import Shipit from 'shipit-cli'
import { start } from '../../../tests/util'
import initTask from './init'

describe('deploy:init task', () => {
  let shipit

  beforeEach(() => {
    shipit = new Shipit({
      environment: 'test',
      log: jest.fn(),
    })

    initTask(shipit)

    // Shipit config.
    shipit.initConfig({
      test: {
        deployTo: '/',
      },
    })
    shipit.releasesPath = '/remote/deploy/releases'
  })

  it('should emit a "deploy" event', async () => {
    const spy = jest.fn()
    shipit.on('deploy', spy)
    expect(spy).toHaveBeenCalledTimes(0)
    await start(shipit, 'deploy:init')
    expect(spy).toHaveBeenCalledTimes(1)
  })
})
