import path from 'path'
import { exec } from 'ssh-pool'

const shipitCli = path.resolve(__dirname, '../../shipit-cli/src/cli.js')
const shipitFile = path.resolve(__dirname, './sandbox/shipitfile.babel.js')

jest.setTimeout(40000)

describe('shipit-cli', () => {
  it(
    'should run a local task',
    async () => {
      await exec(
        `babel-node ${shipitCli} --shipitfile ${shipitFile} test deploy`,
      )

      const { stdout: lsReleases } = await exec(
        `babel-node ${shipitCli} --shipitfile ${shipitFile} test ls-releases`,
      )

      const latestRelease = lsReleases
        .split('\n')
        .reverse()[2]
        .match(/\d{14}/)[0]

      const { stdout: lsCurrent } = await exec(
        `babel-node ${shipitCli} --shipitfile ${shipitFile} test ls-current`,
      )

      const currentRelease = lsCurrent
        .split('\n')[3]
        .match(/releases\/(\d{14})/)[1]

      expect(latestRelease).toBe(currentRelease)
    },
    20000,
  )
})
