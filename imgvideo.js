const { exec } = require("child_process");
const path = require("path");

// Folder where images are stored

module.exports = async ()=> {
    const inputFolder = path.join(__dirname, "cropped");
    const outputFile = path.join(__dirname, "output.mp4");
    
    // FFmpeg command: 1 image shown every 3 seconds (0.333 FPS)
    const command = `ffmpeg -framerate 1/3 -pattern_type glob -i "${inputFolder}/*.jpg" -c:v libx264 -pix_fmt yuv420p "${outputFile}"`;
    
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error("Error:", error.message);
            return;
        }
        if (stderr) console.log("FFmpeg stderr:\n", stderr);
        console.log("Video created successfully at:", outputFile);
    });
    

}
