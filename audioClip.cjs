
// const fs = require('fs');
// const path = require('path');
// const tts = require('google-translate-tts');

// exports.audioCli = async (audtxt) => {
//   try {
//     const buffer = await tts.synthesize({
//       text: audtxt,
//       voice: 'en',       // or 'en-US'
//       slow: false,
//     });

//     const filePath = path.join(__dirname, 'hello-world.mp3');
//     fs.writeFileSync(filePath, buffer);
//     console.log('✅ Audio saved to:', filePath);
//   } catch (err) {
//     console.error('❌ Error generating audio:', err.message || err);
//   }
// };

require('punycode/');

const { createAudioFile } = require('simple-tts-mp3');

exports.audioCli = async (audtxt) => {
 
  await createAudioFile(audtxt, 'output', 'en');
};
