// // import axios from 'axios';

// // const apiKey = `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` // Replace with your real key


// // const headers = {
// //   'Authorization': `Bearer ${apiKey}`,
// //   'Content-Type': 'application/json',
// //   'HTTP-Referer': 'http://localhost', // Required: your site or "localhost"
// //   'X-Title': 'My OpenRouter Test App'  // Optional but good to include
// // };

// // export default async(txtidea) => {


// //     const body = {
// //         model: 'perplexity/r1-1776', // You can change the model!
// //         messages: [
// //           { role: 'system', content: 'You are a helpful assistant.' },
// //           { role: 'user', content: `${txtidea}` }
// //         ]
// //       };
      
// //       const valuemain = axios.post('https://openrouter.ai/api/v1/chat/completions', body, { headers })
// //         .then(res => {
// //           console.log('AI:', res.data.choices[0].message.content);
// //         return res.data.choices[0].message.content;

// //         })
// //         .catch(err => {
// //           console.error('Error:', err.response?.data || err.message);
// //         });
// // return valuemain;

// // }




// import axios from 'axios';

// const apiKey = `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`;

// const headers = {
//   'Authorization': `Bearer ${apiKey}`,
//   'Content-Type': 'application/json',
//   'HTTP-Referer': 'http://localhost',
//   'X-Title': 'My OpenRouter Test App'
// };

// export default async function text_gen(txtidea) {
//   const body = {
//     model: 'perplexity/r1-1776',
//     messages: [
//       { role: 'system', content: 'You are a helpful assistant.' },
//       { role: 'user', content: txtidea }
//     ]
//   };

//   try {
//     const res = await axios.post('https://openrouter.ai/api/v1/chat/completions', body, { headers });

//     // 🧪 Debug response
//     console.log('🧾 Raw API Response:', JSON.stringify(res.data, null, 2));

//     const content = res?.data?.choices?.[0]?.message?.content;
//     if (!content) {
//       throw new Error('No content returned from model');
//     }

//     console.log('✅ AI Response:', content);
//     return content;

//   } catch (err) {
//     console.error('❌ Error in text_gen:', err?.response?.data || err.message);
//     return null;
//   }
// }


// 


import axios from 'axios';

const apiKey = `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`; // Your key, securely stored

const headers = {
  'Authorization': `Bearer ${apiKey}`,
  'Content-Type': 'application/json',
  'HTTP-Referer': 'http://localhost', // Required
  'X-Title': 'My OpenRouter Test App'  // Optional
};

export default async (txtidea) => {
  const body = {
    model: 'anthropic/claude-3.5-sonnet', // Changed to Claude 3.5 Sonnet
    max_tokens: 800, // Prevents overload errors
    messages: [
      { role: 'system', content: 'You are Claude, a helpful assistant created by Anthropic, focused on providing accurate and thoughtful answers.' }, // Updated for Claude
      { role: 'user', content: txtidea }
    ]
  };

  try {
    const res = await axios.post('https://openrouter.ai/api/v1/chat/completions', body, { headers });
    const content = res?.data?.choices?.[0]?.message?.content;

    if (!content) {
      console.error('❌ Error in text_gen: No content returned from model');
      return null;
    }

    console.log('✅ AI:', content);
    return content;

  } catch (err) {
    const errorMsg = err.response?.data?.error?.message || err.message;
    console.error('❌ Error in text_gen:', errorMsg);
    return null;
  }
};