const joi = require('joi')

const schema = joi.object({
  createdAt: joi.string().required(),
  type: joi.string().required(),
  category: joi.string().required(),
  used: joi.boolean().required(),
  image: joi.string(),
  owner: joi.string(),
  ownStats: joi.string(), //stringify JSON in dynamo
  version: joi.string(), //semver probably
})

module.exports.validate = data => {
  const result = schema.validate(data)
  if (result.error) return { isValid: false, error: result.error }
  return { isValid: true }
}
