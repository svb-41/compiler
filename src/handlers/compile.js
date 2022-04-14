const util = require('util')
const path = require('path')
const fs = require('fs')
const compile = require('../lib/compile')
const AWS = require('../services/aws')

const log = (...args) => {
  if (!process.env.JEST_WORKER_ID) {
    console.log(...args)
  }
}

const headers = { 'Access-Control-Allow-Origin': '*' }
module.exports.compile = async (event, context) => {
  const { code, uid, id, name } = JSON.parse(event.body)
  log(`Compiling { uid: ${uid}, name: ${name} }`)
  try {
    const content = await compile({ code, uid, name }, context)
    const path = `${uid}/${id}-${name}`
    const compiledFile = AWS.S3.put({ path: `${path}-compiled.js`, content })
    const rawFile = AWS.S3.put({ path: `${path}.ts`, content: code })
    const results = await Promise.all([compiledFile, rawFile])
    if (process.env.NODE_ENV !== 'development') console.log(results)
    log(`Compiled { uid: ${uid}, name: ${name} }`)
    return { statusCode: 200, body: content, headers }
  } catch (error) {
    console.error(`Error, ${error}`)
    return { statusCode: 500, body: error.message, headers }
  }
}
