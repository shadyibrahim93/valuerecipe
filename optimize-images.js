const sharp = require('sharp');
const glob = require('glob');
const fs = require('fs');
const path = require('path');

(async () => {
  // 1. Find all JPG/PNG files
  const files = glob.sync('public/images/**/*.{jpg,jpeg,png,JPG,JPEG,PNG}');

  console.log(
    `Found ${files.length} original images. Checking for duplicates...`
  );

  for (const file of files) {
    const ext = path.extname(file);
    const output = file.replace(ext, '.webp');

    try {
      // SCENARIO A: The WebP version ALREADY exists (from your previous run)
      if (fs.existsSync(output)) {
        console.log(
          `🗑️  Cleanup: WebP exists for ${path.basename(
            file
          )}. Deleting original...`
        );
        try {
          fs.unlinkSync(file); // <--- THIS DELETES THE OLD FILE
        } catch (e) {
          console.error(`   Could not delete: ${file}`);
        }
        continue;
      }

      // SCENARIO B: The WebP does NOT exist yet (New file)
      // Check for empty/corrupt files first
      const stats = fs.statSync(file);
      if (stats.size === 0) {
        console.log(`⚠️ Skipping empty file: ${file}`);
        continue;
      }

      console.log(`⚙️  Optimizing: ${file} -> ${output}`);

      // Convert to WebP
      await sharp(file)
        .resize({ width: 1920, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(output);

      // Delete the original after successful conversion
      fs.unlinkSync(file);
      console.log(`✅ Converted & Deleted Original: ${path.basename(file)}`);
    } catch (err) {
      console.error(`❌ FAILED on file: ${file}`);
      console.error(`   Error: ${err.message}`);
    }
  }

  console.log('🎉 Cleanup & Optimization Complete!');
})();
