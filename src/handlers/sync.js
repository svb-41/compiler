const AWS = require('aws-sdk')

const db = AWS.DynamoDB()

module.exports.sync = async (event, context) => {
  return { statusCode: 200 }
}
