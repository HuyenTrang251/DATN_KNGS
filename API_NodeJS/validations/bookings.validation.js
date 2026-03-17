const Joi = require('joi');

const schema = Joi.object({
  student_id: Joi.number().integer().allow(null),
  tutor_id: Joi.number().integer().allow(null),
  tutor_subject_level_id: Joi.number().integer().allow(null),
  hours_per_session: Joi.string().allow(null),
  sessions_per_week: Joi.number().integer().allow(null),
  teaching_mode: Joi.string().allow(null),
  status: Joi.string().allow(null),
  cancel_reason: Joi.string().allow(null),
  approved_by: Joi.number().integer().allow(null),
  approved_at: Joi.string().allow(null),
  connected_at: Joi.string().allow(null),
});

module.exports = { validate: (data) => schema.validate(data) };