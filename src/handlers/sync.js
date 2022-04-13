const AWS = require('aws-sdk')

const db = new AWS.DynamoDB.DocumentClient()

module.exports.sync = async (event, context) => {
  const Key = { username: 'guillaume' }
  const Item = { ...Key, coucou: 'cestmoua' }
  await db.put({ TableName: 'preferences', Item }).promise()
  const res = await db.get({ TableName: 'preferences', Key }).promise()
  return { statusCode: 200, body: JSON.stringify(res.Item) }
}
