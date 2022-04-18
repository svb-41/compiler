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
  log(`Compiling { uid: ${uid}, name: ${name}, id: ${id} }`)
  try {
    const content = await compile({ code, uid, name }, context)
    const path = `${uid}/${id}`
    const compiledFile = AWS.S3.put({ path: `${path}-compiled.js`, content })
    const rawFile = AWS.S3.put({ path: `${path}.ts`, content: code })
    const results = await Promise.all([compiledFile, rawFile])
    if (process.env.NODE_ENV !== 'development') console.log(results)
    log(`Compiled { uid: ${uid}, name: ${name}, id: ${id} }`)
    return { statusCode: 200, body: content, headers }
  } catch (error) {
    console.error(`Error, ${error}`)
    return { statusCode: 500, body: error.message, headers }
  }
}

module.exports.get = async (event, context) => {
  const { uid, id, decompiled } = event.queryStringParameters
  log(`Fetch { uid: ${uid}, id: ${id}, decompiled: ${decompiled} }`)
  try {
    if (decompiled) {
      //verify if token is coherent with uid
    }
    const path = `${uid}/${id}`
    const pathTS = `${path}.ts`
    const pathCompiled = `${path}-compiled.js`
    const [ts, compiled] = (
      await Promise.all([
        decompiled ? AWS.S3.get({ path: pathTS }) : Promise.resolve(null),
        AWS.S3.get({ path: pathCompiled }),
      ])
    ).map(f => f.toString('utf8'))
    if (process.env.NODE_ENV !== 'development') console.log(ts, compiled)
    log(`Fetched { uid: ${uid} }`)
    return {
      statusCode: 200,
      body: JSON.stringify({ ts, compiled, id }),
      headers,
    }
  } catch (error) {
    console.error(`Error, ${error}`)
    return { statusCode: 500, body: error.message, headers }
  }
}
