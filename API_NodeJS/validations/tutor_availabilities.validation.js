const Joi = require('joi');

const schema = Joi.object({
  tutor_id: Joi.number().integer().allow(null),
  day_of_week: Joi.string().allow(null),
  start_time: Joi.string().allow(null),
  end_time: Joi.string().allow(null),
});

module.exports = { validate: (data) => schema.validate(data) };