const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputDir = path.join(__dirname, '../public/images');
const outputDir = path.join(__dirname, '../public/images/optimized');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function optimizeImage(inputFile, outputFile, width, quality = 85) {
  try {
    await sharp(inputFile)
      .resize(width, null, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality })
      .toFile(outputFile);
    
    console.log(`✅ ${path.basename(inputFile)} → ${path.basename(outputFile)}`);
  } catch (error) {
    console.error(`❌ Error:`, error);
  }
}

async function main() {
  const slides = ['hero-slide-1.jpeg', 'hero-slide-2.jpeg'];

  console.log('📱 Creating desktop versions (1920px)...');
  for (const img of slides) {
    await optimizeImage(
      path.join(inputDir, img),
      path.join(outputDir, img.replace('.jpeg', '-desktop.webp')),
      1920, 85
    );
  }

  console.log('\n📱 Creating mobile versions (750px)...');
  for (const img of slides) {
    await optimizeImage(
      path.join(inputDir, img),
      path.join(outputDir, img.replace('.jpeg', '-mobile.webp')),
      750, 80
    );
  }

  console.log('\n✨ Done!');
}

main().catch(console.error);
