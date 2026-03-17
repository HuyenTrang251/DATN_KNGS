const Joi = require('joi');

const schema = Joi.object({
  student_id: Joi.number().integer().allow(null),
  tutor_id: Joi.number().integer().allow(null),
  post_id: Joi.number().integer().allow(null),
  booking_id: Joi.number().integer().allow(null),
  status: Joi.string().allow(null),
  cancel_reason: Joi.string().allow(null),
});

module.exports = { validate: (data) => schema.validate(data) };