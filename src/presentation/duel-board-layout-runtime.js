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
  decorateSkills(){
    if(!this.mounted)return;
    document.querySelectorAll('#skillBar button').forEach((button,i)=>{
      const actor=S.units?.find(u=>String(u.id)===button.dataset?.heroId)||S.selected;if(!actor?.hero)return;
      const skill=ContentViews.skill(unitSpec(actor).skillIds[(Number(button.dataset?.skillNo)||i+1)-1]);if(!skill)return;
      if(!button.title)button.title=skill.description;
      button.setAttribute('aria-label',skill.name+' · '+button.title);
      const title=document.createElement('strong');title.textContent=skill.name;
      const stars=document.createElement('span');stars.className='dockSkillStars';stars.textContent='★'.repeat(skill.star||0);
      const timing=document.createElement('small');timing.textContent=skill.timing==='BOTH'?'CÔNG / THỦ':skill.timing==='DEFENSE_REACTION'?'PHÒNG THỦ':'CHỦ ĐỘNG';
      const target=document.createElement('small');target.textContent=S.skillTarget?.skillNo===i+1?'ĐANG CHỌN MỤC TIÊU':'';
      button.replaceChildren(title,stars,timing,target);
    });
  },
  dockHeight(viewportHeight){return Math.round(Math.max(190,Math.min(260,190+(viewportHeight-768)*70/312)))},
  fit(){
    const board=CoreDOM.board.wrap;
    if(!board)return;
    this.mount();
    // Background and hit cells are presentation-only and scoped to 1vs1.
    const cleanDuel=S.selectedMode==='MODE_DUEL_001'||typeof DW_MODES!=='undefined'&&DW_MODES.get(S.selectedMode)?.mapPolicy?.mapId==='MAP_DUEL_001';
    CoreDOM.board.svg?.classList?.toggle('duelCleanMap',cleanDuel);
    const img=board.querySelector?.('.boardBg');
    if(img){
      if(!img.dataset.defaultSrc)img.dataset.defaultSrc=img.getAttribute('src');
      const src=cleanDuel?img.dataset.duelSrc:img.dataset.defaultSrc;
      if(src&&img.getAttribute('src')!==src)img.setAttribute('src',src);
      const backdrop=board.querySelector('.duelMapBackdrop');
      if(backdrop&&src)backdrop.style.backgroundImage='url("'+src+'")';
    }
    const desktop=window.innerWidth>=900;
    const active=cleanDuel&&(S.phase==='deploy'||S.phase==='battle');
    if(typeof document!=='undefined'){
      document.body.classList.toggle('duelDesktopLayout',desktop&&active);
      if(this.portrait){const hero=typeof HeroSkillUI!=='undefined'?HeroSkillUI.actor():S.selected;this.portrait.textContent=hero?unitSpec(hero).sym:'♟';}
      if(desktop&&active)this.decorateSkills();
      document.documentElement.style.setProperty('--duel-dock-height',this.dockHeight(window.innerHeight)+'px');
    }
    if(!desktop||!active){board.style.removeProperty('width');if(typeof DuelCamera!=='undefined')DuelCamera.disable();return}
    if(this.stage){
      const bounds=this.stage.getBoundingClientRect();
      if(typeof DuelCamera!=='undefined'){board.style.width='100%';DuelCamera.mount(this.stage,board);DuelCamera.resize(bounds.width,bounds.height)}
      else board.style.width=Math.floor(Math.max(0,Math.min(bounds.width,bounds.height)))+'px';
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

