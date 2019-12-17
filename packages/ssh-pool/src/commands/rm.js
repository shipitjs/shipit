import { joinCommandArgs, requireArgs } from './util'
import { formatRawCommand } from './raw'

export function formatRmCommand({ asUser, file }) {
  requireArgs(['file'], { file }, 'rm')
  return formatRawCommand({
    asUser,
    command: joinCommandArgs(['rm', file]),
  })
}
