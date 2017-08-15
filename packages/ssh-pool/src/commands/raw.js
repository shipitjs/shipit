import { joinCommandArgs } from './util'
import { deprecateV3 } from '../util'

const SUDO_REGEXP = /sudo\s/

export function formatRawCommand({ asUser, command }) {
  let args = []
  if (asUser) args = [...args, 'sudo', '-u', asUser]
  // Deprecate
  if (asUser && command) {
    if (command.match(SUDO_REGEXP)) {
      deprecateV3(
        'You should not use "sudo" and "asUser" options together. Please remove "sudo" from command.',
      )
    }
    args = [...args, command.replace(SUDO_REGEXP, '')]
  } else if (command) args = [...args, command]
  return joinCommandArgs(args)
}
