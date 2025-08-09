// validators/auth.validator.js
const Joi = require('joi');

exports.registerSchema = Joi.object({
  full_name: Joi.string().min(3).max(100).required(),
  phone: Joi.string().pattern(/^[0-9+() -]{6,20}$/).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

exports.loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});
