const joi = require('joi')

const schema = joi.object({
  victories: joi.number().required(),
  defeats: joi.number().required(),
})

module.exports.validate = data => {
  const result = schema.validate(data)
  if (result.error) return { isValid: false, error: result.error }
  return { isValid: true }
}
