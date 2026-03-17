const Joi = require('joi');

const schema = Joi.object({
  tutor_id: Joi.number().integer().allow(null),
  post_id: Joi.number().integer().allow(null),
  booking_id: Joi.number().integer().allow(null),
  payment_type: Joi.string().allow(null),
  amount: Joi.string().allow(null),
  transaction_code: Joi.string().allow(null),
  status: Joi.string().allow(null),
  approved_by: Joi.number().integer().allow(null),
  approved_at: Joi.string().allow(null),
});

module.exports = { validate: (data) => schema.validate(data) };