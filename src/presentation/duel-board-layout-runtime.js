// Presentation-only fit: the board and SVG share one square coordinate frame.
const DuelBoardLayout = {
  frame:null,
  mounted:false,
  mount(){
    if(this.mounted||typeof document==='undefined')return;
    const screen=document.getElementById('gameScreen'),board=CoreDOM.board.wrap;
    if(!screen||!board)return;
    const stage=document.createElement('div');stage.className='duelMapStage';
    board.before(stage);stage.appendChild(board);
    const dock=document.createElement('div');dock.className='duelControlDock';dock.setAttribute('aria-label','Điều khiển Hero, Skill và Card');
    screen.appendChild(dock);
    for(const [id,cls,title] of [['unitPanel','dockHero','ĐƠN VỊ ĐANG CHỌN'],['skillBar','dockSkills','HERO SKILLS'],['handBar','dockCards','TRANG BỊ']]){
      const node=document.getElementById(id),box=id==='unitPanel'?node:node.closest('.box');
      box.classList.add(cls);box.querySelector('h3').textContent=title;dock.appendChild(box);
    }
    const portrait=document.createElement('div');portrait.className='dockPortrait';portrait.setAttribute('aria-hidden','true');
    document.getElementById('unitInfo').before(portrait);this.portrait=portrait;
    const info=document.createElement('details');info.className='duelMatchDetails';
    const label=document.createElement('summary');label.textContent='Thông tin trận / Combat log';info.appendChild(label);
    info.appendChild(document.getElementById('summary').closest('.box'));
    info.appendChild(document.getElementById('log').closest('.box'));stage.appendChild(info);
    stage.appendChild(document.getElementById('reactionBox'));
    this.stage=stage;this.mounted=true;
  },
  dockHeight(viewportHeight){return Math.round(Math.max(190,Math.min(260,190+(viewportHeight-768)*70/312)))},
  fit(){
    const board=CoreDOM.board.wrap;
    if(!board)return;
    this.mount();
    const desktop=window.innerWidth>=900;
    const active=S.selectedMode==='MODE_DUEL_001'&&(S.phase==='deploy'||S.phase==='battle');
    if(typeof document!=='undefined'){
      document.body.classList.toggle('duelDesktopLayout',desktop&&active);
      if(this.portrait)this.portrait.textContent=S.selected?unitSpec(S.selected).sym:'♟';
      document.documentElement.style.setProperty('--duel-dock-height',this.dockHeight(window.innerHeight)+'px');
    }
    if(!desktop||!active){board.style.removeProperty('width');return}
    if(this.stage){
      const bounds=this.stage.getBoundingClientRect();
      board.style.width=Math.floor(Math.max(0,Math.min(bounds.width,bounds.height)))+'px';
      return;
    }
    const parent=board.parentElement;
    if(!parent||!parent.clientWidth)return;
    // Use document position so scrolling never enlarges or shrinks the board.
    const top=board.getBoundingClientRect().top+(window.scrollY||0);
    const availableHeight=window.innerHeight-top-24;
    if(availableHeight<=0){board.style.removeProperty('width');return}
    board.style.width=Math.floor(Math.min(parent.clientWidth,availableHeight))+'px';
  },
  schedule(){
    if(this.frame!==null)return;
    this.frame=requestAnimationFrame(()=>{this.frame=null;this.fit()});
  }
};
window.addEventListener('resize',()=>DuelBoardLayout.schedule());
if(typeof ResizeObserver!=='undefined'){
  const observer=new ResizeObserver(()=>DuelBoardLayout.schedule());
  observer.observe(CoreDOM.board.wrap.parentElement);
}
// Called by the authoritative renderer after deployment/turn state changes.
DuelBoardLayout.schedule();
