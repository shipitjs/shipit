import path from 'path'
import { exec } from 'ssh-pool'

const shipitCli = path.resolve(__dirname, '../src/cli.js')
const shipitFile = path.resolve(__dirname, './sandbox/shipitfile.babel.js')

describe('shipit-cli', () => {
  it('should run a local task', async () => {
    const { stdout } = await exec(
      `babel-node ${shipitCli} --shipitfile ${shipitFile} test localHello`,
    )
    expect(stdout).toMatch(/Running 'localHello' task.../)
    expect(stdout).toMatch(/Running "echo "hello"" on local./)
    expect(stdout).toMatch(/@ hello/)
    expect(stdout).toMatch(/Finished 'localHello' after/)
  })

  it('should run a remote task', async () => {
    const { stdout } = await exec(
      `babel-node ${shipitCli} --shipitfile ${shipitFile} test remoteUser`,
    )
    expect(stdout).toMatch(/Running 'remoteUser' task.../)
    expect(stdout).toMatch(/Running "echo \$USER" on host "test.shipitjs.com"./)
    expect(stdout).toMatch(/@test.shipitjs.com deploy/)
    expect(stdout).toMatch(/Finished 'remoteUser' after/)
  })
})
