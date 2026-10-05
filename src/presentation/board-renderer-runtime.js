
// Static sprite facing is presentation-only; no combat or movement flags change.
const TroopVisual={
  source(unit){
    if(unit.hero||!['inf','arch','cav'].includes(unit.kind))return null;
    const sides={1:'blue',2:'red',3:'gold',4:'silver'};
    const faction=['red','blue','gold','silver'].includes(unit.visualFaction)?unit.visualFaction:(sides[unit.side]||'red');
    const view=Number.isInteger(unit.visualView)&&unit.visualView>=1&&unit.visualView<=8?unit.visualView:(unit.side===1?5:1);
    return './assets/troops-v3/'+unit.kind+'-'+faction+'-'+view+'.webp';
  },
  render(group,unit,cell,symbol){
    const src=this.source(unit);if(!src)return;
    const ns='http://www.w3.org/2000/svg',baseSize=unit.kind==='cav'?110:92,size=baseSize*.8,yOffset=baseSize*.1;
    const image=document.createElementNS(ns,'image');
    image.setAttribute('href',src);image.setAttribute('x',cell.x-size/2);image.setAttribute('y',cell.y+10+yOffset-size*248/256);
    image.setAttribute('width',size);image.setAttribute('height',size);image.setAttribute('class','troopSprite');
    image.setAttribute('pointer-events','none');symbol.setAttribute('visibility','hidden');
    image.addEventListener('error',()=>{image.setAttribute('visibility','hidden');symbol.setAttribute('visibility','visible')});
    group.appendChild(image);
    const hit=document.createElementNS(ns,'rect');
    hit.setAttribute('x',cell.x-27);hit.setAttribute('y',cell.y-52);hit.setAttribute('width',54);hit.setAttribute('height',66);
    hit.setAttribute('fill','transparent');hit.setAttribute('pointer-events','all');hit.setAttribute('class','troopHit');group.appendChild(hit);
  }
};
const CoreBoardRenderer = {
  id: "CORE_BOARD_RENDERER",
  layers: [],

  registerLayer(id, priority, layer){
    if(this.layers.some(x=>x.id===id))return;
    this.layers.push({id,priority,layer});
    this.layers.sort((a,b)=>a.priority-b.priority);
  },

  hexClass(cell){
    let cls="hex "+(cell.zone===1?"zoneBottom":cell.zone===2?"zoneTop":"border");
    if(isHighlight(cell))cls+=" hl";
    if(isAttackHL(cell))cls+=" attack";
    let unit=unitAt(cell.q,cell.r);
    for(const entry of this.layers){
      if(typeof entry.layer.hexClasses==="function"){
        cls+=entry.layer.hexClasses(cell,unit)||"";
      }
    }
    return cls;
  },

  unitClass(unit){
    let cls="unit";
    if(S.phase==="deploy"&&currentDeployPlayer()!==S.botSide&&unit.side===currentDeployPlayer())cls+=" deployDraggable";
    for(const entry of this.layers){
      if(typeof entry.layer.unitClasses==="function"){
        cls+=entry.layer.unitClasses(unit)||"";
      }
    }
    return cls;
  },

  render(){
    boardSvg.innerHTML="";

    // BASE HEX LAYER
    for(const cell of cells){
      let polygon=document.createElementNS("http://www.w3.org/2000/svg","polygon");
      polygon.setAttribute("points",hexPts(cell.x,cell.y));
      polygon.setAttribute("stroke","#fff");
      polygon.setAttribute("stroke-width","1.2");
      polygon.setAttribute("vector-effect","non-scaling-stroke");
      polygon.setAttribute("class",this.hexClass(cell));
      polygon.dataset.q=cell.q;polygon.dataset.r=cell.r;
      polygon.addEventListener("click",()=>CoreInputRouter.handleHexClick(cell));
      boardSvg.appendChild(polygon);
    }

    // UNIT LAYER + REGISTERED VISUAL LAYERS
    for(const unit of S.units.filter(x=>x.hp>0)){
      let cell=cells.find(c=>c.q===unit.q&&c.r===unit.r);
      if(!cell)continue;

      let group=document.createElementNS("http://www.w3.org/2000/svg","g");
      group.setAttribute("class",this.unitClass(unit));
      group.dataset.unitId=unit.id;

      for(const entry of this.layers){
        entry.layer.renderBeforeUnit?.(group,unit,cell);
      }

      let circle=document.createElementNS("http://www.w3.org/2000/svg","circle");
      circle.setAttribute("cx",cell.x);circle.setAttribute("cy",cell.y);circle.setAttribute("r",28);
      circle.setAttribute("fill",unit.side===1?"#2f86c7":"#c54b4b");
      if(TroopVisual.source(unit)){circle.setAttribute('fill-opacity','.22');circle.setAttribute('class','troopTeamRing team'+unit.side);}
      group.appendChild(circle);

      let symbol=document.createElementNS("http://www.w3.org/2000/svg","text");
      symbol.setAttribute("x",cell.x);symbol.setAttribute("y",cell.y-2);
      symbol.textContent=unitSpec(unit).sym;
      symbol.setAttribute("font-size","24");
      group.appendChild(symbol);
      TroopVisual.render(group,unit,cell,symbol);

      let hp=document.createElementNS("http://www.w3.org/2000/svg","text");
      hp.setAttribute("x",cell.x);hp.setAttribute("y",cell.y+(TroopVisual.source(unit)?29:20));
      if(TroopVisual.source(unit))hp.setAttribute('class','troopHP');
      hp.textContent="❤"+unit.hp;hp.setAttribute("fill","#fff");
      group.appendChild(hp);

      for(const entry of this.layers){
        entry.layer.renderAfterUnit?.(group,unit,cell);
      }

      group.addEventListener("click",e=>{
        e.stopPropagation();
        CoreInputRouter.handleUnitClick(unit);
      });

      if(S.phase==="deploy"&&currentDeployPlayer()!==S.botSide&&unit.side===currentDeployPlayer())bindDeployDrag(group,unit);
      boardSvg.appendChild(group);
    }
  }
};

