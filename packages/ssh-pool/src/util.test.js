import * as childProcess from 'child_process'
import { series, exec } from './util'

jest.mock('child_process')

describe('util', () => {
  describe('#series', () => {
    it('should run tasks in series', async () => {
      const results = await series([async () => 'foo', async () => 'bar'])
      expect(results).toEqual(['foo', 'bar'])
    })

    it('should handle errors', async () => {
      expect.assertions(1)
      try {
        await series([
          async () => {
            throw new Error('bad')
          },
          async () => 'bar',
        ])
      } catch (error) {
        expect(error.message).toBe('bad')
      }
    })
  })

  describe('#exec', () => {
    it('should accept a childModifier', () => {
      const childModifier = jest.fn()
      exec('test', { foo: 'bar' }, childModifier)
      expect(childModifier).toBeCalled()
    })

    it('should return child, stdout and stderr', async () => {
      const result = await exec('test', { foo: 'bar' })
      expect(result.child).toBeDefined()
      expect(result.stdout).toBeDefined()
      expect(result.stderr).toBeDefined()
    })

    it('should return child, stdout and stderr', async () => {
      childProcess.exec = jest.fn((command, options, callback) => {
        setTimeout(() => callback(new Error('Oups'), 'stdout', 'stderr'))
        return 'child'
      })
      expect.assertions(4)
      try {
        await exec('test', { foo: 'bar' })
      } catch (error) {
        expect(error.child).toBeDefined()
        expect(error.stdout).toBeDefined()
        expect(error.stderr).toBeDefined()
        expect(error.message).toBe('Oups')
      }
    })
  })
})
