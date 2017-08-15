/* eslint-disable no-underscore-dangle */
let paths

export const __setPaths__ = _paths => {
  paths = _paths
}

export default (name, cb) => {
  if (typeof paths[name] !== 'undefined') cb(null, paths[name])
  else cb(new Error(`Could not find ${name} on your system`))
}
