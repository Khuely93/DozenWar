const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const core=read('src/core/core-runtime-a.js');
function fn(name){const start=core.indexOf('function '+name+'(');assert.ok(start>=0,name);const brace=core.indexOf('{',start);let depth=0,end=brace;for(;end<core.length;end++){if(core[end]==='{')depth++;if(core[end]==='}'&&--depth===0)break}return core.slice(start,end+1)}
function load(extra=''){
 const ctx=vm.createContext({window:{},console,crypto:{randomUUID:()=> 'test'},S:{phase:'battle',selectedMode:'MODE_DUEL_001',battleSide:1,units:[]},dirs:[[1,0],[0,1],[-1,1],[-1,0],[0,-1],[1,-1]],cells:[{q:0,r:0},{q:1,r:0},{q:2,r:0},{q:0,r:1}]});
 for(const file of ['src/content/content-prelude-runtime.js','src/presentation/asset-definitions-runtime.js','locales/vi-VN-runtime.js'])new vm.Script(read(file)).runInContext(ctx);
 let content=read('src/content/content-runtime.js');
 if(extra)content=content.replace('const HERO_DB=normalizeContentTable',extra+'\nconst HERO_DB=normalizeContentTable');
 new vm.Script(content).runInContext(ctx);
 new vm.Script(['unitSpec','axial','distU','aligned','canAttack','validCardFor','guardCandidates','unitAt','movementBudgetTotal','movementCostSpent','remainingMove','canMoveFurther','reachableCellCosts','cellNeighbors'].map(fn).join('\n')+'\nthis.api={unitSpec,canAttack,validCardFor,guardCandidates,reachableCellCosts};this.views=ContentViews;this.registry=HeroRegistry;this.create=createRuntimeEntityInstance;this.validate=validateContentSchema;this.rules=HERO_CLASS_RULES;this.troops=TROOPS;this.duelUsage=()=>({attackCard:{1:0,2:0},defenseCard:{1:0,2:0}});').runInContext(ctx);
 return ctx;
}
const original=load();assert.equal(original.registry.list().length,2,'no invented playable Hero');assert.equal(original.validate().ok,true);
assert.deepEqual(Object.keys(original.troops),['inf','arch','cav'],'no Alchemist soldier');
// A future Hero is inserted only in this test fixture before real normalization.
const ctx=load("RAW_HERO_DB.HERO_ALCH_TEST={id:'HERO_ALCH_TEST',nameKey:'HERO_INF_001_NAME',class:'ALCH',stats:{hp:4},skillIds:[],assets:{}};");
const h=ctx.create({definitionId:'HERO_ALCH_TEST',hero:true,side:1,q:0,r:0});ctx.S.units=[h];
assert.equal(h.kind,'alch');assert.equal(h.classId,'ALCH');assert.equal(h.hp,4,'HP belongs to Hero');assert.equal(ctx.validate().ok,true);
const spec=ctx.api.unitSpec(h);assert.equal(spec.base,'alchemist');assert.equal(spec.move,1);assert.equal(spec.range,1);assert.equal(spec.attackPattern,'RANGE');assert.equal(spec.passives.length,0);
assert.equal(ctx.api.canAttack(h,{q:1,r:0}),true);assert.equal(ctx.api.canAttack(h,{q:0,r:1}),true);assert.equal(ctx.api.canAttack(h,{q:2,r:0}),false);
assert.equal(ctx.api.reachableCellCosts(h).has('1,0'),true);assert.equal(ctx.api.reachableCellCosts(h).has('2,0'),false);h.moved=true;assert.equal(ctx.api.reachableCellCosts(h).size,0);h.moved=false;
for(const type of ['atk','def','neu'])for(const cls of ['neutral','infantry','archer','cavalry','alchemist'])for(const context of ['atk','def']){
 ctx.S.battleSide=context==='def'?2:1;
 assert.equal(ctx.api.validCardFor({type,cls},h,context),cls==='neutral'&&(type===context||type==='neu'),'only legal common equipment');
}
const ally={id:'ally',definitionId:'UNIT_ARCH_001',side:1,hp:1,q:1,r:0};ctx.S.units.push(ally);assert.equal(ctx.api.guardCandidates(ally).length,0,'Alchemist has no infantry guard');
assert.equal(vm.runInContext("EquipmentRegistry.list().filter(e=>e.class==='NEU').every(e=>e.eligibility.classIds.includes('ALCH'))",ctx),true,'common equipment metadata includes new class');
assert.throws(()=>load("RAW_UNIT_DB.UNIT_ALCH_TEST={id:'UNIT_ALCH_TEST',nameKey:'UNIT_INF_001_NAME',class:'ALCH',stats:{hp:1,move:1,attackRange:1},passives:[],assets:{}};"),/validation failed/,'soldier content rejected');
console.log('Alchemist: class registration, future Hero defaults/deployment, movement/attack, common equipment only, no inherited guard/Pierce and no soldiers: PASS');
