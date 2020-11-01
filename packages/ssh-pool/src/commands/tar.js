import { joinCommandArgs, requireArgs } from './util'

function formatExcludes(excludes) {
  return excludes.reduce(
    (args, current) => [...args, '--exclude', `"${current}"`],
    [],
  )
}

export function formatTarCommand({ file: fileOrDir, archive, excludes, mode }) {
  let args = ['tar']
  switch (mode) {
    case 'compress': {
      requireArgs(['file', 'archive'], { file: fileOrDir, archive }, 'tar')
      if (excludes) args = [...args, ...formatExcludes(excludes)]
      args = [...args, '-czf', archive, fileOrDir]
      return joinCommandArgs(args)
    }
    case 'extract': {
      requireArgs(['archive'], { file: fileOrDir, archive }, 'tar')
      args = [...args, '-xzf', archive]
      return joinCommandArgs(args)
    }
    default:
      throw new Error(
        `mode "${mode}" is not valid in "tar" command (valid values: ["extract", "compress"])`,
      )
  }
}
