/* eslint-disable no-console, import/no-extraneous-dependencies, no-empty */

/**
 * Watch files for changes and rebuild.
 */

import fs from 'fs'
import { execSync } from 'child_process'
import path from 'path'
import chalk from 'chalk'

const PACKAGES_DIR = path.resolve(__dirname, '../packages')

function getPackages() {
  return fs
    .readdirSync(PACKAGES_DIR)
    .map(file => path.resolve(PACKAGES_DIR, file))
    .filter(f => fs.lstatSync(path.resolve(f)).isDirectory())
}

const BUILD_CMD = `babel-node ${path.resolve(__dirname, './build.js')}`

let filesToBuild = new Map()

const exists = filename => {
  try {
    return fs.statSync(filename).isFile()
  } catch (e) {
    return false
  }
}
const rebuild = filename => filesToBuild.set(filename, true)

getPackages().forEach(p => {
  const srcDir = path.resolve(p, 'src')
  try {
    fs.accessSync(srcDir, fs.F_OK)
    fs.watch(path.resolve(p, 'src'), { recursive: true }, (event, filename) => {
      const filePath = path.resolve(srcDir, filename)

      if ((event === 'change' || event === 'rename') && exists(filePath)) {
        console.log(chalk.green('->'), `${event}: ${filename}`)
        rebuild(filePath)
      } else {
        const buildFile = path.resolve(srcDir, '..', 'build', filename)
        try {
          fs.unlinkSync(buildFile)
          process.stdout.write(
            `${chalk.red('  \u2022 ')}${path.relative(
              path.resolve(srcDir, '..', '..'),
              buildFile,
            )} (deleted)\n`,
          )
        } catch (e) {}
      }
    })
  } catch (e) {
    // doesn't exist
  }
})

setInterval(() => {
  const files = Array.from(filesToBuild.keys())
  if (files.length) {
    filesToBuild = new Map()
    try {
      execSync(`${BUILD_CMD} ${files.join(' ')}`, { stdio: [0, 1, 2] })
    } catch (e) {}
  }
}, 100)

console.log(chalk.red('->'), chalk.cyan('Watching for changes...'))
