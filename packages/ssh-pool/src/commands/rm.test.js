import { formatRmCommand } from './rm'

describe('rm', () => {
  describe('#formatRmCommand', () => {
    describe('without "file"', () => {
      it('should throw an error', () => {
        expect(() => formatRmCommand({})).toThrow(
          '"file" argument is required in "rm" command',
        )
      })
    })

    it('should format command', () => {
      expect(formatRmCommand({ file: 'xxx' })).toBe('rm xxx')
    })
  })
})
