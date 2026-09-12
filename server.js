const http = require('http');
const fs = require('fs');
const path = require('path');

const root = 'C:/Users/green/Desktop/IIITeam/WOX ENGINE FIERA 2026/GAMES MAKERS/DEAD oClock';
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  let reqUrl = decodeURI(req.url.split('?')[0]);
  if (reqUrl === '/') reqUrl = '/index.html';
  if (reqUrl === '/favicon.ico') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  const filePath = path.join(root, reqUrl);
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, {'Content-Type': 'text/plain'});
      res.end('404 Not Found: ' + reqUrl);
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`DEAD : THE HALLOWEEN MASSACRE server running at: http://localhost:${PORT}/`);
});
