// validators/annonce.validator.js
const Joi = require('joi');

exports.createAnnonceSchema = Joi.object({
  titre: Joi.string().max(200).required(),
  description: Joi.string().allow('', null),
  prix: Joi.number().positive().required(),
  categorie_id: Joi.number().integer().required(),
  sous_categorie_id: Joi.number().integer().allow(null),
  ville: Joi.string().max(100).required(),
  images: Joi.string().uri().allow('', null),
  is_boosted: Joi.boolean().optional()
});
