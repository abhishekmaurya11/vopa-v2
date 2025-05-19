const http = require('http');
const fs = require('fs');
const path = require('path');
const mime = require('mime'); // Optional: helps set proper Content-Type

const PORT = 3000;
const imageFolder = path.join(__dirname, 'images');

const server = http.createServer((req, res) => {
  if (req.url === "/") {
    // Read all image files
    fs.readdir(imageFolder, (err, files) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Error reading image folder");
        return;
      }

      const imageFiles = files.filter(file =>
        ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(path.extname(file).toLowerCase())
      );

      // Generate HTML
      const html = `
        <html>
          <head><title>Image Gallery</title></head>
          <body>
            <h1>Downloadable Image Gallery</h1>
            ${imageFiles.map(file => `
              <a href="/images/${file}" download="${file}">
                <img src="/images/${file}" alt="${file}" width="300" style="margin:10px;" />
              </a>
            `).join('')}
          </body>
        </html>
      `;

      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(html);
    });

  } else if (req.url.startsWith("/images/")) {
    const imagePath = path.join(imageFolder, decodeURIComponent(req.url.replace("/images/", "")));

    fs.readFile(imagePath, (err, data) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Image not found");
      } else {
        res.writeHead(200, { "Content-Type": mime.getType(imagePath) || 'image/jpeg' });
        res.end(data);
      }
    });

  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
