/* eslint-disable import/no-extraneous-dependencies */
import path from 'path'
import { exec } from 'ssh-pool'

const shipitCli = path.resolve(__dirname, '../../shipit-cli/src/cli.js')
const shipitFile = path.resolve(__dirname, './sandbox/shipitfile.babel.js')

describe('shipit-cli', () => {
  it(
    'should run a local task',
    async () => {
      try {
        await exec(
          `babel-node ${shipitCli} --shipitfile ${shipitFile} test deploy`,
        )
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error.stdout)

        throw error
      }

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
    25000,
  )
})
