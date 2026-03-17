const Joi = require('joi');

const schema = Joi.object({
  user_id: Joi.number().integer().allow(null),
  grade: Joi.string().allow(null),
});

module.exports = { validate: (data) => schema.validate(data) };