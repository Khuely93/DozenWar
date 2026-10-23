// Shared presentation for offline and online clients. Never writes game state.
const HeroBoardVisuals = (() => {
  const directions = Object.freeze(['front','back','front+45','back+45','front-45','back-45']);
  const valid = name => directions.includes(name);
  const defaultPose = unit => unit.side === 1 ? 'back' : 'front';
  const get = id => globalThis.DW_HERO_CAMERA_CATALOG?.[id] || null;

  function direction(dx,dy,previous='back') {
    if (!Number.isFinite(dx) || !Number.isFinite(dy) || Math.hypot(dx,dy)<1e-9) return previous;
    // No horizontal sprites were approved. Resolve the horizontal tie using
    // the previous front/back hemisphere instead of mirroring a drawing.
    const front = Math.abs(dy)<1e-9 ? previous.startsWith('front') : dy>0;
    if (Math.abs(dx)<=Math.abs(dy)*Math.tan(Math.PI/8)) return front?'front':'back';
    return front ? (dx>0?'front+45':'front-45') : (dx>0?'back-45':'back+45');
  }
  function towards(a,b,previous) {
    const dq=b.q-a.q,dr=b.r-a.r;
    return direction(Math.sqrt(3)*(dq+dr/2),1.5*dr,previous);
  }
  function createFacingController() {
    let key;
    const positions=new Map();
    return {
      update(units,options={}) {
        if (options.key!==key) {positions.clear();key=options.key;}
        const present=new Set(units.map(u=>u.id));
        for (const id of positions.keys()) if(!present.has(id))positions.delete(id);
        for (const unit of units) {
          const old=positions.get(unit.id);
          let pose=old?.pose || defaultPose(unit);
          if (old && (old.side!==unit.side || old.definitionId!==unit.definitionId)) pose=defaultPose(unit);
          else if(old && (old.q!==unit.q || old.r!==unit.r)) pose=towards(old,unit,pose);
          positions.set(unit.id,{q:unit.q,r:unit.r,side:unit.side,definitionId:unit.definitionId,pose});
        }
        const p=options.pending;
        if(p) {
          const a=units.find(u=>u.id===p.a);
          const targetId=p.replacementTargetId || (p.guard && p.guardUnitId) || p.d;
          const d=units.find(u=>u.id===targetId);
          if(a && d && a.id!==d.id) {
            positions.get(a.id).pose=towards(a,d,positions.get(a.id).pose);
            positions.get(d.id).pose=towards(d,a,positions.get(d.id).pose);
          }
        }
      },
      pose(unit) {return valid(unit.visualFacing)?unit.visualFacing:(positions.get(unit.id)?.pose || defaultPose(unit));},
      clear() {positions.clear();key=undefined;}
    };
  }
  function create(id,pose,point,options={}) {
    const entry=get(id);
    if(!entry)return null;
    const name=valid(pose)?pose:'front',crop=entry.poses[name];
    if(!crop)return null;
    const ns='http://www.w3.org/2000/svg';
    const node=(tag,attributes)=>{
      const n=document.createElementNS(ns,tag);
      for(const [key,value] of Object.entries(attributes))n.setAttribute(key,value);
      return n;
    };
    const frame=entry.frame,extent=entry.extent;
    const root=node('svg',{
      x:point.x-frame.width*frame.anchorX,y:point.y-frame.height*frame.anchorY,
      width:frame.width,height:frame.height,viewBox:'0 0 '+extent+' '+extent,
      overflow:'visible','pointer-events':'none',class:options.className || 'heroBoardSprite',
      'data-facing':name,'data-hero':id,'data-foot-x':point.x,'data-foot-y':point.y,
      role:'img','aria-label':options.label || entry.name
    });
    const tile=node('svg',{
      x:extent*frame.anchorX+crop.x-crop.footX,
      y:extent*frame.anchorY+crop.y-crop.footY,
      width:crop.width,height:crop.height,
      viewBox:[crop.x,crop.y,crop.width,crop.height].join(' '),overflow:'hidden'
    });
    const image=node('image',{
      href:options.resolve?options.resolve(entry.source):entry.source,
      width:entry.width,height:entry.height,'pointer-events':'none',class:'heroAtlasImage'
    });
    tile.appendChild(image);root.appendChild(tile);
    return {root,image,entry,pose:name};
  }
  return Object.freeze({directions,get,direction,createFacingController,create});
})();
