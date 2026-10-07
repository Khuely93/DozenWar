/* Hero targeting is displayed as a reviewable selection; map clicks and buttons share Core validation. */
const HeroSkillUI={
  panel:document.createElement('section'),bar:document.createElement('div'),
  button(text,action,disabled=false){const b=document.createElement('button');b.type='button';b.className='btn';b.textContent=text;b.disabled=disabled;b.onclick=action;return b},
  render(){
    this.panel.replaceChildren();const s=HeroCore.selection;this.panel.hidden=!s;
    if(s){const title=document.createElement('h3');title.textContent=unitSpec(s.h).name+' · '+s.sk.name+' · '+'★'.repeat(s.sk.star||0);this.panel.append(title);
      const desc=document.createElement('p');desc.textContent=s.sk.description||s.sk.name;this.panel.append(desc);
      if(HeroCore.notice){const note=document.createElement('p');note.textContent=HeroCore.notice;this.panel.append(note)}
      const m=s.sk.mechanic;
      if(['MORPH','CONVERT','SUMMON'].includes(m)&&!s.sk.parameters?.summonClass){const select=document.createElement('select');select.setAttribute('aria-label','Chủng lính');for(const d of HeroCore.troopDefs())select.add(new Option(ContentViews.unit(d.id).name,d.id));select.value=s.kind;select.onchange=()=>s.kind=select.value;this.panel.append(select)}
      if(m==='COPY'){const select=document.createElement('select');select.setAttribute('aria-label','Skill sao chép');select.add(new Option('Chọn skill đã dùng',''));for(const k of HeroCore.copyChoices(s.h))select.add(new Option(k.name+' · '+'★'.repeat(Math.min(k.star||0,3)),k.id));select.value=s.copyId||'';select.onchange=()=>s.copyId=select.value;this.panel.append(select)}
      if(m==='DICE_WARD'){const label=document.createElement('p');label.textContent='Chọn hai số khác nhau:';this.panel.append(label);for(let i=1;i<=6;i++)this.panel.append(this.button((s.dice.includes(i)?'✓ ':'')+i,()=>{if(s.dice.includes(i))s.dice=s.dice.filter(n=>n!==i);else if(s.dice.length<2)s.dice.push(i);this.render()}))}
      if(['ESCAPE','SUMMON'].includes(m)){const hint=document.createElement('p');hint.textContent='Chọn hex đích trên map hoặc trong danh sách:';this.panel.append(hint);const list=document.createElement('div');list.className='heroTargetList';const options=m==='ESCAPE'?HeroCore.escapeCells(s.h,s.sk):cells.filter(c=>distU(s.h,c)===1&&HeroCore.cellAllowed({side:s.h.side,hero:false,id:null},c));for(const c of options)list.append(this.button((s.cell?.q===c.q&&s.cell?.r===c.r?'✓ ':'')+'Hex '+c.q+','+c.r,()=>HeroCore.selectCell(c)));this.panel.append(list)}
      else if(!['MORPH','COPY','DICE_WARD'].includes(m)){const list=document.createElement('div');list.className='heroTargetList';for(const u of HeroCore.targets(s.h,s.sk))list.append(this.button((s.selected.includes(u.id)?'✓ ':'')+unitSpec(u).name+' · HP '+u.hp+' · '+u.q+','+u.r,()=>HeroCore.select(u)));this.panel.append(list)}
      const defense=s.h.side!==S.battleSide,cards=s.continuation&&S.heroSequence?[]:(S.hands[s.h.side]||[]).filter(c=>validCardFor(c,s.h,defense?'def':'atk'));
      if(cards.length){const select=document.createElement('select');select.setAttribute('aria-label','Trang bị kết hợp');select.add(new Option('Không dùng trang bị',''));for(const c of cards)select.add(new Option(c.name+' · '+'★'.repeat(c.star),c.uid));select.value=s.cardUid||'';select.onchange=()=>{s.cardUid=select.value||null;this.render()};this.panel.append(select)}
      this.panel.append(this.button('XÁC NHẬN',()=>HeroCore.commit(),m==='DICE_WARD'&&s.dice.length!==2),this.button('HỦY',()=>HeroCore.cancel(),!!s.continuation&&!!S.heroSequence));
    }
    this.bar.replaceChildren();this.bar.hidden=S.phase!=='battle'||S.matchEnded||!!s;
    if(!this.bar.hidden){for(const h of S.units.filter(u=>u.hero&&u.hp>0&&u.side!==S.battleSide&&u.side!==S.botSide))for(let n=1;n<=3;n++){const sk=heroSkill(h,n);if(sk?.mechanic&&HeroCore.canUse(h,n,sk))this.bar.append(this.button('🛡️ '+unitSpec(h).name+' · '+sk.name,()=>HeroCore.begin(h,n)))}}
  }
};
HeroSkillUI.panel.className='heroSkillPanel';HeroSkillUI.panel.hidden=true;HeroSkillUI.panel.setAttribute('aria-label','Chọn skill Hero');HeroSkillUI.bar.className='heroDefenseBar';CoreDOM.board.wrap.append(HeroSkillUI.panel,HeroSkillUI.bar);
const _heroUIUpdate=updateUI;
updateUI=function(){const result=_heroUIUpdate();HeroSkillUI.render();if(HeroCore.selection)mainBtn.disabled=true;undoBtn.disabled=!!(HeroCore.selection||S.pending||S.heroSequence||S.matchEnded);return result};
const _heroRenderSkills=renderSkills;
renderSkills=function(){if(!S.selected?.hero)return _heroRenderSkills();skillBar.replaceChildren();for(let n=1;n<=3;n++){const h=S.selected,sk=heroSkill(h,n);if(!sk)continue;const b=HeroSkillUI.button(sk.name+' · '+'★'.repeat(sk.star||0)+' · '+(sk.timing==='BOTH'?'⚔️🛡️':sk.timing==='DEFENSE_REACTION'?'🛡️':'⚔️')+(sk.heroAttack?' 👊':''),()=>HeroCore.begin(h,n),!HeroCore.canUse(h,n,sk));b.title=sk.description;skillBar.append(b)}};
const _heroPopup=showDefensePopup;
showDefensePopup=function(d){if(HeroCore.selection)return;const result=_heroPopup(d);if(HeroCore.blocked(d,'defense'))defGuardChoice.disabled=true;return result};
defHeroSkillChoice.onclick=()=>{if(!S.pending)return;const d=S.units.find(u=>u.id===S.pending.d);defCardList.replaceChildren();for(const c of defenseSkillChoices(d))defCardList.append(HeroSkillUI.button(unitSpec(c.hero).name+' · '+c.skill.name,()=>HeroCore.begin(c.hero,c.skillNo)));defCardList.classList.add('show')};
atkSkillBtn.onclick=()=>{if(!S.selected?.hero)return;atkSkillList.replaceChildren();for(let n=1;n<=3;n++){const h=S.selected,sk=heroSkill(h,n);atkSkillList.append(HeroSkillUI.button(sk.name+' · '+'★'.repeat(sk.star||0),()=>{hideAttackPopup();HeroCore.begin(h,n)},!HeroCore.canUse(h,n,sk)))}atkSkillList.classList.toggle('show')};
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&HeroCore.selection)HeroCore.cancel()});
CoreBoardRenderer.registerLayer('HERO_SKILL_STATE',45,{
  hexClasses(c,u){const s=HeroCore.selection;if(!s)return '';if(u&&HeroCore.candidate(s.h,s.sk,u))return s.selected.includes(u.id)?' skill-selected':' skill-valid';if(!u&&['ESCAPE','SUMMON'].includes(s.sk.mechanic)){const valid=s.sk.mechanic==='ESCAPE'?HeroCore.escapeCells(s.h,s.sk).some(x=>x.q===c.q&&x.r===c.r):distU(s.h,c)===1&&HeroCore.cellAllowed({side:s.h.side,hero:false,id:null},c);if(valid)return ' hl'}return ''},
  renderAfterUnit(g,u,c){const statuses=HeroCore.statuses(u);if(!statuses.length&&!u.morphDefinitionId)return;const text=document.createElementNS('http://www.w3.org/2000/svg','text');text.setAttribute('x',c.x);text.setAttribute('y',c.y-40);text.setAttribute('class','buffTag');text.textContent=[...statuses.map(s=>({STUN:'STUN',ROOT:'TRÓI',FREEZE:'BĂNG',SILENCE:'CÂM'})[s.kind]),u.morphDefinitionId?'BIẾN HÌNH':''].filter(Boolean).join(' · ');g.appendChild(text)}
});

const _heroUndo=undo;
undo=function(){if(HeroCore.selection||S.pending||S.heroSequence||S.matchEnded)return false;return _heroUndo()};
undoBtn.onclick=()=>undo();
