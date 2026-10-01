const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const parent={clientWidth:920},style={width:'',removeProperty:k=>delete style[k]},board={parentElement:parent,style,getBoundingClientRect:()=>({top:180})};
const window={innerWidth:1366,innerHeight:768,scrollY:0,addEventListener(){}};
const S={selectedMode:'MODE_DUEL_001',phase:'deploy'};
let queue=[];const context=vm.createContext({window,S,CoreDOM:{board:{wrap:board}},requestAnimationFrame:f=>(queue.push(f),queue.length)});
new vm.Script(read('src/presentation/duel-board-layout-runtime.js')+'\nthis.layout=DuelBoardLayout;').runInContext(context);
assert.equal(context.layout.dockHeight(768),190);assert.equal(context.layout.dockHeight(1080),260);assert.equal(context.layout.dockHeight(936),228);
queue.shift()();assert.equal(style.width,'564px','1366x768 map fits below toolbar');
window.innerWidth=1920;window.innerHeight=1080;parent.clientWidth=1080;context.layout.fit();assert.equal(style.width,'876px');
window.innerWidth=1101;window.innerHeight=720;parent.clientWidth=650;context.layout.fit();assert.equal(style.width,'516px');
parent.clientWidth=420;context.layout.fit();assert.equal(style.width,'420px','width constrains map');
window.scrollY=120;board.getBoundingClientRect=()=>({top:60});context.layout.fit();assert.equal(style.width,'420px','scroll retains map dimensions');
window.innerWidth=390;context.layout.fit();assert.equal(style.width,undefined,'mobile uses full available width');
window.innerWidth=1366;S.selectedMode='MODE_WAR_GOD_001';context.layout.fit();assert.equal(style.width,undefined,'other mode unaffected');
S.selectedMode='MODE_DUEL_001';S.phase='battle';parent.clientWidth=650;context.layout.schedule();context.layout.schedule();assert.equal(queue.length,1,'resize coalesced');queue.shift()();assert.equal(style.width,'516px');
// Actual pointer conversion must still address the same hex coordinates after scaling.
const core=read('src/core/core-runtime-a.js');const source=core.split('\n').find(l=>l.startsWith('function svgPointFromPointer('));
const scaled=vm.createContext({boardSvg:{getBoundingClientRect:()=>({left:20,top:180,width:516,height:516})}});new vm.Script(source).runInContext(scaled);
const p=scaled.svgPointFromPointer({clientX:20+516*.5,clientY:180+516*.5});assert.equal(p.x,500);assert.equal(p.y,500);
assert.match(read('styles/main.css'),/aspect-ratio:1/);
console.log('Duel board fit: laptop/desktop/narrow PC, mobile, resize, stable scrolling and scaled pointer coordinates: PASS');

// Presentation labels preserve disabled state and original gameplay handlers.
const handler=()=>{},buttons=[0,1,2].map(i=>({disabled:i===0,onclick:handler,attrs:{},setAttribute(k,v){this.attrs[k]=v},replaceChildren(...nodes){this.nodes=nodes}}));
context.document={querySelectorAll:()=>buttons,createElement:()=>({})};
context.unitSpec=()=>({skillIds:['heal','move','hit']});context.ContentViews={skill:id=>({name:id,description:'Full '+id,star:id==='heal'?3:1,timing:id==='heal'?'DEFENSE_REACTION':'ACTIVE'})};
S.selected={hero:true};context.layout.mounted=true;context.layout.decorateSkills();
assert.equal(buttons[0].disabled,true);assert.equal(buttons[1].disabled,false);assert.equal(buttons[1].onclick,handler);assert.equal(buttons[0].nodes[1].textContent,'★★★');assert.equal(buttons[0].title,'Full heal');assert.equal(buttons[1].nodes[0].textContent,'move');
console.log('Dock skill labels preserve event handlers, disabled state, stars and full tooltips: PASS');
