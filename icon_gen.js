const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ASSET_PATH = path.join(__dirname, 'zipplyRider/assets/app-icon.png');
const BACKGROUND_COLOR = '#F5EDDF'; // beige

const SIZES = {
  mdpi: 48,
  hdpi: 72,
  xhdpi: 96,
  xxhdpi: 144,
  xxxhdpi: 192
};

const APPS = ['zipplyRider', 'zippyTrainer', 'zippyVat'];

async function generateIcons() {
  if (!fs.existsSync(ASSET_PATH)) {
    console.error('Asset not found:', ASSET_PATH);
    return;
  }

  // Generate adaptive foreground (108x108 base, but we will scale to matching adaptive sizes)
  // Actually, for adaptive icons, Android expects a 108dp x 108dp image (432px x 432px on xxxhdpi)
  // Let's create proper Adaptive Icons (xml) and legacy icons.

  const ADAPTIVE_SIZES = {
    mdpi: 108,
    hdpi: 162,
    xhdpi: 216,
    xxhdpi: 324,
    xxxhdpi: 432
  };

  for (const app of APPS) {
    console.log(`Processing ${app}...`);
    const resDir = path.join(__dirname, app, 'android/app/src/main/res');
    
    if (!fs.existsSync(resDir)) {
      console.log(`Skipping ${app}, res dir not found`);
      continue;
    }

    // 1. Generate Legacy Icons (full square/circle)
    for (const [density, size] of Object.entries(SIZES)) {
      const mipmapDir = path.join(resDir, `mipmap-${density}`);
      if (!fs.existsSync(mipmapDir)) fs.mkdirSync(mipmapDir, { recursive: true });

      // Generate round icon
      const circleSvg = `<svg width="${size}" height="${size}"><circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="${BACKGROUND_COLOR}"/></svg>`;
      
      await sharp(ASSET_PATH)
        .resize(size, size, { fit: 'cover' })
        .composite([{ input: Buffer.from(circleSvg), blend: 'dest-in' }])
        .toFile(path.join(mipmapDir, 'ic_launcher_round.png'));

      // Generate square icon
      await sharp(ASSET_PATH)
        .resize(size, size, { fit: 'cover' })
        .toFile(path.join(mipmapDir, 'ic_launcher.png'));
        
      // Generate adaptive foreground
      const adaptiveSize = ADAPTIVE_SIZES[density];
      // Adaptive foreground needs to be smaller inside the 108dp canvas, let's say 70%
      const innerSize = Math.floor(adaptiveSize * 1.0); // The user wants FULL SPACE!
      
      const fgBuffer = await sharp(ASSET_PATH)
        .resize(innerSize, innerSize, { fit: 'contain', background: { r: 245, g: 237, b: 223, alpha: 1 } }) // F5EDDF
        .extend({
          top: Math.floor((adaptiveSize - innerSize) / 2),
          bottom: Math.ceil((adaptiveSize - innerSize) / 2),
          left: Math.floor((adaptiveSize - innerSize) / 2),
          right: Math.ceil((adaptiveSize - innerSize) / 2),
          background: { r: 245, g: 237, b: 223, alpha: 1 }
        })
        .toBuffer();
        
      await sharp(fgBuffer).toFile(path.join(mipmapDir, 'ic_launcher_foreground.png'));
    }

    // 2. Create Adaptive Icon XML
    const anyDpiDir = path.join(resDir, 'mipmap-anydpi-v26');
    if (!fs.existsSync(anyDpiDir)) fs.mkdirSync(anyDpiDir, { recursive: true });

    const xmlContent = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>`;

    fs.writeFileSync(path.join(anyDpiDir, 'ic_launcher.xml'), xmlContent);
    fs.writeFileSync(path.join(anyDpiDir, 'ic_launcher_round.xml'), xmlContent);

    // 3. Create colors.xml for background
    const valuesDir = path.join(resDir, 'values');
    if (!fs.existsSync(valuesDir)) fs.mkdirSync(valuesDir, { recursive: true });
    
    const colorsPath = path.join(valuesDir, 'colors.xml');
    let colorsContent = `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">${BACKGROUND_COLOR}</color>\n</resources>`;
    
    if (fs.existsSync(colorsPath)) {
        let existing = fs.readFileSync(colorsPath, 'utf8');
        if (!existing.includes('ic_launcher_background')) {
            existing = existing.replace('</resources>', `    <color name="ic_launcher_background">${BACKGROUND_COLOR}</color>\n</resources>`);
            fs.writeFileSync(colorsPath, existing);
        } else {
            // Update existing color
            existing = existing.replace(/<color name="ic_launcher_background">.*?<\/color>/, `<color name="ic_launcher_background">${BACKGROUND_COLOR}</color>`);
            fs.writeFileSync(colorsPath, existing);
        }
    } else {
        fs.writeFileSync(colorsPath, colorsContent);
    }
  }

  console.log('Done generating icons!');
}

generateIcons().catch(console.error);
