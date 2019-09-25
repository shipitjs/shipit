import path from 'path'
import { joinCommandArgs, requireArgs } from './util'

const isWin = /^win/.test(process.platform)

export function formatCdCommand({ folder }) {
  requireArgs(['folder'], { folder }, 'cd')
  const args = ['cd', folder]
  const { root } = path.parse(folder)
  if (isWin && root !== '/') {
    args.push(`&& ${root}`)
  }
  return joinCommandArgs(args)
}
