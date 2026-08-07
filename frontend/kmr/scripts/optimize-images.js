const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputDir = path.join(__dirname, '../public/images');
const outputDir = path.join(__dirname, '../public/images/optimized');

// Create output directory if it doesn't exist
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
    
    console.log(`✅ Optimized: ${path.basename(inputFile)} → ${path.basename(outputFile)}`);
  } catch (error) {
    console.error(`❌ Error optimizing ${inputFile}:`, error);
  }
}

async function main() {
  const images = [
    'hero-banner-1.jpeg',
    'hero-banner-2.jpeg'
  ];

  // Desktop versions (1920px wide)
  console.log('📱 Creating desktop versions (1920px wide)...');
  for (const img of images) {
    const inputPath = path.join(inputDir, img);
    const outputPath = path.join(outputDir, img.replace('.jpeg', '-desktop.webp'));
    await optimizeImage(inputPath, outputPath, 1920, 85);
  }

  // Mobile versions (750px wide)
  console.log('\n📱 Creating mobile versions (750px wide)...');
  for (const img of images) {
    const inputPath = path.join(inputDir, img);
    const outputPath = path.join(outputDir, img.replace('.jpeg', '-mobile.webp'));
    await optimizeImage(inputPath, outputPath, 750, 80);
  }

  // Tablet versions (1024px wide)
  console.log('\n📱 Creating tablet versions (1024px wide)...');
  for (const img of images) {
    const inputPath = path.join(inputDir, img);
    const outputPath = path.join(outputDir, img.replace('.jpeg', '-tablet.webp'));
    await optimizeImage(inputPath, outputPath, 1024, 82);
  }

  console.log('\n✨ Image optimization complete!');
}

main().catch(console.error);
