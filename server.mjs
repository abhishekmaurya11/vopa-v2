// import http from 'http';
// import http from 'http';
// import text_gen from './text-content-gen.mjs';

// const http = require('http');
// const querystring = require('querystring');
import http from 'http';
import querystring from 'querystring';
import extra from './extra.mjs';

// const PORT = 3000;
const PORT = process.env.PORT || 3000;  // Use PORT from environment or default 3000

const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/') {
        // Serve the HTML with textarea and button
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
      <html>
      <body>
        <form method="POST" action="/submit">
          <textarea name="text" rows="5" cols="40" placeholder="Type something..."></textarea><br/>
          <button type="submit">Send Text</button>
        </form>
      </body>
      </html>
    `);
    }
    else if (req.method === 'POST' && req.url === '/submit') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async() => {
            const parsed = querystring.parse(body);
            const receivedText = parsed.text || '';

            // Respond with confirmation
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`<h1>Received Text:</h1><p>${receivedText}</p>`);

            // You can do anything here with receivedText, like save or log
            console.log('Text received from client:', receivedText);
            await extra(receivedText);
            console.log('done video');

        });
    }
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

// const server = http.createServer(async(req, res) => {
// await extra();
// res.end();
// });

// server.listen(3000, () => {
//     console.log('server is at 3000 http://localhost:3000')
// })
