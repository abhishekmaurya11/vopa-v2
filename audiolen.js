const mm = require('music-metadata');
const fs = require('fs');

// Path to the audio file
const filePath = './output.mp3';

// Function to get the audio length
module.exports = async function () {
    try {
        const metadata = await mm.parseFile(filePath);
        const duration = metadata.format.duration;  // Duration in seconds
        console.log(`Audio Length: ${duration} seconds`);
        return duration;
    } catch (err) {
        console.error('Error reading audio file:', err);
    }
}

// getAudioLength();
