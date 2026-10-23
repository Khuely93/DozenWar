// Measure rendered text, rather than inferring fit from element scrollWidth.
// Scrollable lists, covered modal backgrounds and SVG board labels are excluded.
async function inspectText(page) {
  return page.evaluate(() => {
    const rect = r => ({left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height});
    const label = n => n.id ? '#'+n.id : n.localName+'.'+[...n.classList].join('.');
    const modal = document.querySelector('dialog[open]') || document.querySelector('.defenseFeedback:not([hidden])') || document.querySelector('.dwMatchMenu[open] .dwGameMenu') || document.querySelector('.hubOverlay.show,.modeConfirmOverlay.show,.gameOverOverlay.show');
    const root = modal || document.body;
    const walker = document.createTreeWalker(root,NodeFilter.SHOW_TEXT), texts=[], issues=[];
    let node;
    while ((node=walker.nextNode())) {
      const p=node.parentElement, raw=node.textContent, text=raw.trim();
      if (!text || p.namespaceURI!=='http://www.w3.org/1999/xhtml' || p.closest('script,style,option,textarea,.dwPngSkin,.dwPngCrest,.dwPackPiece')) continue;
      const s=getComputedStyle(p);
      if (!p.checkVisibility({checkOpacity:true,checkVisibilityCSS:true}) || parseFloat(s.fontSize)<1 || s.color==='rgba(0, 0, 0, 0)' || s.webkitTextFillColor==='rgba(0, 0, 0, 0)') continue;
      const range=document.createRange();range.setStart(node,raw.indexOf(text));range.setEnd(node,raw.indexOf(text)+text.length);
      const control=p.closest('button,a.btn,summary,input,label');
      for (const r of range.getClientRects()) {
        if (r.width<1||r.height<1) continue;
        let clip={left:0,top:0,right:innerWidth,bottom:innerHeight}, scrolled=false;
        for(let a=p;a&&a!==document.body;a=a.parentElement){
          const cs=getComputedStyle(a),b=a.getBoundingClientRect();
          if (/auto|scroll/.test(cs.overflowY) && a.scrollHeight>a.clientHeight+1) scrolled=true;
          if (/hidden|clip|auto|scroll/.test(cs.overflowX)) {clip.left=Math.max(clip.left,b.left);clip.right=Math.min(clip.right,b.right);}
          if (/hidden|clip|auto|scroll/.test(cs.overflowY)) {clip.top=Math.max(clip.top,b.top);clip.bottom=Math.min(clip.bottom,b.bottom);}
        }
        const visible={left:Math.max(r.left,clip.left),top:Math.max(r.top,clip.top),right:Math.min(r.right,clip.right),bottom:Math.min(r.bottom,clip.bottom)};
        if(visible.right-visible.left<2||visible.bottom-visible.top<2)continue;
        const hit=document.elementFromPoint((visible.left+visible.right)/2,(visible.top+visible.bottom)/2);
        // Popups and intentional floating notices cover the board below them.
        if(hit && hit!==p&&!p.contains(hit)&&!hit.contains(p) && !hit.closest('button,a.btn'))continue;
        const entry={node:p,text:text.slice(0,100),selector:label(p),bounds:{...visible,width:visible.right-visible.left,height:visible.bottom-visible.top},control:control&&label(control)};
        texts.push(entry);
        if(control && !scrolled && s.textOverflow!=='ellipsis'){
          const b=control.getBoundingClientRect();
          if(r.left<b.left-2||r.right>b.right+2||r.top<b.top-2||r.bottom>b.bottom+2)issues.push({type:'control-text-overflow',text:entry.text,selector:label(control),textBounds:entry.bounds,controlBounds:rect(b)});
        }
      }
    }
    for(let i=0;i<texts.length;i++)for(let j=i+1;j<texts.length;j++){
      const a=texts[i],b=texts[j];
      if(a.node===b.node)continue;
      const w=Math.min(a.bounds.right,b.bounds.right)-Math.max(a.bounds.left,b.bounds.left),h=Math.min(a.bounds.bottom,b.bounds.bottom)-Math.max(a.bounds.top,b.bounds.top);
      // Font bounding boxes can share a one-pixel descender/diacritic edge.
      if(w>3&&h>3)issues.push({type:'text-overlap',a:{text:a.text,selector:a.selector,bounds:a.bounds},b:{text:b.text,selector:b.selector,bounds:b.bounds},intersection:{width:w,height:h}});
    }
    const controls=[...root.querySelectorAll('button,a.btn,.dwDockTab')].filter(n=>n.checkVisibility({checkVisibilityCSS:true,checkOpacity:true})&&n.getBoundingClientRect().width>0);
    for(const button of controls){
      if(button.disabled||!button.closest('.heroSkillPanel,.dwDefenseChoices,.dwGameMenu,.dwDeploymentTray'))continue;
      const b=button.getBoundingClientRect(),x=(b.left+b.right)/2,y=(b.top+b.bottom)/2;
      let scrollable=false;for(let a=button.parentElement;a&&a!==root;a=a.parentElement){const s=getComputedStyle(a);if(/auto|scroll/.test(s.overflowY)&&a.scrollHeight>a.clientHeight+2)scrollable=true;}
      if(scrollable||x<0||x>innerWidth||y<0||y>innerHeight)continue;
      const hit=document.elementFromPoint(x,y);
      if(hit&&!button.contains(hit)&&!hit.contains(button))issues.push({type:'covered-action',text:button.textContent.trim().slice(0,80),selector:label(button),coveredBy:label(hit)});
    }
    const decoration=[];
    for(const host of root.querySelectorAll('.dwConceptArt')){
      if(!host.checkVisibility({checkVisibilityCSS:true})||!host.getBoundingClientRect().width)continue;
      const skins=[...host.querySelectorAll(':scope > .dwPngSkin')].filter(n=>getComputedStyle(n).display!=='none');
      if(skins.length!==1)decoration.push({selector:label(host),visibleSkins:skins.length,kind:host.dataset.dwArtwork});
    }
    const layers=[];
    const visible=n=>n&&n.checkVisibility({checkOpacity:true,checkVisibilityCSS:true})&&n.getBoundingClientRect().width>0;
    const pairs=[['.duelTimers','.combatFlowStatus'],['.duelTimers','.directFlowWarning'],['.duelTimers','.aiThinking'],['.duelTimers','.guardTargetHint'],['.heroSkillPanel','.combatFlowStatus'],['.heroSkillPanel','.duelTimers'],['.directDefensePanel','.duelMatchDetails'],['.heroSkillPanel','.duelMatchDetails']];
    if(!modal)for(const [a,b] of pairs){const x=document.querySelector(a),y=document.querySelector(b);if(!visible(x)||!visible(y))continue;const r=x.getBoundingClientRect(),s=y.getBoundingClientRect();if(Math.min(r.right,s.right)-Math.max(r.left,s.left)>2&&Math.min(r.bottom,s.bottom)-Math.max(r.top,s.top)>2)layers.push({a,b,aBounds:rect(r),bBounds:rect(s)});}
    return {textLines:texts.length,controls:controls.length,issues,decoration,layers,overflowX:document.documentElement.scrollWidth>innerWidth+1};
  });
}
module.exports={inspectText};
