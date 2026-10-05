const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'project-manifest.json'), 'utf8'));
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
const short = b => sha(b).slice(0, 12);
const ensure = p => fs.mkdirSync(p, {recursive:true});
const copyDir = (src, dst) => {
  if (!fs.existsSync(src)) return;
  ensure(dst);
  for (const e of fs.readdirSync(src, {withFileTypes:true})) {
    const a = path.join(src, e.name), b = path.join(dst, e.name);
    if (e.isDirectory()) copyDir(a,b); else fs.copyFileSync(a,b);
  }
};
if (path.dirname(DIST) !== ROOT || path.basename(DIST) !== 'dist') throw new Error('Build output must be the project dist directory');
fs.rmSync(DIST, {recursive:true, force:true});
ensure(path.join(DIST, 'assets'));

// Preserve exact runtime source order in one production file. Delimiters only separate classic script files.
const parts = manifest.runtimeOrder.map(rel => fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const runtimeBundle = parts.join('\n;\n');
const jsHash = short(runtimeBundle);
const jsName = `runtime.${jsHash}.js`;
fs.writeFileSync(path.join(DIST, 'assets', jsName), runtimeBundle);

const css = fs.readFileSync(path.join(ROOT, manifest.styles), 'utf8');
const cssHash = short(css);
const cssName = `app.${cssHash}.css`;
fs.writeFileSync(path.join(DIST, 'assets', cssName), css);

let html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
// Production-only externalization: decode inline base64 image assets into hashed files.
let externalized = [];
html = html.replace(/src="data:image\/(png|jpeg|jpg|webp);base64,([A-Za-z0-9+/=]+)"/g, (full, ext, b64) => {
  const normalizedExt = ext === 'jpeg' ? 'jpg' : ext;
  const buf = Buffer.from(b64, 'base64');
  const h = short(buf);
  const name = `embedded-${h}.${normalizedExt}`;
  const target = path.join(DIST, 'assets', name);
  if (!fs.existsSync(target)) fs.writeFileSync(target, buf);
  externalized.push({name, bytes:buf.length, sha256:sha(buf)});
  return `src="./assets/${name}"`;
});
// Root source may reference an already externalized image after GitHub deployment.
for(const match of html.matchAll(/src="\.\/assets\/(embedded-[a-f0-9]+\.(?:png|jpg|webp))"/g)){
  fs.copyFileSync(path.join(ROOT,'assets',match[1]),path.join(DIST,'assets',match[1]));
}
html = html.replace(/<link\s+rel="stylesheet"\s+href="\.\/styles\/main\.css(?:\?[^\"]*)?"\s*\/?>/, `<link rel="stylesheet" href="./assets/${cssName}">`);
html = html.replace(/(?:\s*<script\s+defer\s+src="\.\/[^\"]+"><\/script>\s*)+/g, '\n<script defer src="./assets/' + jsName + '"></script>\n');
html = html.replace(/LATEST PLAYTEST v\d+\.\d+\.\d+[^<]*/, 'LATEST PLAYTEST v' + manifest.version + ' · PROD BUNDLE · ACTION STATUS · CONTENT SCHEMA v1.5 · CORE / MODE / SHELL / CONTENT / PRESENTATION');
fs.writeFileSync(path.join(DIST, 'index.html'), html);

copyDir(path.join(ROOT, 'assets'), path.join(DIST, 'assets'));

const files = [
  ['index.html', fs.readFileSync(path.join(DIST,'index.html'))],
  [`assets/${jsName}`, fs.readFileSync(path.join(DIST,'assets',jsName))],
  [`assets/${cssName}`, fs.readFileSync(path.join(DIST,'assets',cssName))]
];
const report = files.map(([name,b]) => ({
  file:name, bytes:b.length, gzipBytes:zlib.gzipSync(b,{level:9}).length,
  brotliBytes:zlib.brotliCompressSync(b,{params:{[zlib.constants.BROTLI_PARAM_QUALITY]:11}}).length,
  sha256:sha(b)
}));
const buildManifest = {
  project:'DOZEN WAR II', version:manifest.version, phase:manifest.phase,
  generatedAt:new Date().toISOString(),
  runtimeOrder:manifest.runtimeOrder,
  bundles:{runtime:`assets/${jsName}`,styles:`assets/${cssName}`},
  externalizedEmbeddedAssets:externalized,
  note:'Build hashes are deployment artifact hashes. Gameplay compatibility remains authoritative in runtime ContentManifestBuilder/gameplayHash.',
  files:report
};
fs.writeFileSync(path.join(DIST,'build-manifest.json'), JSON.stringify(buildManifest,null,2));
console.log(`Built ${path.relative(ROOT,DIST)}/`);
console.log(`Runtime bundle: ${jsName}`);
console.log(`CSS bundle: ${cssName}`);
console.log(`Externalized embedded images: ${externalized.length}`);
for (const r of report) console.log(`${r.file}: ${r.bytes} bytes | gzip ${r.gzipBytes} | brotli ${r.brotliBytes}`);
