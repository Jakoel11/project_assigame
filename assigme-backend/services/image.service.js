// services/image.service.js
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');
const path = require('path');
const fs = require('fs').promises;

// Configuration AWS S3 (à déplacer dans .env)
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

class ImageService {
  constructor() {
    this.uploadDir = 'uploads';
    this.sizes = {
      thumbnail: { width: 150, height: 150 },
      medium: { width: 800, height: 600 },
      large: { width: 1920, height: 1080 }
    };
  }

  async init() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir);
    }
  }

  async processImage(file) {
    const filename = `${uuidv4()}${path.extname(file.originalname)}`;
    const variants = {};

    // Créer les différentes tailles
    for (const [size, dimensions] of Object.entries(this.sizes)) {
      const processedFilename = `${size}_${filename}`;
      const outputPath = path.join(this.uploadDir, processedFilename);

      await sharp(file.buffer)
        .resize(dimensions.width, dimensions.height, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 80 })
        .toFile(outputPath);

      // Upload vers S3
      if (process.env.NODE_ENV === 'production') {
        const s3Response = await this.uploadToS3(outputPath, processedFilename);
        variants[size] = s3Response.Location;
        await fs.unlink(outputPath); // Nettoyer après upload
      } else {
        variants[size] = `/uploads/${processedFilename}`;
      }
    }

    return variants;
  }

  async uploadToS3(filePath, filename) {
    const fileContent = await fs.readFile(filePath);
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `images/${filename}`,
      Body: fileContent,
      ContentType: 'image/jpeg',
      ACL: 'public-read'
    };

    return s3.upload(params).promise();
  }

  async deleteImage(imageUrl) {
    if (process.env.NODE_ENV === 'production') {
      const key = imageUrl.split('/').pop();
      await s3.deleteObject({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: `images/${key}`
      }).promise();
    } else {
      const localPath = path.join(process.cwd(), 'uploads', imageUrl.split('/').pop());
      await fs.unlink(localPath);
    }
  }

  async validateImage(file) {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.mimetype)) {
      throw new Error('Type de fichier non supporté');
    }

    if (file.size > maxSize) {
      throw new Error('Image trop volumineuse (max 5MB)');
    }

    // Vérification dimensions avec sharp
    const metadata = await sharp(file.buffer).metadata();
    if (metadata.width < 200 || metadata.height < 200) {
      throw new Error('Dimensions minimales: 200x200px');
    }
  }
}

module.exports = new ImageService();