// Visual layers are registered once. New mechanics add a layer instead of
// replacing renderBoard().
// This layer reads Core action flags without intercepting targeting clicks.
const CoreActionStatusLayer = {
  status(unit){
    if(S.phase!=="battle")return null;
    if(unit.attacked)return "complete";
    return unit.moved||unit.movementCostSpent>0?"moved":null;
  },
  renderAfterUnit(group,unit,cell){
    const status=this.status(unit);
    if(!status)return;
    const ns="http://www.w3.org/2000/svg";
    const icon=document.createElementNS(ns,"g");
    icon.setAttribute("class","unitActionStatus "+status);
    icon.setAttribute("aria-label",status==="complete"?"Đã kết thúc hành động":"Đã di chuyển");
    icon.setAttribute("transform",`translate(${cell.x+30} ${cell.y-27})`);
    const badge=document.createElementNS(ns,"circle");
    badge.setAttribute("r","13");badge.setAttribute("class","unitActionBadge");
    icon.appendChild(badge);
    const mark=document.createElementNS(ns,"path");
    mark.setAttribute("class","unitActionMark");
    mark.setAttribute("d",status==="complete"
      ?"M -5 -5 L 5 5 M 5 -5 L -5 5"
      :"M -7 -3 L -2 -3 L 0 1 L 6 2 L 7 5 L -7 5 Z M -7 -7 L 7 7");
    icon.appendChild(mark);
    group.appendChild(icon);
  }
};
// Read the active damage recipient from combat state; no input or combat mutations.
const CoreIncomingAttackLayer = {
  targetId(){
    const p=S.pending;
    if(S.phase!=="battle"||S.matchEnded||!p)return null;
    const redirect=p.replacementTargetId||(!p.ignoreGuard&&p.guard?p.guardUnitId:null);
    return S.units.some(u=>u.id===redirect&&u.hp>0)?redirect:p.d;
  },
  isTarget(unit){return !!unit&&unit.hp>0&&unit.id===this.targetId()},
  hexClasses(cell,unit){return this.isTarget(unit)?" incomingAttackHex":""},
  unitClasses(unit){return this.isTarget(unit)?" incomingAttackTarget":""},
  renderAfterUnit(group,unit,cell){
    if(!this.isTarget(unit))return;
    const ns="http://www.w3.org/2000/svg",visual=document.createElementNS(ns,"g");
    visual.setAttribute("class","incomingAttackVisual");
    visual.setAttribute("aria-label","Đang bị tấn công");
    const ring=document.createElementNS(ns,"circle");
    ring.setAttribute("cx",cell.x);ring.setAttribute("cy",cell.y);ring.setAttribute("r",34);
    ring.setAttribute("class","incomingAttackRing");visual.appendChild(ring);
    const badge=document.createElementNS(ns,"circle");
    badge.setAttribute("cx",cell.x-30);badge.setAttribute("cy",cell.y-27);badge.setAttribute("r",12);
    badge.setAttribute("class","incomingAttackBadge");visual.appendChild(badge);
    const mark=document.createElementNS(ns,"path");
    mark.setAttribute("d","M -7 0 H 7 M 0 -7 V 7");
    mark.setAttribute("transform",`translate(${cell.x-30} ${cell.y-27})`);
    mark.setAttribute("class","incomingAttackCrosshair");visual.appendChild(mark);
    const label=document.createElementNS(ns,"text");
    label.setAttribute("x",cell.x);label.setAttribute("y",cell.y-45);
    label.setAttribute("class","incomingAttackLabel");label.textContent="BỊ TẤN CÔNG";
    visual.appendChild(label);group.appendChild(visual);
  }
};
CoreBoardRenderer.registerLayer("CORE_RENDER_INCOMING_ATTACK",70,CoreIncomingAttackLayer);
CoreBoardRenderer.registerLayer("CORE_RENDER_BUFF",30,CoreBuffController);
CoreBoardRenderer.registerLayer("CORE_RENDER_SKILL",40,CoreSkillController);
CoreBoardRenderer.registerLayer("CORE_RENDER_GUARD",50,CoreGuardController);
CoreBoardRenderer.registerLayer("CORE_RENDER_ACTION_STATUS",60,CoreActionStatusLayer);

// Single authoritative renderer entry point.
function renderBoard(){ const result=CoreBoardRenderer.render();if(typeof DuelBoardLayout!=='undefined')DuelBoardLayout.schedule();return result; }

// Compatibility entry point for any legacy code that still calls cellClick().
function cellClick(cell){ return CoreInputRouter.handleHexClick(cell); }
