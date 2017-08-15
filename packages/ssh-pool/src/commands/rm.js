import { joinCommandArgs, requireArgs } from './util'

export function formatRmCommand({ file }) {
  requireArgs(['file'], { file }, 'rm')
  const args = ['rm', file]
  return joinCommandArgs(args)
}
