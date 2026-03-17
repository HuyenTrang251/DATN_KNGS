const Joi = require('joi');

const schema = Joi.object({
  class_session_id: Joi.number().integer().allow(null),
  reviewer_id: Joi.number().integer().allow(null),
  reviewed_user_id: Joi.number().integer().allow(null),
  rating: Joi.number().integer().allow(null),
  comment: Joi.string().allow(null),
});

module.exports = { validate: (data) => schema.validate(data) };