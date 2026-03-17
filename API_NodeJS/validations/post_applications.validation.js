const Joi = require('joi');

const schema = Joi.object({
  post_id: Joi.number().integer().allow(null),
  tutor_id: Joi.number().integer().allow(null),
  status: Joi.string().allow(null),
});

module.exports = { validate: (data) => schema.validate(data) };