const Joi = require('joi');

const schema = Joi.object({
  student_id: Joi.number().integer().allow(null),
  subject_id: Joi.number().integer().allow(null),
  grade: Joi.string().allow(null),
  student_quantity: Joi.number().integer().allow(null),
  hours_per_session: Joi.string().allow(null),
  sessions_per_week: Joi.number().integer().allow(null),
  tutor_type: Joi.string().allow(null),
  teaching_mode: Joi.string().allow(null),
  tuition_fee_per_session: Joi.string().allow(null),
  contact_phone: Joi.string().allow(null),
  preferred_gender: Joi.string().allow(null),
  address: Joi.string().allow(null),
  note: Joi.string().allow(null),
  status: Joi.string().allow(null),
  cancel_reason: Joi.string().allow(null),
  approved_by: Joi.number().integer().allow(null),
  approved_at: Joi.string().allow(null),
  connected_at: Joi.string().allow(null),
});

module.exports = { validate: (data) => schema.validate(data) };