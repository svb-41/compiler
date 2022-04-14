const joi = require('joi')

const str = joi.string()
const strArray = joi.array().items(str).required()
const schema = joi.object({
  color: joi.string().required(),
  ais: strArray,
  fleetConfigs: strArray,
  favoritesAI: strArray,
  unlockedMissions: strArray,
  unlockedShips: strArray,
})

module.exports.validate = data => {
  const result = schema.validate(data)
  if (result.error) return { isValid: false, error: result.error }
  return { isValid: true }
}
