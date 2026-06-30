const fs = require('fs').promises;
const https = require('https');
const http = require('http');
const fetch = require('node-fetch');
// Pexels API Configuration
const PEXELS_API_KEY = 'zktXZfZyxDvRiAHbfd2fTR0cioV6pRyNSLRacwfUU13gWVXl7ZVI73kB';
const PEXELS_BASE_URL = 'https://api.pexels.com/v1/search';

// Function to download image from URL
function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, { headers: { 'User-Agent': 'Node.js' } }, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        // Handle redirect
        return downloadImage(response.headers.location).then(resolve).catch(reject);
      }
      
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
}

// Function to search and save image from Pexels
async function saveImage(searchQuery, index) {
  try {
    // Encode the search query
    const encodedQuery = encodeURIComponent(searchQuery);
    const url = `${PEXELS_BASE_URL}?query=${encodedQuery}&per_page=1&orientation=landscape`;

    // Search for images on Pexels
    const response = await fetch(url, {
      headers: {
        'Authorization': PEXELS_API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.photos || data.photos.length === 0) {
      console.log(`⚠️  No image found for: "${searchQuery}"`);
      return;
    }

    // Get the large image URL
    const imageUrl = data.photos[0].src.large2x || data.photos[0].src.large;

    // Download the image
    const buffer = await downloadImage(imageUrl);

    // Create directory if it doesn't exist
    const dir = 'bossimg';
    if (!require('fs').existsSync(dir)) {
      require('fs').mkdirSync(dir);
    }

    // Save the image
    await fs.writeFile(`${dir}/imgs${index + 1}.jpg`, buffer);
    console.log(`✅ Image saved as imgs${index + 1}.jpg (Query: "${searchQuery}")`);

  } catch (err) {
    console.error(`❌ Error saving image ${index + 1}:`, err.message);
  }
}

module.exports = async () => {
  try {
    const data = await fs.readFile('imgprompts.json', 'utf8');
    const jsonData = JSON.parse(data);

    console.log(`🔍 Searching for ${jsonData.length} images on Pexels...`);

    // Process images sequentially to avoid rate limiting
    for (let i = 0; i < jsonData.length; i++) {
      await saveImage(jsonData[i].prompt, i);
      // Add small delay to avoid hitting rate limits
      if (i < jsonData.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log('✅ All images downloaded successfully!');
  } catch (err) {
    console.error('❌ Error in creating images:', err);
  }
};
