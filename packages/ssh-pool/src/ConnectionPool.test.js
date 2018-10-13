import { __setPaths__ } from 'which'
import { exec } from 'child_process'
import * as util from './util'
import Connection from './Connection'
import ConnectionPool from './ConnectionPool'

jest.mock('which')
jest.mock('child_process')

describe('ConnectionPool', () => {
  beforeEach(() => {
    util.deprecateV3 = jest.fn()
    __setPaths__({ rsync: '/bin/rsync' })
  })

  describe('constructor', () => {
    it('should be possible to create a new ConnectionPool using shorthand syntax', () => {
      const pool = new ConnectionPool(['myserver', 'myserver2'])
      expect(pool.connections[0].remote).toEqual({
        user: 'deploy',
        host: 'myserver',
      })

      expect(pool.connections[1].remote).toEqual({
        user: 'deploy',
        host: 'myserver2',
      })
    })

    it('should be possible to create a new ConnectionPool with long syntax', () => {
      const connection1 = new Connection({ remote: 'myserver' })
      const connection2 = new Connection({ remote: 'myserver2' })
      const pool = new ConnectionPool([connection1, connection2])
      expect(pool.connections[0]).toBe(connection1)
      expect(pool.connections[1]).toBe(connection2)
    })
  })

  describe('#run', () => {
    let connection1
    let connection2
    let pool

    beforeEach(() => {
      connection1 = new Connection({ remote: 'myserver' })
      connection2 = new Connection({ remote: 'myserver2' })
      pool = new ConnectionPool([connection1, connection2])
    })

    it('should run command on each connection', async () => {
      const results = await pool.run('my-command -x', { cwd: '/root' })
      expect(results[0].stdout.toString()).toBe('stdout')
      expect(results[1].stdout.toString()).toBe('stdout')
      expect(exec).toHaveBeenCalledWith(
        'ssh deploy@myserver2 "cd /root > /dev/null; my-command -x; cd - > /dev/null"',
        {
          maxBuffer: 1000 * 1024,
        },
        expect.any(Function),
      )
      expect(exec).toHaveBeenCalledWith(
        'ssh deploy@myserver "cd /root > /dev/null; my-command -x; cd - > /dev/null"',
        {
          maxBuffer: 1000 * 1024,
        },
        expect.any(Function),
      )
    })
  })

  describe('#copy', () => {
    let connection1
    let connection2
    let pool

    beforeEach(() => {
      connection1 = new Connection({ remote: 'myserver' })
      connection2 = new Connection({ remote: 'myserver2' })
      pool = new ConnectionPool([connection1, connection2])
    })

    it('should run command on each connection', async () => {
      const results = await pool.copy('/src/dir', '/dest/dir')
      expect(results[0].stdout.toString()).toBe('stdout')
      expect(results[1].stdout.toString()).toBe('stdout')

      expect(exec).toHaveBeenCalledWith(
        'rsync --archive --compress --rsh "ssh" /src/dir deploy@myserver:/dest/dir',
        { maxBuffer: 1024000 },
        expect.any(Function),
      )

      expect(exec).toHaveBeenCalledWith(
        'rsync --archive --compress --rsh "ssh" /src/dir deploy@myserver2:/dest/dir',
        { maxBuffer: 1024000 },
        expect.any(Function),
      )
    })
  })
})
