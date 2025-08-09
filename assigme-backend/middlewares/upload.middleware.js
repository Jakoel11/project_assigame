// middlewares/upload.middleware.js
const multer = require('multer');
const imageService = require('../services/image.service');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5 // Max 5 fichiers
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Seules les images sont autorisées'), false);
    }
    cb(null, true);
  }
});

const processImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next();
    }

    const processedImages = [];
    for (const file of req.files) {
      try {
        await imageService.validateImage(file);
        const variants = await imageService.processImage(file);
        processedImages.push(variants);
      } catch (error) {
        console.error(`Erreur traitement image: ${error.message}`);
        return res.status(400).json({ 
          message: '❌ Erreur traitement image', 
          error: error.message 
        });
      }
    }

    req.processedImages = processedImages;
    next();
  } catch (error) {
    console.error('Erreur middleware upload:', error);
    res.status(500).json({ message: '❌ Erreur serveur' });
  }
};

module.exports = {
  upload: upload.array('images', 5),
  processImages
};
