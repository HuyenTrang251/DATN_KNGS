const Joi = require('joi');

const schema = Joi.object({
  role_id: Joi.number().integer().allow(null),
  full_name: Joi.string().allow(null),
  email: Joi.string().allow(null),
  phone: Joi.string().allow(null),
  password: Joi.string().allow(null),
  avatar: Joi.string().allow(null),
  gender: Joi.string().allow(null),
  date_of_birth: Joi.string().allow(null),
  address: Joi.string().allow(null),
  violation_count: Joi.number().integer().allow(null),
  status: Joi.string().allow(null),
});

module.exports = { validate: (data) => schema.validate(data) };