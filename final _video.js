
module.exports = async () => {

  const { exec } = require("child_process");
  const path = require("path");
  

  const inputFolder = path.join(__dirname, "cropped");
  const voiceAudio = path.join(__dirname, "output.mp3");
  const bgMusic = path.join(__dirname, "greenm.mp3");
  const outputFile = path.join(__dirname, "final_video.mp4");

  const tempVideo = "temp_video.mp4";
  const mixedAudio = "mixed_audio.mp3";

  // Step 1: Create video from images (1 image = 3 seconds)
  // Step 2: Mix voice + background music into a single audio
  // Step 3: Combine video + mixed audio
  // Step 4: Cleanup temp files

  const command = `
ffmpeg -y -framerate 1/3 -pattern_type glob -i "${inputFolder}/*.jpg" -c:v libx264 -r 30 -pix_fmt yuv420p ${tempVideo} && \
ffmpeg -y -i "${voiceAudio}" -i "${bgMusic}" -filter_complex "[1:a]volume=0.2[a1];[0:a][a1]amix=inputs=2:duration=first:dropout_transition=2" -c:a aac -b:a 192k ${mixedAudio} && \
ffmpeg -y -i ${tempVideo} -i ${mixedAudio} -t $(ffmpeg -i ${tempVideo} 2>&1 | grep "Duration" | cut -d ' ' -f 4 | sed s/,//) -c:v copy -c:a aac -shortest "${outputFile}" && \
rm ${tempVideo} ${mixedAudio}
`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error("❌ Error:", error.message);
      return;
    }
    if (stderr) console.log("ℹ️ FFmpeg log:\n", stderr);
    console.log("✅ Final video created at:", outputFile);
  });



return;




  // const inputFolder = path.join(__dirname, "cropped");
  // const voiceAudio = path.join(__dirname, "output.mp3");
  // const bgMusic = path.join(__dirname, "greenm.mp3");
  // const outputFile = path.join(__dirname, "final_video.mp4");

  // const tempVideo = "temp_video.mp4";
  // const mixedAudio = "mixed_audio.mp3";

  // // Step 1: Create video from images (1 image = 3 seconds)
  // // Step 2: Mix voice + background music into a single audio
  // // Step 3: Combine video + mixed audio
  // // Step 4: Cleanup temp files

  // const command = `
  // ffmpeg -y -framerate 1/3 -pattern_type glob -i "${inputFolder}/*.jpg" -c:v libx264 -r 30 -pix_fmt yuv420p ${tempVideo} && \
  // ffmpeg -y -i "${voiceAudio}" -i "${bgMusic}" -filter_complex "[1:a]volume=0.2[a1];[0:a][a1]amix=inputs=2:duration=first:dropout_transition=2" -c:a aac -b:a 192k ${mixedAudio} && \
  // ffmpeg -y -i ${tempVideo} -i ${mixedAudio} -c:v copy -c:a aac -shortest "${outputFile}" && \
  // rm ${tempVideo} ${mixedAudio}
  // `;

  // exec(command, (error, stdout, stderr) => {
  //   if (error) {
  //     console.error("❌ Error:", error.message);
  //     return;
  //   }
  //   if (stderr) console.log("ℹ️ FFmpeg log:\n", stderr);
  //   console.log("✅ Final video created at:", outputFile);
  // });


}

