const Joi = require('joi');

const schema = Joi.object({
  user_id: Joi.number().integer().allow(null),
  action: Joi.string().allow(null),
  target_table: Joi.string().allow(null),
  target_id: Joi.number().integer().allow(null),
  old_data: Joi.string().allow(null),
  new_data: Joi.string().allow(null),
  ip_address: Joi.string().allow(null),
  level: Joi.string().allow(null),
});

module.exports = { validate: (data) => schema.validate(data) };