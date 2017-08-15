import { joinCommandArgs, requireArgs } from './util'

export function formatMkdirCommand({ folder }) {
  requireArgs(['folder'], { folder }, 'mkdir')
  const args = ['mkdir', '-p', folder]
  return joinCommandArgs(args)
}
