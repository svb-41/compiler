const joi = require('joi')

const schema = joi.object({
  fleets: joi
    .object({
      small: joi.string().allow(null).required(),
      huge: joi.string().allow(null).required(),
    })
    .required(),
})

module.exports.validate = data => {
  const result = schema.validate(data)
  if (result.error) return { isValid: false, error: result.error }
  return { isValid: true }
}
