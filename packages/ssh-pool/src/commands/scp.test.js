import { formatScpCommand } from './scp'

describe('scp', () => {
  describe('#formatScpCommand', () => {
    describe('without "src" or "dest"', () => {
      it('should throw an error', () => {
        expect(() => formatScpCommand({})).toThrow(
          '"src" argument is required in "scp" command',
        )
        expect(() => formatScpCommand({ dest: 'foo' })).toThrow(
          '"src" argument is required in "scp" command',
        )
        expect(() => formatScpCommand({ src: 'foo' })).toThrow(
          '"dest" argument is required in "scp" command',
        )
      })
    })

    it('should support src and dest', () => {
      expect(formatScpCommand({ src: 'file.js', dest: 'foo/' })).toBe(
        'scp file.js foo/',
      )
    })

    it('should support port', () => {
      expect(
        formatScpCommand({ src: 'file.js', dest: 'foo/', port: 3000 }),
      ).toBe('scp -P 3000 file.js foo/')
    })
    it('should support proxy', () => {
      expect(
        formatScpCommand({ src: 'file.js', dest: 'foo/', port: 3000, proxy:'ssh -W %h:%p user@bastion'  }),
      ).toBe('scp -o "ProxyCommand ssh -W %h:%p user@bastion" -P 3000 file.js foo/')
    })
    it('should support key', () => {
      expect(
        formatScpCommand({
          src: 'file.js',
          dest: 'foo/',
          key: 'foo',
        }),
      ).toBe('scp -i foo file.js foo/')
    })
  })
})
