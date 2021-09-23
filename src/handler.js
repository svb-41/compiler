'use strict'
const AWS = require('aws-sdk')
const S3 = new AWS.S3()
const Bucket = ''

const putObject = ({ path, content }) =>
  S3.putObject({ Bucket, Key: path, Body: content })

const compile = (code) => code

module.exports.compile = async (event) => {
  const { code, user } = JSON.parse(event.body)
  return {
    statusCode: 200,
    body: JSON.stringify({
      code,
      user,
    }),
  }
}
