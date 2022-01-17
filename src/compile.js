const webpack = require('webpack')
const configuration = require('../webpack.config')
const memfs = require('memfs')
const unionfs = require('unionfs')
const fs = require('fs')
const path = require('path')

const copyStarshipsCore = async ({ mfs }) => {
  const corePath = path.resolve(__dirname, 'starships-core.ts')
  const core = await fs.promises.readFile(corePath, 'utf-8')
  await mfs.promises.writeFile(`/src/starships-core.ts`, core)
}

const initUFS = mfs => {
  const ufs = new unionfs.Union()
  ufs.use(mfs).use(fs)
  return ufs
}

const initMFS = async ({ execId, name, code }) => {
  const volume = new memfs.Volume()
  const mfs = memfs.createFsFromVolume(volume)
  await mfs.promises.mkdir('/src')
  await mfs.promises.mkdir(`/src/${execId}`)
  await mfs.promises.writeFile(`/src/${name}`, code)
  await copyStarshipsCore({ mfs })
  return mfs
}

const runCompiler = compiler => {
  return new Promise((res, rej) => {
    compiler.run((err, stats) => {
      if (err) {
        console.log(err)
        console.log(stats.toJson().errors)
        rej(err)
      } else {
        res(stats)
      }
    })
  })
}

module.exports = async ({ code, ...params }, context = {}) => {
  const execId = context.awsRequestId || 'defaultId'
  const name = `${execId}/${[params.uid, params.name].join('-')}`
  const mfs = await initMFS({ execId, name, code })
  const ufs = initUFS(mfs)
  const compiler = webpack(configuration(name))
  compiler.inputFileSystem = ufs
  compiler.outputFileSystem = ufs
  const stats = await runCompiler(compiler)
  const errors = stats.compilation.errors
  if (errors.length > 0) {
    const allErrors = errors.map(e => {
      const { context, file, code, ...value } = JSON.parse(e.message)
      return value
    })
    const content = JSON.stringify(allErrors)
    throw new Error(content)
  }
  const outPath = `/dist/${name.replace(/\.ts$/g, '.js')}`
  return ufs.promises.readFile(outPath, 'utf-8')
}
