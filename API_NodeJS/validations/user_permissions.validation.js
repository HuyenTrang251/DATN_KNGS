const Joi = require('joi');

const schema = Joi.object({
});

module.exports = { validate: (data) => schema.validate(data) };