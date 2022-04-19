const AWS = require('../services/aws')
const models = require('../models')

module.exports.fetch = async username => {
  const preferences = await AWS.DynamoDB.preferences.get(username)
  if (!preferences) return null
  const ais_ = await Promise.all(
    preferences.ais.map(async ai => {
      const data = await AWS.DynamoDB.ais.get(ai)
      if (!data) return [null, null]
      return [ai, data]
    })
  )
  const cnf = await Promise.all(
    preferences.fleetConfigs.map(async id => {
      const data = await AWS.DynamoDB.fleetConfigs.get(id)
      if (!data) return [null, null]
      return [id, data]
    })
  )
  const fleetSkirmishes = (await AWS.DynamoDB.skirmishes.get(username)) ?? {
    fleets: {
      small: null,
      huge: null,
    },
  }
  const toObj = (acc, [id, value]) => (value ? { ...acc, [id]: value } : acc)
  const ais = ais_.reduce(toObj, {})
  const fleetConfigs = cnf.reduce(toObj, {})
  return {
    preferences,
    ais,
    fleetConfigs,
    fleetSkirmishes: fleetSkirmishes.fleets,
  }
}

module.exports.persist = async (username, body) => {
  const a = Object.entries(body.ais)
  const c = Object.entries(body.fleetConfigs)
  const prefs = AWS.DynamoDB.preferences.put(username, body.preferences)
  const ais = a.map(([id, dat]) => AWS.DynamoDB.ais.put(id, dat))
  const confs = c.map(([id, dat]) => AWS.DynamoDB.fleetConfigs.put(id, dat))
  await Promise.all([prefs, Promise.all(ais), Promise.all(confs)])
}

module.exports.validate = body => {
  const { preferences, ais, fleetConfigs } = body
  const prefs = models.preferences.validate(preferences)
  if (!prefs.isValid) return prefs.error
  for (const ai in ais) {
    const ai_ = ais[ai]
    const dat = models.ais.validate(ai_)
    if (!dat.isValid) return dat.error
  }
  for (const config in fleetConfigs) {
    const config_ = fleetConfigs[config]
    const dat = models.fleetConfigs.validate(config_)
    if (!dat.isValid) return dat.error
  }
}
