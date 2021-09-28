const webpack = require('webpack')
const configuration = require('./webpack.config')
const memfs = require('memfs')
const fs = require('fs').promises
const path = require('path')

const copyStarshipsCore = async ({ mfs }) => {
  const corePath = path.resolve(__dirname, 'starships-core.ts')
  const core = await fs.readFile(corePath, 'utf-8')
  await mfs.promises.writeFile(`/src/starships-core.ts`, core)
}

module.exports = async ({ code, ...params }) => {
  const name = [params.uid, params.name].join('-')
  const volume = new memfs.Volume()
  const mfs = memfs.createFsFromVolume(volume)
  await mfs.promises.mkdir('/src')
  await mfs.promises.writeFile(`/src/${name}`, code)
  await copyStarshipsCore({ mfs })
  const compiler = webpack(configuration(name))
  compiler.inputFileSystem = mfs
  compiler.outputFileSystem = mfs
  await new Promise((res, rej) => {
    compiler.run((err, stats) => {
      console.log(stats.toJson().errors)
      err ? rej(err) : res(stats)
    })
  })
  return mfs.promises.readFile(`/dist/${name}`, 'utf-8')
}
