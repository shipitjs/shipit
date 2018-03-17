import path from 'path2/posix'
import Shipit from 'shipit-cli'
import { start } from '../../../tests/util'
import publishTask from './publish'

describe('deploy:publish task', () => {
  let shipit

  beforeEach(() => {
    shipit = new Shipit({
      environment: 'test',
      log: jest.fn(),
    })

    publishTask(shipit)

    // Shipit config
    shipit.initConfig({
      test: {
        deployTo: '/remote/deploy',
      },
    })

    shipit.releasePath = '/remote/deploy/releases/20141704123138'
    shipit.releaseDirname = '20141704123138'
    shipit.currentPath = path.join(shipit.config.deployTo, 'current')
    shipit.releasesPath = path.join(shipit.config.deployTo, 'releases')

    shipit.remote = jest.fn(async () => [])
  })

  it('should update the symbolic link', async () => {
    await start(shipit, 'deploy:publish')
    expect(shipit.currentPath).toBe('/remote/deploy/current')
    expect(shipit.remote).toBeCalledWith(
      'cd /remote/deploy && if [ -d current ] && [ ! -L current ]; then echo "ERR: could not make symlink"; else ln -nfs releases/20141704123138 current_tmp && mv -fT current_tmp current; fi',
    )
  })
})
