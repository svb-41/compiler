const joi = require('joi')

const schema = joi.object({
  items: joi.array().items(joi.string()).required(),
  favorites: joi.array().items(joi.string()).required(),
})

module.exports.validate = data => {
  const result = schema.validate(data)
  if (result.error) return { isValid: false, error: result.error }
  return { isValid: true }
}
