const { DynamoDB } = require('./dynamo/client')

const preferences = { TableName: 'preferences' }
const ais = { TableName: 'ais' }
const fleetConfigs = { TableName: 'fleetConfigs' }
const stats = { TableName: 'stats' }
const skirmishes = { TableName: 'skirmishes' }

module.exports.client = DynamoDB

module.exports.preferences = {
  put(username, data) {
    const Item = { username, ...data }
    return DynamoDB.put({ ...preferences, Item }).promise()
  },
  async get(username) {
    const Key = { username }
    const result = await DynamoDB.get({ ...preferences, Key }).promise()
    if (!result.Item) return null
    const { username: u, ...rest } = result.Item
    return rest
  },
}

module.exports.stats = {
  put(username, data) {
    const Item = { username, ...data }
    return DynamoDB.put({ ...stats, Item }).promise()
  },
  async leaders() {
    // const params = {...stats}
    // const result = await DynamoDB.scan(params).promise()
  },
  async get(username) {
    const Key = { username }
    const result = await DynamoDB.get({ ...stats, Key }).promise()
    if (!result.Item) return null
    const { username: u, ...rest } = result.Item
    return rest
  },
}

module.exports.skirmishes = {
  put(username, data) {
    const Item = { username, ...data }
    return DynamoDB.put({ ...skirmishes, Item }).promise()
  },
  async get(username) {
    const Key = { username }
    const result = await DynamoDB.get({ ...skirmishes, Key }).promise()
    if (!result.Item) return null
    const { username: u, ...rest } = result.Item
    return rest
  },
}

module.exports.ais = {
  put(id, data) {
    const Item = { id, ...data }
    return DynamoDB.put({ ...ais, Item }).promise()
  },
  async get(id) {
    const Key = { id }
    const result = await DynamoDB.get({ ...ais, Key }).promise()
    if (!result.Item) return null
    const { id: i, ...rest } = result.Item
    return rest
  },
}

module.exports.fleetConfigs = {
  put(id, value) {
    const Item = { id, value }
    return DynamoDB.put({ ...fleetConfigs, Item }).promise()
  },
  async get(id) {
    const Key = { id }
    const result = await DynamoDB.get({ ...fleetConfigs, Key }).promise()
    if (!result.Item) return null
    const { value } = result.Item
    return value
  },
}
