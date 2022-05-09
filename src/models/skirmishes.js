const joi = require('joi')

const schema = joi.object({
  fleets: joi
    .object()
    .pattern(joi.string(), joi.string().allow(null))
    .required(),
})

module.exports.validate = data => {
  const result = schema.validate(data)
  if (result.error) return { isValid: false, error: result.error }
  return { isValid: true }
}
