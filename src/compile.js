const dummy = require('../samples/dummy.json')
const webpack = require('webpack')
const configuration = require('./webpack.config')
const memfs = require('memfs')
const { v4: uuid } = require('uuid')

module.exports = async () => {
  const fileID = uuid() + '.js'
  const volume = new memfs.Volume()
  const fs = memfs.createFsFromVolume(volume)
  await fs.promises.mkdir('/src')
  await fs.promises.writeFile(`/src/${fileID}`, dummy.code)
  const compiler = webpack(configuration(fileID))
  compiler.inputFileSystem = fs
  compiler.outputFileSystem = fs
  await new Promise((res, rej) => {
    compiler.run((err, stats) => {
      err ? rej(err) : res(stats)
    })
  })
  const compiled = await fs.promises.readFile(`/dist/${fileID}`, 'utf-8')
  return compiled
}
