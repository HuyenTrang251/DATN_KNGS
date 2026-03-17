const Joi = require('joi');

const schema = Joi.object({
  permission_key: Joi.string().allow(null),
  description: Joi.string().allow(null),
});

module.exports = { validate: (data) => schema.validate(data) };