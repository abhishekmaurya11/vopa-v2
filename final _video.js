// const { exec } = require("child_process");
// const path = require("path");

// module.exports = async () => {

//   const inputFolder = path.join(__dirname, "cropped");
//   const voiceAudio = path.join(__dirname, "output.mp3");
//   const bgMusic = path.join(__dirname, "greenm.mp3");
//   const outputFile = path.join(__dirname, "final_video.mp4");

//   const tempVideo = path.join(__dirname, "temp_video.mp4");
//   const mixedAudio = path.join(__dirname, "mixed_audio.mp3");

//   // Step 1: Create video from images (1 image = 3 seconds)
//   console.log("⏳ Step 1: Creating temp video from images...");
//   await runCommand(
//     `ffmpeg -y -framerate 1/3 -i "${inputFolder}\\imgs%d.jpg" -c:v libx264 -r 30 -pix_fmt yuv420p "${tempVideo}"`,
//     "Step 1: Creating temp video from images"
//   );

//   // Step 2: Mix voice and background music into a single audio
//   console.log("⏳ Step 2: Mixing audios...");
//   await runCommand(
//     `ffmpeg -y -i "${voiceAudio}" -i "${bgMusic}" -filter_complex "[1:a]volume=0.2[a1];[0:a][a1]amix=inputs=2:duration=first:dropout_transition=2" -c:a aac -b:a 192k "${mixedAudio}"`,
//     "Step 2: Mixing audios"
//   );

//   // Step 3: Combine the temp video and mixed audio into the final video
//   console.log("⏳ Step 3: Combining video with mixed audio...");
//   await runCommand(
//     `ffmpeg -y -i "${tempVideo}" -i "${mixedAudio}" -t $(ffmpeg -i "${tempVideo}" 2>&1 | grep "Duration" | cut -d ' ' -f 4 | sed s/,//) -c:v copy -c:a aac -shortest "${outputFile}"`,
//     "Step 3: Combining video with mixed audio"
//   );

//   // Step 4: Clean up temporary files
//   console.log("🧹 Step 4: Cleaning up temporary files...");
//   await runCommand(
//     `rm "${tempVideo}" "${mixedAudio}"`,
//     "Step 4: Cleaning up temporary files"
//   );

//   console.log("✅ Final video created at:", outputFile);

// }

// // Function to run a command and handle errors
// const runCommand = (command, stepName) => {
//   return new Promise((resolve, reject) => {
//     exec(command, (error, stdout, stderr) => {
//       if (error) {
//         console.error(`❌ Error in ${stepName}:`, error.message);
//         reject(error);
//       }
//       if (stderr) {
//         console.log(`ℹ️ ${stepName} log:\n`, stderr);
//       }
//       console.log(`✅ ${stepName} completed successfully!`);
//       resolve(stdout);
//     });
//   });
// };


// const { exec } = require("child_process");
// const path = require("path");
// const fs = require("fs");

// module.exports = async () => {
//   const inputFolder = path.join(__dirname, "cropped");
//   const voiceAudio = path.join(__dirname, "output.mp3");
//   const bgMusic = path.join(__dirname, "greenm.mp3");
//   const outputFile = path.join(__dirname, "final_video.mp4");

//   const tempVideo = path.join(__dirname, "temp_video.mp4");
//   const mixedAudio = path.join(__dirname, "mixed_audio.mp3");

//   // Step 1: Create video from images (1 image = 3 seconds)
//   console.log("⏳ Step 1: Creating temp video from images...");
//   await runCommand(
//     `ffmpeg -y -framerate 1/3 -i "${inputFolder}/imgs%d.jpg" -c:v libx264 -r 30 -pix_fmt yuv420p "${tempVideo}"`,
//     "Step 1: Creating temp video from images"
//   );

//   // Step 2: Mix voice and background music into a single audio
//   console.log("⏳ Step 2: Mixing audios...");
//   await runCommand(
//     `ffmpeg -y -i "${voiceAudio}" -i "${bgMusic}" -filter_complex "[1:a]volume=0.2[a1];[0:a][a1]amix=inputs=2:duration=first:dropout_transition=2" -c:a libmp3lame -q:a 4 "${mixedAudio}"`,
//     "Step 2: Mixing audios"
//   );

//   // Step 3: Combine the temp video and mixed audio into the final video
//   console.log("⏳ Step 3: Combining video with mixed audio...");
//   await runCommand(
//     `ffmpeg -y -i "${tempVideo}" -i "${mixedAudio}" -c:v copy -c:a aac -shortest "${outputFile}"`,
//     "Step 3: Combining video with mixed audio"
//   );

