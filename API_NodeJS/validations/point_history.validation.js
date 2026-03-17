const Joi = require('joi');

const schema = Joi.object({
  tutor_id: Joi.number().integer().allow(null),
  amount: Joi.number().integer().allow(null),
  reason: Joi.string().allow(null),
});

module.exports = { validate: (data) => schema.validate(data) };