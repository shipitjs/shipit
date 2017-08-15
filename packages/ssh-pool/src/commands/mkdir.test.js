import { formatMkdirCommand } from './mkdir'

describe('mkdir', () => {
  describe('#formatMkdirCommand', () => {
    describe('without "folder"', () => {
      it('should throw an error', () => {
        expect(() => formatMkdirCommand({})).toThrow(
          '"folder" argument is required in "mkdir" command',
        )
      })
    })

    it('should format command', () => {
      expect(formatMkdirCommand({ folder: 'xxx' })).toBe('mkdir -p xxx')
    })
  })
})
