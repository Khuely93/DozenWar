/* Camera transforms presentation only. Logical cells and gameplay state stay unchanged. */
const DuelCamera={
  enabled:false,stage:null,board:null,scene:null,base:1000,width:0,height:0,
  zoom:1.4,panX:0,panY:0,minZoom:.65,maxZoom:2.6,panMode:false,
  drag:null,suppressUntil:0,popups:new Map(),matchId:null,reactionKey:null,
  mount(stage,board){
    if(this.scene)return;
    this.stage=stage;this.board=board;
    const scene=document.createElement('div');scene.className='duelWorld';
    const img=board.querySelector('.boardBg');
    const backdrop=document.createElement('div');backdrop.className='duelMapBackdrop';
    backdrop.style.backgroundImage='url("'+img.getAttribute('src')+'")';
    board.prepend(backdrop,scene);scene.append(img,CoreDOM.board.svg);this.scene=scene;
    const controls=document.createElement('div');controls.className='duelCameraControls';controls.setAttribute('aria-label','Điều khiển camera');
    for(const [name,label,action] of [['zoom-out','−',()=>this.zoomAt(this.zoom/1.18)],['zoom-in','+',()=>this.zoomAt(this.zoom*1.18)],['pan','Pan',()=>{this.panMode=!this.panMode;this.updateControls()}],['reset','Về giữa',()=>this.reset()]]){
      const b=document.createElement('button');b.type='button';b.className='btn';b.dataset.cameraAction=name;
      b.setAttribute('aria-label',{'zoom-out':'Thu nhỏ map','zoom-in':'Phóng to map',pan:'Bật chế độ kéo map',reset:'Về góc nhìn mặc định'}[name]);
      b.textContent=label;b.onclick=action;controls.appendChild(b);
    }
    const hint=document.createElement('small');hint.textContent='Con lăn: zoom · Kéo vùng trống / chuột giữa: pan';controls.appendChild(hint);stage.appendChild(controls);this.controls=controls;
    stage.addEventListener('wheel',e=>{
      if(!this.enabled||this.isUI(e.target))return;
      e.preventDefault();const r=stage.getBoundingClientRect();
      this.zoomAt(this.zoom*Math.exp(-e.deltaY*.0015),e.clientX-r.left,e.clientY-r.top);
    },{passive:false});
    stage.addEventListener('pointerdown',e=>{
      if(!this.enabled||this.isUI(e.target)||!(e.button===0||e.button===1))return;
      const force=this.panMode||e.button===1;
      if(!force&&e.target.closest('.unit'))return;
      this.drag={id:e.pointerId,x:e.clientX,y:e.clientY,px:this.panX,py:this.panY,active:force};
      if(force){e.preventDefault();e.stopImmediatePropagation();stage.setPointerCapture(e.pointerId);stage.classList.add('cameraDragging')}
    },true);
    stage.addEventListener('pointermove',e=>{
      const d=this.drag;if(!d||d.id!==e.pointerId)return;
      if(!d.active&&Math.hypot(e.clientX-d.x,e.clientY-d.y)>6){d.active=true;stage.setPointerCapture(e.pointerId);stage.classList.add('cameraDragging')}
      if(!d.active)return;
      e.preventDefault();e.stopImmediatePropagation();this.panX=d.px+e.clientX-d.x;this.panY=d.py+e.clientY-d.y;this.clampPan();this.apply();
    },true);
    const finish=e=>{
      if(!this.drag||this.drag.id!==e.pointerId)return;
      if(this.drag.active){this.suppressUntil=Date.now()+300;e.preventDefault();e.stopImmediatePropagation()}
      if(stage.hasPointerCapture?.(e.pointerId))stage.releasePointerCapture(e.pointerId);
      this.drag=null;stage.classList.remove('cameraDragging');
    };
    stage.addEventListener('pointerup',finish,true);stage.addEventListener('pointercancel',finish,true);
    stage.addEventListener('click',e=>{
      if(!this.isUI(e.target)&&Date.now()<this.suppressUntil){e.preventDefault();e.stopImmediatePropagation()}
    },true);
  },
  isUI(target){return !!target.closest('button,select,input,details,.unitMenu,.deployMenu,.attackPopup,.defensePopup,.skillTargetPanel,.guardTargetHint,.reaction,.duelCameraControls')},
  resize(width,height){
    const id=S.matchSession?.matchId||null;
    if(id!==this.matchId){this.matchId=id;this.zoom=1.4;this.panX=this.panY=0;this.reactionKey=null;this.panMode=false}
    this.enabled=true;this.width=width;this.height=height;this.base=Math.max(1,Math.min(width,height));
    this.stage.classList.add('cameraEnabled');this.clampPan();this.apply();
    const p=S.pending,key=p?(p.a+':'+p.d+':'+(p.replacementTargetId||p.guardUnitId||'')):null;
    if(key&&key!==this.reactionKey){
      const id=p.replacementTargetId||(!p.ignoreGuard&&p.guardUnitId)||p.d;
      const unit=S.units.find(u=>u.id===id),cell=unit&&cells.find(c=>c.q===unit.q&&c.r===unit.r);
      if(cell)this.ensureVisible(cell);
    }
    this.reactionKey=key;
  },
  disable(){
    this.enabled=false;if(!this.scene)return;
    this.stage.classList.remove('cameraEnabled','cameraPanMode','cameraDragging');this.drag=null;
    this.scene.style.width=this.scene.style.height='100%';this.scene.style.transform='none';
    for(const popup of this.popups.keys())popup.classList.remove('cameraAnchored');
  },
  point(x,y){const size=this.base*this.zoom;return{x:this.width/2+this.panX+(x/1000-.5)*size,y:this.height/2+this.panY+(y/1000-.5)*size}},
  zoomAt(next,x=this.width/2,y=this.height/2){
    const z=Math.max(this.minZoom,Math.min(this.maxZoom,next)),ratio=z/this.zoom;
    this.panX=x-this.width/2-(x-this.width/2-this.panX)*ratio;
    this.panY=y-this.height/2-(y-this.height/2-this.panY)*ratio;
    this.zoom=z;this.clampPan();this.apply();
  },
  clampPan(){const limit=this.base*this.zoom*.55;this.panX=Math.max(-limit,Math.min(limit,this.panX));this.panY=Math.max(-limit,Math.min(limit,this.panY))},
  reset(){this.zoom=1.4;this.panX=this.panY=0;this.panMode=false;this.apply()},
  ensureVisible(cell){
    const p=this.point(cell.x,cell.y),margin=Math.min(140,this.height*.25);
    if(p.x<margin)this.panX+=margin-p.x;else if(p.x>this.width-margin)this.panX+=this.width-margin-p.x;
    if(p.y<margin)this.panY+=margin-p.y;else if(p.y>this.height-margin)this.panY+=this.height-margin-p.y;
    this.clampPan();this.apply();
  },
  apply(){
    if(!this.enabled||!this.scene)return;
    this.scene.style.width=this.scene.style.height=this.base+'px';
    this.scene.style.transform='translate('+(this.width/2-this.base*this.zoom/2+this.panX)+'px,'+(this.height/2-this.base*this.zoom/2+this.panY)+'px) scale('+this.zoom+')';
    this.updateControls();for(const [popup,cell] of this.popups)if(popup.classList.contains('show'))this.placePopup(popup,cell);
  },
  updateControls(){
    if(!this.controls)return;
    this.stage.classList.toggle('cameraPanMode',this.panMode);
    const pan=this.controls.querySelector('[data-camera-action="pan"]');pan.setAttribute('aria-pressed',String(this.panMode));
    this.controls.querySelector('[data-camera-action="zoom-in"]').disabled=this.zoom>=this.maxZoom;
    this.controls.querySelector('[data-camera-action="zoom-out"]').disabled=this.zoom<=this.minZoom;
    this.controls.dataset.zoom=Math.round(this.zoom*100)+'%';
  },
  placePopup(popup,cell){
    if(!this.enabled)return;
    popup.classList.remove('below','left','right');popup.classList.add('show','cameraAnchored');this.popups.set(popup,cell);
    const p=this.point(cell.x,cell.y),w=popup.offsetWidth,h=popup.offsetHeight;
    const x=Math.max(8,Math.min(this.width-w-8,p.x-w/2));
    const top=p.y-h-42,y=Math.max(8,Math.min(this.height-h-8,top>=8?top:p.y+42));
    popup.style.left=x+'px';popup.style.top=y+'px';
  }
};
