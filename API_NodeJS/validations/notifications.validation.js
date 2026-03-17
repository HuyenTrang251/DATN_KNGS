const Joi = require('joi');

const schema = Joi.object({
  user_id: Joi.number().integer().allow(null),
  title: Joi.string().allow(null),
  content: Joi.string().allow(null),
  is_read: Joi.number().integer().allow(null),
});

module.exports = { validate: (data) => schema.validate(data) };