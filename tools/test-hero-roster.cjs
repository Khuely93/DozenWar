const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const S={phase:'deploy',botSide:2,botDifficulty:'normal',units:[],teams:{}};
const cells=Array.from({length:6},(_,i)=>({q:i,r:2,zone:2}));
const ctx=vm.createContext({S,cells,window:{},console,crypto:{randomUUID:()=>Math.random().toString()},unitAt:()=>null,currentDeployPlayer:()=>2,isBotSide:s=>s===2,renderBoard:()=>{},updateUI:()=>{},lg:()=>{},setTimeout:()=>{},mainAction:()=>{}});
for(const file of ['src/content/content-prelude-runtime.js','src/presentation/asset-definitions-runtime.js','locales/vi-VN-runtime.js','src/content/content-runtime.js'])new vm.Script(read(file)).runInContext(ctx);
new vm.Script('this.registry=HeroRegistry;this.pack=CONTENT_PACK_DUEL_001;this.builder=MatchContentSnapshotBuilder;this.troops=TROOPS;').runInContext(ctx);
assert.deepEqual(Array.from(ctx.registry.list(),h=>h.id),['HERO_INF_RODOC','HERO_INF_EST','HERO_INF_KAZU','HERO_CAV_MASK','HERO_CAV_SOUL','HERO_CAV_SIRI','HERO_ARCH_RAEN','HERO_ARCH_XACNAS','HERO_ARCH_LUCY','HERO_ALCH_GRIM','HERO_ALCH_NEURO','HERO_ALCH_RANUS']);
for(const id of ['HERO_INF_001','HERO_ARCH_001','HERO_CAV_001']){assert.equal(ctx.registry.has(id),false);assert.equal(ctx.pack.heroes.includes(id),false)}
assert.deepEqual(Object.keys(ctx.troops),['inf','arch','cav']);
const session=read('src/shell/shell-session-runtime.js');new vm.Script(session.split('\n').filter(l=>l.startsWith('function botTeam(){')||l.startsWith('function botDeploy(){')).join('\n')).runInContext(ctx);
for(const difficulty of ['easy','normal','hard']){S.botDifficulty=difficulty;for(let i=0;i<20;i++){
 const team=ctx.botTeam();assert.equal(ctx.registry.has(team.heroDefinitionId),true);assert.equal(Object.values(team.troops).reduce((a,b)=>a+b,0),5);
 S.teams[2]=team;S.units=[];ctx.botDeploy();assert.equal(S.units.length,6);assert.equal(S.units.filter(u=>u.hero).length,1);assert.equal(ctx.registry.has(S.units.find(u=>u.hero).definitionId),true);
}}
const flow=read('src/shell/shell-flow-runtime.js');assert.ok(!flow.includes("'HERO_INF_001'"));assert.ok(flow.includes("tempHeroDefinitionId='HERO_INF_RODOC'"));assert.ok(flow.includes('if(!HeroRegistry.list().some(h=>h.id===tempHeroDefinitionId))'),'stale choice is repaired');
console.log('Hero roster: confirmed twelve Heroes; removed Hero IDs absent from registry/content pack; Bot selects and deploys 1 Hero + 5 soldiers on every difficulty: PASS');

