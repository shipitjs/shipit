import path from 'path'
import { joinCommandArgs, requireArgs } from './util'

const isWin = /^win/.test(process.platform)

export function formatCdCommand({ folder }) {
  requireArgs(['folder'], { folder }, 'cd')
  const args = ['cd', folder]
  const { root } = path.parse(folder)
  const drive = root.replace(path.sep, '')
  if (isWin && root !== '/') {
    args.push(`&& ${drive}`)
  }
  return joinCommandArgs(args)
}
