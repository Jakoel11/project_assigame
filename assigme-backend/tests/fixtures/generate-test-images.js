const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function createTestImage() {
  const width = 500;
  const height = 500;

  // Créer une image test avec un fond rouge
  const image = await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 255, g: 0, b: 0, alpha: 1 }
    }
  }).jpeg().toBuffer();

  // Sauvegarder l'image
  await fs.writeFile(path.join(__dirname, 'test-image.jpg'), image);
  await fs.writeFile(path.join(__dirname, 'test-image-2.jpg'), image);
}

createTestImage().catch(console.error);
