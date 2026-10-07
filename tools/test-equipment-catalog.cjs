const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
function load(cards=[]){
 const ctx=vm.createContext({window:{},console,crypto:require('node:crypto').webcrypto});
 for(const file of ['src/content/content-prelude-runtime.js','src/presentation/asset-definitions-runtime.js','locales/vi-VN-runtime.js','src/content/content-runtime.js']){
  let code=read(file);if(file.endsWith('/content-runtime.js'))code=code.replace('const NEW_EQUIPMENT_CATALOG={version:1,cards:[]};','const NEW_EQUIPMENT_CATALOG='+JSON.stringify({version:1,cards})+';');vm.runInContext(code,ctx);
 }
 return code=>vm.runInContext(code,ctx);
}
const run=load();assert.equal(run('CONTENT_VALIDATION.ok'),true);assert.equal(run('EquipmentRegistry.list().length'),0);
assert.equal(run('DeckRuntimeBuilder.buildEquipmentIds("DECK_DUEL_STANDARD_001").length'),0);
assert.equal(run('DeckRuntimeBuilder.dealStartingHand("DECK_DUEL_STANDARD_001",1,5).length'),0);
assert.equal(run('HeroRegistry.list().length'),12);assert.equal(run('Object.keys(EQUIPMENT_GROUPS).length'),4);
for(const id of ['CARD_INF_ATK_001','CARD_ARCH_ATK_001','CARD_CAV_ATK_001','CARD_INF_DEF_001','CARD_ARCH_DEF_001','CARD_CAV_DEF_001','CARD_NEU_DEF_001','CARD_NEU_DEF_002','CARD_NEU_UTILITY_001'])assert.equal(run(`EquipmentRegistry.has('${id}')`),false);
// Synthetic designs only: not part of the playable catalog.
const cards=Object.keys({INF:1,ARCH:1,CAV:1,COMMON:1}).flatMap(group=>['ATTACK','DEFENSE'].map(category=>({id:`EQUIP_${group}_${category==='ATTACK'?'ATK':'DEF'}_TEST`,group,category,name:'Fixture '+group,text:'Fixture effect',star:category==='ATTACK'?1:4,effects:[category==='ATTACK'?'EFFECT_DAMAGE_PLUS_1':'EFFECT_CANCEL_ATTACK'],count:group==='INF'?2:1,visual:{art:'./assets/equipment/test.webp'}})));
const r=load(cards);assert.equal(r('CONTENT_VALIDATION.ok'),true);assert.equal(r('DeckRuntimeBuilder.buildEquipmentIds("DECK_DUEL_STANDARD_001").length'),10);
assert.equal(r('DeckRuntimeBuilder.buildEquipmentIds("DECK_DUEL_STANDARD_001").filter(id=>id==="EQUIP_INF_ATK_TEST").length'),2);
assert.equal(r('new Set(EquipmentRegistry.list().flatMap(c=>Object.values(c.assets))).size'),24);
assert.equal(r('equipmentEligibleForClass(EquipmentRegistry.get("EQUIP_COMMON_DEF_TEST"),"ALCH")'),true);
assert.equal(r('equipmentEligibleForClass(EquipmentRegistry.get("EQUIP_INF_DEF_TEST"),"ALCH")'),false);
assert.equal(r('AssetResolver.source(EquipmentRegistry.get("EQUIP_INF_ATK_TEST").assets.art)'), './assets/equipment/test.webp');
assert.equal(r('createEquipmentCardInstance("EQUIP_INF_ATK_TEST",1).instanceId===createEquipmentCardInstance("EQUIP_INF_ATK_TEST",1).instanceId'),false);
assert.equal(r('createEquipmentCardInstance("EQUIP_INF_ATK_TEST",1).type'),'atk');
assert.equal(r('createEquipmentCardInstance("EQUIP_COMMON_DEF_TEST",2).star'),4);
assert.equal(load([{...cards[0],count:0}])('DeckRuntimeBuilder.buildEquipmentIds("DECK_DUEL_STANDARD_001").length'),0);
for(const mutation of [{star:0},{count:-1},{count:1.5},{group:'ALCH'},{category:'UTILITY'},{id:'CARD_INF_ATK_001'}])assert.throws(()=>load([{...cards[0],...mutation}]));
assert.throws(()=>load([cards[0],cards[0]]));
assert.throws(()=>load([{...cards[0],effects:['MISSING_EFFECT']}]));
console.log('Equipment catalog: empty transition, retired IDs, four groups, stars/timing/effects, unique assets and instances, unequal/zero copy counts and invalid input rejection PASS');
