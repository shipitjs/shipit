import Shipit from 'shipit-cli'
import { start } from '../../../tests/util'
import finishTask from './finish'

describe('deploy:finish task', () => {
  let shipit

  beforeEach(() => {
    shipit = new Shipit({
      environment: 'test',
      log: jest.fn(),
    })

    finishTask(shipit)

    // Shipit config.
    shipit.initConfig({
      test: {
        deployTo: '/',
      },
    })
    shipit.releasesPath = '/remote/deploy/releases'
  })

  it('should emit a "deployed" event', async () => {
    const spy = jest.fn()
    shipit.on('deployed', spy)
    expect(spy).toHaveBeenCalledTimes(0)
    await start(shipit, 'deploy:finish')
    expect(spy).toHaveBeenCalledTimes(1)
  })
})
