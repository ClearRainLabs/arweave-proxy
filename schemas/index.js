const Joi = require('joi')

const tagsSchema = Joi.object({
  'App-Name': Joi.string().required(),
  'App-Version': Joi.string().required(),
  Did: Joi.string().required()
})

const comData = Joi.object({
  name: Joi.string().required(),
  isOpen: Joi.boolean().required(),
  from: Joi.string().required()
})

const createComData = Joi.object({
  op: Joi.string().required(),
  community: comData
})

const createComSchema = Joi.object().keys({
  tags: tagsSchema,
  data: createComData
})

module.exports = {
  createComSchema
}
