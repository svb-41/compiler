const AWS = require('aws-sdk')

const db = AWS.DynamoDB()

module.exports.profile = async (event, context) => {
  return { statusCode: 200 }
}