//   // Step 4: Clean up temporary files
//   console.log("🧹 Step 4: Cleaning up temporary files...");
//   try {
//     if (fs.existsSync(tempVideo)) fs.unlinkSync(tempVideo);
//     if (fs.existsSync(mixedAudio)) fs.unlinkSync(mixedAudio);
//     console.log("✅ Step 4: Temporary files removed!");
//   } catch (e) {
//     console.warn("⚠️ Could not delete temp files:", e.message);
//   }

//   console.log("🎉 Final video created at:", outputFile);
// };

// // Function to run a command and handle errors
// const runCommand = (command, stepName) => {
//   return new Promise((resolve, reject) => {
//     exec(command, (error, stdout, stderr) => {
//       if (error) {
//         console.error(`❌ Error in ${stepName}:`, error.message);
//         reject(error);
//         return;
//       }
//       if (stderr) {
//         console.log(`ℹ️ ${stepName} log:\n`, stderr);
//       }
//       console.log(`✅ ${stepName} completed successfully!`);
//       resolve(stdout);
//     });
//   });
// };


const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

module.exports = async () => {
  const inputFolder = path.join(__dirname, "cropped");
  const voiceAudio = path.join(__dirname, "output.mp3");
  const bgMusic = path.join(__dirname, "greenm.mp3");
  const outputFile = path.join(__dirname, "final_video.mp4");

  const tempVideo = path.join(__dirname, "temp_video.mp4");
  const mixedAudio = path.join(__dirname, "mixed_audio.mp3");

  // Directory for serving the video (adjust if your server uses a different folder)
  const downloadDir = path.join(__dirname, "public", "downloads");
  const downloadFile = path.join(downloadDir, "final_video.mp4");

  // Step 1: Create video from images (1 image = 3 seconds)
  console.log("⏳ Step 1: Creating temp video from images...");
  await runCommand(
    `ffmpeg -y -framerate 1/3 -i "${inputFolder}/imgs%d.jpg" -c:v libx264 -r 30 -pix_fmt yuv420p "${tempVideo}"`,
    "Step 1: Creating temp video from images"
  );

  // Step 2: Mix voice and background music into a single audio
  console.log("⏳ Step 2: Mixing audios...");
  await runCommand(
    `ffmpeg -y -i "${voiceAudio}" -i "${bgMusic}" -filter_complex "[1:a]volume=0.2[a1];[0:a][a1]amix=inputs=2:duration=first:dropout_transition=2" -c:a libmp3lame -q:a 4 "${mixedAudio}"`,
    "Step 2: Mixing audios"
  );

  // Step 3: Combine the temp video and mixed audio into the final video
  console.log("⏳ Step 3: Combining video with mixed audio...");
  await runCommand(
    `ffmpeg -y -i "${tempVideo}" -i "${mixedAudio}" -c:v copy -c:a aac -shortest "${outputFile}"`,
    "Step 3: Combining video with mixed audio"
  );

  // Step 4: Clean up temporary files
  console.log("🧹 Step 4: Cleaning up temporary files...");
  try {
    if (fs.existsSync(tempVideo)) fs.unlinkSync(tempVideo);
    if (fs.existsSync(mixedAudio)) fs.unlinkSync(mixedAudio);
    console.log("✅ Step 4: Temporary files removed!");
  } catch (e) {
    console.warn("⚠️ Could not delete temp files:", e.message);
  }

  // Step 5: Prepare video for download via existing server
  console.log("⏳ Step 5: Preparing video for download...");
  try {
    // Create download directory if it doesn't exist
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir, { recursive: true });
    }

    // Copy the final video to the download directory
    fs.copyFileSync(outputFile, downloadFile);
    console.log("✅ Step 5: Video copied to download directory!");

    // Log the download URL (adjust port and path based on your server)
    const downloadUrl = "http://localhost:3000/downloads/final_video.mp4";
    console.log(`🌐 Video available for download at: ${downloadUrl}`);
  } catch (e) {
    console.error("❌ Error preparing video for download:", e.message);
    throw e;
  }

  console.log("🎉 Final video created and ready for download at:", outputFile);
};

// Function to run a command and handle errors
const runCommand = (command, stepName) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error in ${stepName}:`, error.message);
        reject(error);
        return;
      }
      if (stderr) {
        console.log(`ℹ️ ${stepName} log:\n`, stderr);
      }
      console.log(`✅ ${stepName} completed successfully!`);
      resolve(stdout);
    });
  });
};