import path from 'path'
import { exec } from 'ssh-pool'

const shipitCli = path.resolve(__dirname, '../src/cli.js')
const shipitFile = path.resolve(__dirname, './sandbox/shipitfile.babel.js')
const babelNode = require.resolve('@babel/node/bin/babel-node');

describe('shipit-cli', () => {
  it('should run a local task', async () => {
    let { stdout } = await exec(`FORCE_COLOR=0 ${babelNode} ${shipitCli} --shipitfile ${shipitFile} test localHello`)
    stdout = stdout.trim();

    expect(stdout).toMatch(/Running 'localHello' task.../)
    expect(stdout).toMatch(/Running "echo "hello"" on local./)
    expect(stdout).toMatch(/@ hello/)
    expect(stdout).toMatch(/Finished 'localHello' after/)
  }, 10000)

  it('should run a remote task', async () => {
    let { stdout } = await exec(`FORCE_COLOR=0 ${babelNode} ${shipitCli} --shipitfile ${shipitFile} test remoteUser`)
    stdout = stdout.trim();

    expect(stdout).toMatch(/Running 'remoteUser' task.../)
    expect(stdout).toMatch(/Running "echo \$USER" on host "test.shipitjs.com"./)
    expect(stdout).toMatch(/@test.shipitjs.com deploy/)
    expect(stdout).toMatch(/Finished 'remoteUser' after/)
  }, 10000)

  it('should work with "~"', async () => {
    const { stdout } = await exec(
      `${babelNode} ${shipitCli} --shipitfile ${shipitFile} test cwdSsh`,
    )
    expect(stdout).toMatch(/@test.shipitjs.com \/home\/deploy\/\.ssh/)
  }, 10000)
})
