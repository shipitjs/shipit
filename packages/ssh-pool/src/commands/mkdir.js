import { joinCommandArgs, requireArgs } from './util'
import { formatRawCommand } from './raw'

export function formatMkdirCommand({ asUser, folder }) {
  requireArgs(['folder'], { folder }, 'mkdir')
  return formatRawCommand({
    asUser,
    command: joinCommandArgs(['mkdir', '-p', folder]),
  })
}
