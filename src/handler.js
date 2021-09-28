const AWS = require('aws-sdk')
const compile = require('./compile')
const S3 = new AWS.S3()
const Bucket = 'svb-41-dev'

const putObject = ({ path, content }) =>
  new Promise((res, rej) =>
    S3.putObject({ Bucket, Key: path, Body: content }, (err, data) =>
      err ? rej(err) : res(data)
    )
  )

module.exports.compile = async event => {
  const { code, uid, name } = JSON.parse(event.body)
  try {
    const compiled = await compile(code, uid, name)
    console.log(
      await Promise.all([
        putObject({ path: `${uid}/${name}-compiled`, content: compiled }),
        putObject({ path: `${uid}/${name}`, content: code }),
      ])
    )
    return {
      statusCode: 200,
      body: compiled,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: err.message,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    }
  }
}
