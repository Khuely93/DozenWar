const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const p = path.join(ROOT,'dist','build-manifest.json');
if (!fs.existsSync(p)) { console.error('dist/build-manifest.json not found. Run npm run build first.'); process.exit(1); }
const m = JSON.parse(fs.readFileSync(p,'utf8'));
console.log(`DOZEN WAR II ${m.version} build report`);
for (const f of m.files) console.log(`${f.file}: ${(f.bytes/1024).toFixed(1)} KiB | gzip ${(f.gzipBytes/1024).toFixed(1)} KiB | brotli ${(f.brotliBytes/1024).toFixed(1)} KiB`);
console.log(`Embedded images externalized: ${m.externalizedEmbeddedAssets.length}`);
