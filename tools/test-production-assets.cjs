const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const source = read('src/presentation/board-renderer-runtime.js');
const ctx = vm.createContext({});
vm.runInContext(source.slice(0, source.indexOf('const CoreBoardRenderer')) + ';this.visual = TroopVisual;', ctx);
let checked = 0;
for (const kind of ['inf', 'arch', 'cav']) {
  for (const faction of ['red', 'blue', 'gold', 'silver']) for (let view=1;view<=8;view++) {
    const relative=ctx.visual.source({kind,side:1,hero:false,visualFaction:faction,visualView:view});
    assert.equal(relative,'./assets/troops-v3/'+kind+'-'+faction+'-'+view+'.webp');
    assert.deepEqual(fs.readFileSync(path.join(root,'dist',relative)),fs.readFileSync(path.join(root,relative)),'Sprite '+relative);
    checked++;
  }
}
for (const [side,faction,view] of [[1,'blue',5],[2,'red',1],[3,'gold',1],[4,'silver',1]]) {
  assert.equal(ctx.visual.source({kind:'inf',side,hero:false}),'./assets/troops-v3/inf-'+faction+'-'+view+'.webp');
}
assert.equal(ctx.visual.source({kind:'inf',side:1,visualFaction:'invalid',visualView:99}),'./assets/troops-v3/inf-blue-5.webp');
assert.equal(ctx.visual.source({kind:'inf', side:1, hero:true}), null, 'Hero retains its own visual');
const manifest = JSON.parse(read('project-manifest.json'));
const built = JSON.parse(read('dist/build-manifest.json'));
assert.equal(built.version, manifest.version, 'Production metadata version');
assert.equal(read('dist/index.html').match(/LATEST PLAYTEST v(\d+\.\d+\.\d+)/)?.[1], manifest.version, 'Production banner version');
for (const relative of Object.values(built.bundles)) assert.ok(fs.existsSync(path.join(root, 'dist', relative)), 'Missing bundle: ' + relative);
console.log('PASS | Production sprites (' + checked + '), unchanged sprite bytes, Hero visual, version and bundles');
