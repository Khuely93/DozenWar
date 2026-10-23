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
    assert.equal(relative,'./assets/troops-compact-dw-style-01/'+kind+'-'+faction+'.webp');
    assert.deepEqual(fs.readFileSync(path.join(root,'dist',relative)),fs.readFileSync(path.join(root,relative)),'Sprite '+relative);
    checked++;
  }
}
for (const [side,faction,view] of [[1,'blue',5],[2,'red',1],[3,'gold',1],[4,'silver',1]]) {
  assert.equal(ctx.visual.source({kind:'inf',side,hero:false}),'./assets/troops-compact-dw-style-01/inf-'+faction+'.webp');
}
assert.equal(ctx.visual.source({kind:'inf',side:1,visualFaction:'invalid',visualView:99}),'./assets/troops-compact-dw-style-01/inf-blue.webp');
assert.equal(ctx.visual.source({kind:'arch',side:1,visualFaction:'gray'}),'./assets/troops-compact-dw-style-01/arch-silver.webp');
const troops=JSON.parse(read('assets/troops-compact-dw-style-01/manifest.json'));
assert.equal(troops.assets.length,12,'Three classes in four faction colors');
for(const entry of troops.assets){
  const bytes=fs.readFileSync(path.join(root,entry.asset));
  assert.equal(require('node:crypto').createHash('sha256').update(bytes).digest('hex'),entry.sha256);
  assert.deepEqual(fs.readFileSync(path.join(root,'dist',entry.asset)),bytes);
}
assert.equal(ctx.visual.source({kind:'inf', side:1, hero:true}), null, 'Hero retains its own visual');
// Exercise actual content registration: every approved Hero must resolve to its
// transparent static board asset, for both sides and any legacy facing value.
const content=vm.createContext({window:{},console,crypto:require('node:crypto').webcrypto});
for(const file of ['src/content/content-prelude-runtime.js','src/presentation/asset-definitions-runtime.js','locales/vi-VN-runtime.js','src/content/content-runtime.js'])vm.runInContext(read(file),content);
vm.runInContext('this.heroRegistry=HeroRegistry;this.assetRegistry=AssetRegistry;',content);
ctx.HeroRegistry=content.heroRegistry;ctx.AssetRegistry=content.assetRegistry;
const artwork=JSON.parse(read('assets/heroes/dw-style-01-manifest.json'));
assert.equal(artwork.heroes.length,12);
for(const hero of artwork.heroes){
  const def=content.heroRegistry.get(hero.heroId),token=content.assetRegistry.get(def.assets.token);
  assert.equal(token.boardSprite,true,hero.name+' registered as a board sprite');
  assert.equal(token.source,'./'+hero.board.asset);
  assert.equal(token.boardFrame.anchorY,.96);
  assert.equal(token.boardFrame.height,def.class==='CAV'?114:100);
  assert.equal(token.boardFrame.width,token.boardFrame.height,'Compact square frame');
  assert.equal(require('node:crypto').createHash('sha256').update(fs.readFileSync(path.join(root,hero.board.asset))).digest('hex'),hero.board.assetSha256);
  assert.equal(require('node:crypto').createHash('sha256').update(fs.readFileSync(path.join(root,hero.asset))).digest('hex'),hero.assetSha256,'Original portrait preserved');
  for(const side of [1,2])for(const visualView of [1,5,8])assert.equal(ctx.visual.source({hero:true,definitionId:hero.heroId,side,visualView}),token.source);
  assert.deepEqual(fs.readFileSync(path.join(root,'dist',hero.board.asset)),fs.readFileSync(path.join(root,hero.board.asset)),hero.name+' production board bytes');
}
// Shared atlases are the primary route; registered static tokens remain fallbacks.
const directionalContext=vm.createContext({HeroRegistry:content.heroRegistry,AssetRegistry:content.assetRegistry});
vm.runInContext(read('assets/heroes-camera-06/catalog.js')+'\n'+read('assets/troops-camera-team/catalog.js')+'\n'+read('assets/heroes-camera-06/renderer.js')+'\n'+source.slice(0,source.indexOf('const CoreBoardRenderer'))+';this.visual=TroopVisual;',directionalContext);
const directional=JSON.parse(read('assets/heroes-camera-06/manifest.json'));
assert.equal(directional.status,'APPROVED_FOR_GAME');assert.equal(directional.entries.length,12);
for(const entry of directional.entries){
 assert.equal(directionalContext.visual.source({hero:true,definitionId:entry.definitionId,side:1}),entry.source);
 assert.deepEqual(fs.readFileSync(path.join(root,'dist',entry.source)),fs.readFileSync(path.join(root,entry.source)));
 assert.equal(Object.keys(entry.poses).length,6);
}
for(const file of ['catalog.js','renderer.js'])assert.deepEqual(fs.readFileSync(path.join(root,'dist/assets/heroes-camera-06',file)),fs.readFileSync(path.join(root,'assets/heroes-camera-06',file)));
assert(read('dist/online/index.html').includes('../assets/heroes-camera-06/catalog.js'));
const teamTroops=JSON.parse(read('assets/troops-camera-team/manifest.json'));
for(const e of teamTroops.entries){
 const unit={kind:e.kind,side:e.faction==='blue'?1:2,hero:false};
 assert.equal(directionalContext.visual.source(unit),e.source);
 assert.deepEqual(fs.readFileSync(path.join(root,'dist',e.source)),fs.readFileSync(path.join(root,e.source)));
}
assert.deepEqual(fs.readFileSync(path.join(root,'dist/assets/troops-camera-team/catalog.js')),fs.readFileSync(path.join(root,'assets/troops-camera-team/catalog.js')));
assert(read('dist/online/index.html').includes('../assets/troops-camera-team/catalog.js'));
const map=JSON.parse(read('assets/map-gallery/map-compact-manifest.json'));
const mapBytes=fs.readFileSync(path.join(root,map.asset));
assert.equal(require('node:crypto').createHash('sha256').update(mapBytes).digest('hex'),map.assetSha256);
assert.deepEqual(fs.readFileSync(path.join(root,'dist',map.asset)),mapBytes,'Approved map production bytes');
assert(read('dist/index.html').includes('data-duel-src="./'+map.asset+'"'));
assert(read('dist/index.html').includes('data-backdrop-src="./'+map.asset+'"'));
const manifest = JSON.parse(read('project-manifest.json'));
const built = JSON.parse(read('dist/build-manifest.json'));
assert.equal(built.version, manifest.version, 'Production metadata version');
assert.equal(read('dist/index.html').match(/data-build-version="(\d+\.\d+\.\d+)"/)?.[1], manifest.version, 'Production document version');
for (const file of ['panel.webp', 'button.webp', 'fortress.webp', 'theme.css', 'concept-atlas.png', 'hud-concept-atlas.png', 'concept-skins.js', 'concept-fidelity.css']) {
  assert.deepEqual(fs.readFileSync(path.join(root, 'dist/assets/ui/dw-style-01', file)), fs.readFileSync(path.join(root, 'assets/ui/dw-style-01', file)), 'Production UI surface ' + file);
}
assert(read('dist/index.html').includes('./assets/ui/dw-style-01/theme.css'));
assert(read('dist/online/index.html').includes('../assets/ui/dw-style-01/theme.css'));
assert.deepEqual(fs.readFileSync(path.join(root, 'assets/ui/dw-style-01/concept-atlas.png')), fs.readFileSync(path.join(root, 'visual-previews/ui-mode-dw-style-01/dozenwar-ui-mode-dw-style-01.png')), 'Concept atlas uses the unmodified approved source');
assert.deepEqual(fs.readFileSync(path.join(root, 'assets/ui/dw-style-01/hud-concept-atlas.png')), fs.readFileSync(path.join(root, 'visual-previews/ui-ingame-dw-style-01/01-desktop-hud.png')), 'HUD atlas uses the unmodified approved source');
assert(read('dist/index.html').includes('concept-fidelity.css'));
assert(read('dist/online/index.html').includes('concept-skins.js'));
for (const relative of Object.values(built.bundles)) assert.ok(fs.existsSync(path.join(root, 'dist', relative)), 'Missing bundle: ' + relative);
console.log('PASS | 12 compact DW-STYLE-01 troop colors (' + checked + ' legacy facing routes), 12 Hero board visuals, production bytes, version and bundles');
