const joi = require('joi')

const schema = joi.object({
  hull: joi.string().required(),
  weapons: joi
    .array()
    .items(joi.object({ weapon: joi.string(), amo: joi.string() }))
    .required(),
  thruster: joi.string(),
  radar: joi.string(),
})

module.exports.validate = data => {
  const result = schema.validate(data)
  if (result.error) return { isValid: false, error: result.error }
  return { isValid: true }
}
