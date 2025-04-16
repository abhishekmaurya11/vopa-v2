const fs = require('fs');
const { generateImage } = require("text2image-ai");


async function saveImage(imgprom,index) {
  const result = await generateImage(imgprom);
  
  // Remove the data URI prefix and convert Base64 to binary
  const base64Data = result.base64Image;
  const buffer = Buffer.from(base64Data, "base64");

  // Save the image
  fs.writeFileSync(`bossimg/imgs${index+1}.jpg`, buffer);
  console.log("✅ Image saved as output.jpg");
};

module.exports = async()=>{
  fs.readFile('imgprompts.json', 'utf8', (err, data) => {
    if (err) throw err;
    const jsonData = JSON.parse(data);
    console.log('hello',jsonData);
  
    jsonData.map((el,index) => {
      
      saveImage(el.prompt,index);
      return;
    });
  
  
  });

}



