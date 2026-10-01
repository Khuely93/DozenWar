// Presentation-only fit: the board and SVG share one square coordinate frame.
const DuelBoardLayout = {
  frame:null,
  fit(){
    const board=CoreDOM.board.wrap;
    if(!board)return;
    const desktop=window.innerWidth>=900;
    const active=S.selectedMode==='MODE_DUEL_001'&&(S.phase==='deploy'||S.phase==='battle');
    if(!desktop||!active){board.style.removeProperty('width');return}
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
