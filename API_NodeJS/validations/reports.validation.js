const Joi = require('joi');

const schema = Joi.object({
  reporter_id: Joi.number().integer().allow(null),
  reported_user_id: Joi.number().integer().allow(null),
  reason: Joi.string().allow(null),
  status: Joi.string().allow(null),
});

module.exports = { validate: (data) => schema.validate(data) };