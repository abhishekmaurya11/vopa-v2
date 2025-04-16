const fetch = require("node-fetch");

const API_URL = "https://utku.berkaykoc.net/api/entertainment/text2image";

/**
 * Generates an AI image from a text prompt with multi-language support.
 * @param {string} prompt - The text prompt for the AI image.
 * @param {string} [lang="en"] - Language of the prompt (default: English). Supports "en", "tr", "es", "fr", "de".
 * @returns {Promise<Object>} - Returns an object with the original prompt, translated prompt, and base64 image.
 */
async function generateImage(prompt, lang = "en") {
  try {
    if (!prompt || typeof prompt !== "string") {
      throw new Error("A valid text prompt is required.");
    }

    const response = await fetch(`${API_URL}?prompt=${encodeURIComponent(prompt)}&lang=${lang}`);
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(`Image generation failed: ${error.message}`);
  }
}

module.exports = { generateImage };
