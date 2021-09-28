const AWS = require('aws-sdk')
const compile = require('./compile')
const S3 = new AWS.S3()
const Bucket = 'svb-41-dev'

const putObject = ({ path, content }) =>
  S3.putObject({ Bucket, Key: path, Body: content })

module.exports.compile = async event => {
  const { code, uid, name } = JSON.parse(event.body)
  const compiled = await compile(code, uid, name)
  console.log(
    await Promise.all([
      putObject({ path: `${uid}/${name}-compiled`, content: compiled }),
      putObject({ path: `${uid}/${name}`, content: code }),
    ])
  )
  const body = JSON.stringify(compiled)
  return {
    statusCode: 200,
    body,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  }
}
