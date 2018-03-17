import { joinCommandArgs, requireArgs } from './util'

function formatExcludes(excludes) {
  return excludes.reduce(
    (args, current) => [...args, '--exclude', `"${current}"`],
    [],
  )
}

export function formatTarCommand({ file, archive, excludes, mode }) {
  let args = ['tar']
  switch (mode) {
    case 'compress': {
      requireArgs(['file', 'archive'], { file, archive }, 'tar')
      if (excludes) args = [...args, ...formatExcludes(excludes)]
      args = [...args, '-czf', archive, file]
      return joinCommandArgs(args)
    }
    case 'extract': {
      requireArgs(['archive'], { file, archive }, 'tar')
      args = [...args, '--strip-components=1']
      args = [...args, '-xzf', archive]
      return joinCommandArgs(args)
    }
    default:
      throw new Error(
        `mode "${mode}" is not valid in "tar" command (valid values: ["extract", "compress"])`,
      )
  }
}
