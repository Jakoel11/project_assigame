// middlewares/validate.js
const Joi = require('joi');

module.exports = (schema) => (req, res, next) => {
  console.log(`➡️  ${req.method} ${req.originalUrl}`);
  console.log('💡 Request body:', req.body);
  console.log('💡 Schema:', schema.describe());
  
  const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    // On renvoie toutes les erreurs de validation
    const messages = error.details.map(d => d.message);
    console.log('❌ Validation errors:', messages);
    return res.status(400).json({ message: 'Validation failed', details: messages });
  }
  console.log('✅ Validation passed');
  next();
};
