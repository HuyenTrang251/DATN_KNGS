const Joi = require('joi');

const schema = Joi.object({
  user_id: Joi.number().integer().allow(null),
  experience: Joi.string().allow(null),
  education: Joi.string().allow(null),
  certificates: Joi.string().allow(null),
  cv_url: Joi.string().allow(null),
  intro_video_url: Joi.string().allow(null),
  teaching_mode: Joi.string().allow(null),
  accumulated_points: Joi.number().integer().allow(null),
  approval_status: Joi.string().allow(null),
  approved_by: Joi.number().integer().allow(null),
  approved_at: Joi.string().allow(null),
  rejected_reason: Joi.string().allow(null),
  is_verified: Joi.number().integer().allow(null),
  verified_at: Joi.string().allow(null),
});

module.exports = { validate: (data) => schema.validate(data) };