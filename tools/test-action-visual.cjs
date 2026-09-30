const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../src/presentation/board-renderer-runtime.js'),'utf8');
const css=fs.readFileSync(path.join(__dirname,'../styles/main.css'),'utf8');
assert.match(css,/\.unitActionStatus,\.unitActionStatus \*\{pointer-events:none\}/);
function node(tag){return{tag,attributes:{},children:[],dataset:{},listeners:{},
  setAttribute(name,value){this.attributes[name]=value},
  appendChild(child){this.children.push(child)},
  addEventListener(name,handler){this.listeners[name]=handler},
  set innerHTML(value){this.children=[]}}}
const S={phase:'battle',units:[],selected:null};
const boardSvg=node('svg');
const clicks=[];
const cell={q:0,r:0,x:100,y:100};
const context=vm.createContext({S,boardSvg,cells:[cell],document:{createElementNS:(_,tag)=>node(tag)},
  isHighlight:()=>false,isAttackHL:()=>false,unitAt:()=>S.units[0]||null,
  unitSpec:()=>({sym:'🛡️'}),hexPts:()=>'',CoreBuffController:{},CoreSkillController:{},CoreGuardController:{},
  CoreInputRouter:{handleUnitClick:unit=>clicks.push(unit.id),handleHexClick:()=>{}},
  currentDeployPlayer:()=>1,bindDeployDrag:()=>{}});
new vm.Script(source+'\nthis.actionStatus=CoreActionStatusLayer;').runInContext(context);
const hero={id:'hero',side:1,hero:true,q:0,r:0,hp:3,moved:false,movementCostSpent:0,attacked:false};
const troop={...hero,id:'troop',hero:false};
function check(unit,status,mark){
  S.units=[unit];context.renderBoard();
  const rendered=boardSvg.children.find(n=>n.tag==='g');
  assert.ok(rendered,'unit rendered');
  const badges=rendered.children.filter(n=>n.attributes.class?.startsWith('unitActionStatus'));
  assert.equal(badges.length,status?1:0,`${unit.id}: ${status||'idle'}`);
  if(status){
    assert.equal(badges[0].attributes.class,'unitActionStatus '+status);
    assert.ok(badges[0].children.some(n=>n.tag==='path'&&n.attributes.d.includes(mark)));
  }
  rendered.listeners.click({stopPropagation:()=>{}});
  assert.equal(clicks.at(-1),unit.id,'status icon must not block targeting');
}
for(const unit of [hero,troop]){
  check(unit,null,'');
  unit.moved=true;unit.movementCostSpent=1;check(unit,'moved','M -7 -3');
  unit.attacked=true;check(unit,'complete','M -5 -5');
  unit.moved=false;unit.movementCostSpent=0;unit.attacked=false;check(unit,null,'');
}
S.phase='deploy';hero.moved=true;S.units=[hero];context.renderBoard();
assert.equal(boardSvg.children.find(n=>n.tag==='g').children.filter(n=>n.attributes.class?.startsWith('unitActionStatus')).length,0);
const core=fs.readFileSync(path.join(__dirname,'../src/core/core-runtime-a.js'),'utf8');
const routerStart=core.indexOf('const CoreInputRouter = Object.freeze({');
const routerEnd=core.indexOf('\n});',routerStart)+4;
assert.ok(routerStart>=0&&routerEnd>routerStart);
const routed=[];let mode='guard';
const inputState={phase:'battle',battleSide:1,botSide:2,units:[{id:'human',side:1},{id:'bot',side:2}]};
const router=vm.createContext({S:inputState,lastDragEnd:0,
  CoreGuardController:{active:()=>mode==='guard',handleUnitClick:()=>routed.push('guard')},
  CoreSkillController:{active:()=>mode==='skill',handleUnitClick:()=>routed.push('skill')},
  CoreAttackController:{active:()=>mode==='attack',handleUnitClick:()=>routed.push('attack')},
  selectUnit:()=>routed.push('normal')});
new vm.Script(core.slice(routerStart,routerEnd)+'\nthis.route=CoreInputRouter.handleUnitClick.bind(CoreInputRouter);this.routeHex=CoreInputRouter.handleHexClick.bind(CoreInputRouter);').runInContext(router);
for(mode of ['guard','skill','attack','normal'])router.route({...troop,attacked:true});
assert.deepEqual(routed,['guard','skill','attack','normal']);
inputState.battleSide=2;mode='normal';router.route({...troop,side:2});router.routeHex(cell);
assert.equal(routed.length,4,'human cannot issue orders to Bot during Bot turn');
inputState.pending={d:'human'};mode='guard';router.route({...troop,side:1});
assert.equal(routed.at(-1),'guard','human may respond to Bot attack');
inputState.pending={d:'bot'};router.route({...troop,side:2});
assert.equal(routed.length,5,'human cannot choose Bot defense');
console.log('Action visuals: action badges and ownership of Bot turn/defense: PASS');
