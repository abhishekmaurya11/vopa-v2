// const fs = require('fs');
// const path = require('path');
// const { exec } = require('child_process');

// // Input and output directories
// const inputDir = path.join(__dirname, 'images');     // e.g., 'images/' folder with images
// const outputDir = path.join(__dirname, 'cropped');

// // Create output directory if not exists
// if (!fs.existsSync(outputDir)) {
//   fs.mkdirSync(outputDir);
// }

// // Supported image extensions
// const supportedExtensions = ['.jpg', '.jpeg', '.png'];

// fs.readdir(inputDir, (err, files) => {
//   if (err) {
//     console.error('Error reading input directory:', err);
//     return;
//   }

//   const imageFiles = files.filter(file =>
//     supportedExtensions.includes(path.extname(file).toLowerCase())
//   );

//   imageFiles.forEach(file => {
//     const inputPath = path.join(inputDir, file);
//     const outputPath = path.join(outputDir, file);

//     const cmd = `ffmpeg -i "${inputPath}" -vf "crop=in_w:in_h*0.9:0:0" "${outputPath}"`;

//     exec(cmd, (error, stdout, stderr) => {
//       if (error) {
//         console.error(`Error processing ${file}: ${error.message}`);
//       } else {
//         console.log(`✅ Cropped ${file} successfully.`);
//       }
//     });
//   });
// });


// const ffmpeg = require('fluent-ffmpeg');
// const fs = require('fs');
// const path = require('path');


// module.exports = async () => {
//   const inputDir = path.join(__dirname, 'bossimg');
//   const outputDir = path.join(__dirname, 'cropped');

//   // Create output directory if not exists
//   if (!fs.existsSync(outputDir)) {
//     fs.mkdirSync(outputDir);
//   }

//   const supportedExtensions = ['.jpg', '.jpeg', '.png'];

//   fs.readdirSync(inputDir).forEach((file) => {
//     const ext = path.extname(file).toLowerCase();
//     if (!supportedExtensions.includes(ext)) return;

//     const inputPath = path.join(inputDir, file);
//     const outputPath = path.join(outputDir, file);

//     ffmpeg(inputPath)
//       .videoFilters('crop=in_w:in_h*0.9:0:0')
//       .on('error', (err) => {
//         console.error(`❌ Error processing ${file}: ${err.message}`);
//       })
//       .on('end', () => {
//         console.log(`✅ Cropped ${file} successfully.`);
//       })
//       .save(outputPath);
//   });


//   return;
// };


const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

module.exports = async () => {
  const inputDir = path.join(__dirname, 'bossimg');
  const outputDir = path.join(__dirname, 'cropped');

  // Create output directory if not exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  const supportedExtensions = ['.jpg', '.jpeg', '.png'];
  const files = fs.readdirSync(inputDir).filter(file => supportedExtensions.includes(path.extname(file).toLowerCase()));

  const tasks = files.map(file => {
    return new Promise((resolve, reject) => {
      const inputPath = path.join(inputDir, file);
      const outputPath = path.join(outputDir, file);

      ffmpeg(inputPath)
        .videoFilters('crop=in_w:in_h*0.9:0:0')
        .on('error', (err) => {
          console.error(`❌ Error processing ${file}: ${err.message}`);
          reject(err);
        })
        .on('end', () => {
          console.log(`✅ Cropped ${file} successfully.`);
          resolve();
        })
        .save(outputPath);
    });
  });

  await Promise.all(tasks); // wait until all images are cropped
  console.log('✅ All images cropped successfully!');
};
