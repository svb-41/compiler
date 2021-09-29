const webpack = require('webpack')
const configuration = require('../webpack.config')
const memfs = require('memfs')
const { ufs } = require('unionfs')
// const ufs_ = require('unionfs')
const fs = require('fs')
const path = require('path')

const copyStarshipsCore = async ({ mfs }) => {
  const corePath = path.resolve(__dirname, 'starships-core.ts')
  const core = await fs.promises.readFile(corePath, 'utf-8')
  await mfs.promises.writeFile(`/src/starships-core.ts`, core)
}

module.exports = async ({ code, ...params }, context = {}) => {
  const execId = context.awsRequestId || 'defaultId'
  console.log('awsRequestId', execId)
  // const ufs = new ufs_.Union()
  const name = `${execId}/${[params.uid, params.name].join('-')}`
  const volume = new memfs.Volume()
  const mfs = memfs.createFsFromVolume(volume)
  ufs.use(fs).use(mfs)
  await mfs.promises.mkdir('/src')
  await mfs.promises.mkdir(`/src/${execId}`)
  await mfs.promises.writeFile(`/src/${name}`, code)
  await copyStarshipsCore({ mfs })
  const compiler = webpack(configuration(name))
  compiler.inputFileSystem = ufs
  compiler.outputFileSystem = ufs
  await new Promise((res, rej) => {
    compiler.run((err, stats) => {
      console.log(err)
      console.log(stats.toJson().errors)
      err ? rej(err) : res(stats)
    })
  })
  return mfs.promises.readFile(`/dist/${name}`, 'utf-8')
}
