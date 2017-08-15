/* eslint-disable no-underscore-dangle */
import EventEmitter from 'events'
import { Readable } from 'stream'

export const exec = jest.fn((command, options, cb) => {
  const child = new EventEmitter()
  child.stderr = new Readable()
  child.stderr._read = jest.fn()
  child.stdout = new Readable()
  child.stdout._read = jest.fn()

  process.nextTick(() => {
    cb(null, Buffer.from('stdout'), Buffer.from('stderr'))
  })

  return child
})
