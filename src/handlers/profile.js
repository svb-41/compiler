const AWS = require('aws-sdk')

const db = new AWS.DynamoDB()

module.exports.profile = async (event, context) => {
  return { statusCode: 200 }
}
