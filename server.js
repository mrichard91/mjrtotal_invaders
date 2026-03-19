const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT ? Number(process.env.PORT) : 5173;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.txt': 'text/plain; charset=utf-8'
};

const send = (res, status, body, type) => {
  res.writeHead(status, { 'Content-Type': type });
  res.end(body);
};

const server = http.createServer((req, res) => {
  const urlPath = new URL(req.url, `http://${req.headers.host}`).pathname;
  const safePath = path.normalize(urlPath).replace(/^\/+/, '');
  const filePath = path.join(PUBLIC_DIR, safePath || 'index.html');

  if (!filePath.startsWith(PUBLIC_DIR)) {
    send(res, 403, 'Forbidden', 'text/plain; charset=utf-8');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      const indexPath = path.join(PUBLIC_DIR, 'index.html');
      fs.readFile(indexPath, (readErr, data) => {
        if (readErr) {
          send(res, 404, 'Not Found', 'text/plain; charset=utf-8');
          return;
        }
        send(res, 200, data, MIME_TYPES['.html']);
      });
      return;
    }

    fs.readFile(filePath, (readErr, data) => {
      if (readErr) {
        send(res, 500, 'Server Error', 'text/plain; charset=utf-8');
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      send(res, 200, data, MIME_TYPES[ext] || 'application/octet-stream');
    });
  });
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running at http://localhost:${PORT}`);
});
