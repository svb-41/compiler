'use strict'
const AWS = require('aws-sdk')
const S3 = new AWS.S3()
const Bucket = 'svb-41-dev'

const putObject = ({ path, content }) =>
  S3.putObject({ Bucket, Key: path, Body: content })

const compile = (code) => code

module.exports.compile = async (event) => {
  const { code, user, name } = JSON.parse(event.body)

  const compiled = compile(code)
  await new Promise.all([
    putObject({ path: `${user}/${name}-compiled`, content: compiled }),
    putObject({ path: `${user}/${name}`, content: code }),
  ])

  return {
    statusCode: 200,
    body: JSON.stringify(compiled),
  }
}
