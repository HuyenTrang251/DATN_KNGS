const Joi = require('joi');

const schema = Joi.object({
  tutor_id: Joi.number().integer().allow(null),
  discount_percent: Joi.number().integer().allow(null),
  max_uses: Joi.number().integer().allow(null),
  remaining_uses: Joi.number().integer().allow(null),
  expiry_date: Joi.string().allow(null),
});

module.exports = { validate: (data) => schema.validate(data) };