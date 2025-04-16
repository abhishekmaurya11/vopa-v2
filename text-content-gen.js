import axios from 'axios';

const apiKey = `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` // Replace with your real key


const headers = {
  'Authorization': `Bearer ${apiKey}`,
  'Content-Type': 'application/json',
  'HTTP-Referer': 'http://localhost', // Required: your site or "localhost"
  'X-Title': 'My OpenRouter Test App'  // Optional but good to include
};

export default async(txtidea) => {


    const body = {
        model: 'perplexity/r1-1776', // You can change the model!
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: `${txtidea}` }
        ]
      };
      
      const valuemain = axios.post('https://openrouter.ai/api/v1/chat/completions', body, { headers })
        .then(res => {
          console.log('AI:', res.data.choices[0].message.content);
        return res.data.choices[0].message.content;

        })
        .catch(err => {
          console.error('Error:', err.response?.data || err.message);
        });
return valuemain;

}


