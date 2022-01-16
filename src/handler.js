const AWS = require('aws-sdk')
const util = require('util')
const path = require('path')
const fs = require('fs')
const compile = require('./compile')

const S3 = new AWS.S3()
const Bucket = 'svb-41-dev'

const headers = { 'Access-Control-Allow-Origin': '*' }
const putObject = ({ path, content }) => {
  if (process.env.NODE_ENV === 'development') {
    const base = path.resolve(__dirname, '../s3')
    const final = path.resolve(base, path)
    return fs.writeFile(final, content)
  } else {
    const put = util.promisify(S3.putObject)
    return put({ Bucket, key: path, Body: content })
  }
}

module.exports.compile = async (event, context) => {
  const { code, uid, name } = JSON.parse(event.body)
  try {
    const content = await compile({ code, uid, name }, context)
    const path = `${uid}/${name}`
    const compiledFile = putObject({ path: `${path}-compiled`, content })
    const rawFile = putObject({ path, content: code })
    const results = await Promise.all([compiledFile, rawFile])
    console.log(results)
    return { statusCode: 200, body: content, headers }
  } catch (err) {
    return { statusCode: 500, body: err.message, headers }
  }
}
