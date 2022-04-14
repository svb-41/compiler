const joi = require('joi')

const schema = joi.object({
  createdAt: joi.string().required(),
  updatedAt: joi.string().required(),
  description: joi.string().optional(),
  tags: joi.array().items(joi.string()).required(),
  language: joi.string().required(),
  path: joi.string().required(),
})

module.exports.validate = data => {
  const result = schema.validate(data)
  if (result.error) return { isValid: false, error: result.error }
  return { isValid: true }
}
