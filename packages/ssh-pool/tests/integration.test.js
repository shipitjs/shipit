import {resolve, basename} from 'path'
import {copyFileSync, unlinkSync} from 'fs';
import {copySync as fseCopySync, removeSync as fseRemoveSync} from 'fs-extra';

const sshPool = require('../src')

describe('ssh-pool', () => {
  let pool

  beforeEach(() => {
    pool = new sshPool.ConnectionPool(['deploy@test.shipitjs.com'], {
      key: resolve(__dirname, '../../../ssh/id_rsa'),
    })
  })

  it('should run a command remotely', async () => {
    const [{ stdout }] = await pool.run('hostname')
    expect(stdout).toBe('shipit-test\n')
  }, 10000)

  it('should escape command properly', async () => {
    const [{ stdout: first }] = await pool.run('echo $USER')
    expect(first).toBe('deploy\n')

    const [{ stdout: second }] = await pool.run("echo '$USER'")
    expect(second).toBe('$USER\n')
  }, 10000)

  it('should copy a file to remote', async () => {
    const time = (+new Date);
    const sourceFile = resolve(__dirname, '__fixtures__/test.txt')
    const targetFile = `${__dirname}/__fixtures__/test.${time}.txt`;

    copyFileSync(sourceFile, targetFile);

    try {
      await pool.scpCopyToRemote(targetFile, './',);
      const [{ stdout: first }] = await pool.run(`cd ./ && cat ${basename(targetFile)}`);
      expect(first).toBe('Hello\n')
    } finally {
      unlinkSync(targetFile);
    }

  }, 1e6)

  it('should copy a folder to remote', async () => {
    const time = (+new Date);
    const sourceFile = resolve(__dirname, '__fixtures__/anotherfolder')
    const targetFile = `${__dirname}/__fixtures__/anotherfolder${time}`;

    fseCopySync(sourceFile, targetFile);

    try {
      await pool.scpCopyToRemote(targetFile, './',);
      const [{ stdout: first }] = await pool.run(`ls -la | grep anotherfolder${time}`);
      const [{ stdout: second }] = await pool.run(`cat ./anotherfolder${time}/test.txt`);
      expect(first).toContain(`anotherfolder${time}\n`)
      expect(second).toBe('Hello from anotherfolder\n')
    } finally {
      fseRemoveSync(targetFile);
    }

  }, 1e6)
})
