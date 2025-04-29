// const fs = require('fs');
import fs from 'fs';
import text_gen from './text-content-gen.js';
import { audioCli } from './audioClip.cjs';
import creimg from './creimg.cjs';
import imgcrp from './croptime.js';
// import vidimg from './imgvideo.js';
import finlvid from './final _video.js'
import alen from './audiolen.js';
export default async () => {

    // content  gen code is here
    const rre = await text_gen('create random story of exact 100 words on the sceret mission science fiction based and the hero of the story if agent mike and please generate response in plain english no any special characters or any comma or full stop or punctuation i think you got it now go');
    console.log(rre);

    await audioCli(`${rre}`);
    const audioduration = await alen();

    // ${Math.ceil(audioduration/3)}
    let rora = await text_gen(`this a "${rre}" a story create ${Math.ceil(audioduration/3)} image prompts in sequence based on this story that represents this story one by one according to storyine of the story, 40 remember not less not more than that, format: json type, make sure format should be like this( [
{
"prompt": "Portrait of Agent Mike, a scientist and secret agent with determined look and laboratory equipment in background"
},
{
"prompt": "An image of a sleek and futuristic spaceship traveling through the depths of space"
}] ) `);

    if (rora) {
        fs.writeFile('imgprompts.json', rora, { flag: 'w' }, (err) => {
            if (err) {
                console.error('❌ Error writing file:', err);
            } else {
                console.log('✅ File written successfully!');
            }
        });
    }

  
    await creimg();
    await imgcrp();
    await finlvid();
    // await vidimg();
};

