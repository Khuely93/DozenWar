const http = require('http');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
function arg(name, fallback) {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
}
const root = path.resolve(arg('--root', '.'));
const port = Number(arg('--port', '5173'));
const host = '127.0.0.1';
const mime = {
  '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8',
  '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8',
  '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp',
  '.svg':'image/svg+xml', '.woff2':'font/woff2', '.txt':'text/plain; charset=utf-8'
};
function safeFile(urlPath) {
  let p = decodeURIComponent((urlPath || '/').split('?')[0]);
  if (p === '/') p = '/index.html';
  const full = path.resolve(root, '.' + p);
  if (!full.startsWith(root + path.sep) && full !== root) return null;
  return full;
}
const server = http.createServer((req, res) => {
  let file = safeFile(req.url);
  if (!file) { res.writeHead(403); return res.end('Forbidden'); }
  try {
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file)) { res.writeHead(404); return res.end('Not found'); }
    const ext = path.extname(file).toLowerCase();
    res.setHeader('Content-Type', mime[ext] || 'application/octet-stream');
    res.setHeader('Cache-Control', 'no-cache');
    fs.createReadStream(file).pipe(res);
  } catch (e) {
    res.writeHead(500); res.end(String(e && e.message || e));
  }
});
server.listen(port, host, () => {
  console.log(`DOZEN WAR II server: http://${host}:${port}`);
  console.log(`Root: ${root}`);
});
