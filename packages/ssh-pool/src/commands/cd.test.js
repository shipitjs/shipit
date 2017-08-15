import { formatCdCommand } from './cd'

describe('mkdir', () => {
  describe('#formatCdCommand', () => {
    describe('without "folder"', () => {
      it('should throw an error', () => {
        expect(() => formatCdCommand({})).toThrow(
          '"folder" argument is required in "cd" command',
        )
      })
    })

    it('should format command', () => {
      expect(formatCdCommand({ folder: 'xxx' })).toBe('cd xxx')
    })
  })
})
