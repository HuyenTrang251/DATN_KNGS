const Joi = require('joi');

const schema = Joi.object({
  name: Joi.string().allow(null),
});

module.exports = { validate: (data) => schema.validate(data) };