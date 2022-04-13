const AWS = require('aws-sdk')
const util = require('util')
const path = require('path')
const fs = require('fs')
const compile = require('../lib/compile')

const S3 = new AWS.S3()
const Bucket = 'svb-41-dev'

const headers = { 'Access-Control-Allow-Origin': '*' }
const putObject = async ({ path: p, content }) => {
  if (process.env.NODE_ENV === 'development') {
    const base = path.resolve(__dirname, '../s3')
    const final = path.resolve(base, p)
    const [_, ...all] = final.split('/').reverse()
    const before = all.reverse().join('/')
    await fs.promises.mkdir(before, { recursive: true })
    return await fs.promises.writeFile(final, content)
  } else {
    return await new Promise((res, rej) => {
      const cb = (err, res_) => (err ? rej(err) : res(res_))
      S3.putObject({ Bucket, Key: p, Body: content }, cb)
    })
  }
}

const log = (...args) => {
  if (!process.env.JEST_WORKER_ID) {
    console.log(...args)
  }
}

module.exports.compile = async (event, context) => {
  const { code, uid, name } = JSON.parse(event.body)
  log(`Compiling { uid: ${uid}, name: ${name} }`)
  try {
    const content = await compile({ code, uid, name }, context)
    const path = `${uid}/${name}`
    const compiledFile = putObject({ path: `${path}-compiled`, content })
    const rawFile = putObject({ path, content: code })
    const results = await Promise.all([compiledFile, rawFile])
    if (process.env.NODE_ENV !== 'development') console.log(results)
    log(`Compiled { uid: ${uid}, name: ${name} }`)
    return { statusCode: 200, body: content, headers }
  } catch (error) {
    console.error(`Error, ${error}`)
    return { statusCode: 500, body: error.message, headers }
  }
}
