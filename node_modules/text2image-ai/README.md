# Text2Image AI 🖼️  

✅ **Free to use! NO LIMIT!**
🖌️ Generate **AI-powered** images from text prompts! Supports Base64 output and **multiple languages**.

![NPM Version](https://img.shields.io/npm/v/text2image-ai?color=blue&style=flat-square)  
![Downloads](https://img.shields.io/npm/dt/text2image-ai?color=green&style=flat-square)  
![License](https://img.shields.io/npm/l/text2image-ai?style=flat-square)  

---

## 📦 Installation  

```sh
npm install text2image-ai
```

---

## 🚀 Features  
✅ **AI-powered image generation from text**  
✅ **Supports multiple languages (`en`, `tr`, `es`, `fr`, `de`)**  
✅ **Returns Base64 encoded images**  
✅ **Lightweight and easy to use**  
✅ **Can be used in CLI or server-side applications**  

---

## 🔥 Quick Start  

```js
const { generateImage } = require("text2image-ai");

async function main() {
  const result = await generateImage("a futuristic city at sunset", "en");
  console.log(result);
}

main();
```

📌 **Example Output:**  
```json
{
  "originalPrompt": "a futuristic city at sunset",
  "translatedPrompt": "a futuristic city at sunset",
  "language": "en",
  "base64Image": "/9j/4AAQSkZ..."
}
```

---

## 💾 Saving the Image (Base64 to File)  

You can **convert the Base64 image to a file** using `fs` in Node.js.  

```js
const { generateImage } = require("text2image-ai");
const fs = require("fs");

async function saveImage() {
  const result = await generateImage("a cyberpunk city at night", "en");
  
  // Remove the data URI prefix and convert Base64 to binary
  const base64Data = result.base64Image;
  const buffer = Buffer.from(base64Data, "base64");

  // Save the image
  fs.writeFileSync("output.jpg", buffer);
  console.log("✅ Image saved as output.jpg");
}

saveImage();
```

---

## 🌍 Language Support  

| Language Code | Language |
|--------------|---------|
| `en` | English |
| `tr` | Turkish |
| `es` | Spanish |
| `fr` | French |
| `de` | German |

If a different language is provided, it defaults to English.  

---

## 📜 License  

This project is licensed under the **MIT License**.  

---

## 🌟 Support & Contact  

- **GitHub Issues:** [Report Bugs or Request Features](https://github.com/utkuberkaykoc/text2image-ai/issues)  
- **⭐ Give a Star:** If you like this package, support by starring the repo!  

🚀 **Ready to create amazing AI-generated images?** 😎  
