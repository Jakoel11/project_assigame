// routes/images.routes.js
const router = require('express').Router();
const imagesController = require('../controllers/images.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const uploadMiddleware = require('../middlewares/upload.middleware');

router.post('/:id/images',
  authMiddleware,
  uploadMiddleware.upload,
  uploadMiddleware.processImages,
  imagesController.uploadImages
);

router.delete('/:id/images/:imageId',
  authMiddleware,
  imagesController.deleteImage
);

router.put('/:id/images/order',
  authMiddleware,
  imagesController.updateOrder
);

module.exports = router;
