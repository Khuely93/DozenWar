// Shared fixed-camera presentation for offline and online. Never writes game state.
const HeroBoardVisuals = (() => {
  const directions = Object.freeze(['front','back','front+45','back+45','front-45','back-45']);
  const valid = name => directions.includes(name);
  const get = id => globalThis.DW_HERO_CAMERA_CATALOG?.[id] || globalThis.DW_TROOP_CAMERA_CATALOG?.[id] || null;
  function faction(unit) {
    const requested=unit.visualFaction==='gray'?'silver':unit.visualFaction;
    return ['blue','red','gold','silver'].includes(requested)?requested:({1:'blue',2:'red',3:'gold',4:'silver'}[unit.side] || 'red');
  }
  // The camera is fixed above the board: blue shows its back, red its front.
  // Crossing the board, attacking or reconnecting must not rotate the drawing.
  const pose = unit => faction(unit)==='blue'?'back':'front';
  const troopId = unit => 'TROOP_'+String(unit.kind).toUpperCase()+'_'+faction(unit).toUpperCase();
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
  return Object.freeze({directions,get,faction,pose,troopId,create});
})();
