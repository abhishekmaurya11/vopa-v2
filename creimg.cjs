// const fs = require('fs');
// const { generateImage } = require("text2image-ai");


// async function saveImage(imgprom,index) {
//   const result = await generateImage(imgprom);
  
//   // Remove the data URI prefix and convert Base64 to binary
//   const base64Data = result.base64Image;
//   const buffer = Buffer.from(base64Data, "base64");

//   // Save the image
//   fs.writeFileSync(`bossimg/imgs${index+1}.jpg`, buffer);
//   console.log("✅ Image saved as output.jpg");
//   return;
// };

// module.exports = async()=>{
//   fs.readFile('imgprompts.json', 'utf8',  (err, data) => {
//     if (err) throw err;
//     const jsonData = JSON.parse(data);
//     console.log('hello',jsonData);
  
//     jsonData.map(async(el,index) => {
      
//       await saveImage(el.prompt,index);
      
//     });
  
  
//   });

// }



const fs = require('fs').promises; // use promises version
const { generateImage } = require("text2image-ai");

async function saveImage(imgprom, index) {
  const result = await generateImage(imgprom);

  const base64Data = result.base64Image;
  const buffer = Buffer.from(base64Data, "base64");

  const dir = 'bossimg';
  if (!require('fs').existsSync(dir)) {
    require('fs').mkdirSync(dir);
  }

  // Save the image
  await fs.writeFile(`${dir}/imgs${index + 1}.jpg`, buffer);
  console.log(`✅ Image saved as imgs${index + 1}.jpg`);
}

module.exports = async () => {
  try {
    const data = await fs.readFile('imgprompts.json', 'utf8');
    const jsonData = JSON.parse(data);

    // map to promises
    const tasks = jsonData.map((el, index) => saveImage(el.prompt, index));
    await Promise.all(tasks); // <-- wait for all images to finish
    console.log('✅ All images created successfully!');
  } catch (err) {
    console.error('❌ Error in creating images:', err);
  }
};

