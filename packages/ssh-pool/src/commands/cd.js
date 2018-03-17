import { joinCommandArgs, requireArgs } from './util'

export function formatCdCommand({ folder }) {
  requireArgs(['folder'], { folder }, 'cd')
  const args = ['cd', folder]
  return joinCommandArgs(args)
}
