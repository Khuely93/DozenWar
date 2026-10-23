/* Presentation only. Native controls retain their original handlers. */
window.DWPackUI = (() => {
  const pack = window.DWUIPack;
  const prefix = document.body.classList.contains('dwOnline') ? '../' : './';
  const add = (host, key, className, prepend = true) => {
    if (!host || host.querySelector(':scope > .' + className)) return;
    const node = pack.sprite(key,className);
    if (prepend) host.prepend(node); else host.append(node);
  };
  // Skill identity, independent of translated labels and button ordering.
  function skillIcons() {
    for (const node of document.querySelectorAll('[data-skill-id]')) {
      const id = node.dataset.skillId, art = window.HeroSkillVisuals?.skills[id];
      const existing = node.querySelector(':scope > .dwSkillIcon');
      if (!art) { existing?.remove(); continue; }
      if (existing?.dataset.art === id) continue;
      existing?.remove();
      const [x, y, width, height] = art.frame;
      const frame = document.createElement('span');
      frame.className = 'dwSkillIcon dwFramedSkillIcon'; frame.dataset.art = id;
      frame.setAttribute('aria-hidden','true'); frame.style.aspectRatio = width + ' / ' + height;
      // Fit both dimensions in the allotted icon size without stretching the art.
      frame.style.setProperty('--dw-skill-scale',Math.min(1,width / height));
      const image = document.createElement('img'); image.alt = ''; image.draggable = false;
      image.src = prefix + art.source;
      image.style.cssText = 'position:absolute;max-width:none;width:' + art.width / width * 100 + '%;height:' + art.height / height * 100 + '%;left:' + -x / width * 100 + '%;top:' + -y / height * 100 + '%;margin:0;border:0;';
      frame.append(image); node.prepend(frame);
    }
  }
  function trainingPreview(dialog) {
    const choice = dialog.querySelector('select[aria-label="Hero hoặc lính"],select[aria-label="Trang bị"]');
    if (!choice || typeof ContentViews === 'undefined') return;
    let preview = dialog.querySelector('.dwTrainingPreview');
    if (!preview) { preview = document.createElement('figure'); preview.className = 'dwTrainingPreview'; dialog.append(preview); }
    const id = choice.value;
    if (preview.dataset.id === id) return;
    preview.dataset.id = id;
    const definition = ContentViews.hero(id) || ContentViews.unit(id) || ContentViews.equipment(id);
    const asset = definition?.assets?.portrait || definition?.assets?.art;
    const source = asset && AssetResolver.source(asset);
    preview.replaceChildren();
    if (source) { const image = document.createElement('img'); image.src = source; image.alt = definition.name; preview.append(image); }
    const caption = document.createElement('figcaption'); caption.textContent = definition?.name || choice.selectedOptions[0]?.textContent || '';
    preview.append(caption); dialog.classList.add('dwTrainingPreviewLayout');
  }
  // The turn clock can grow to two lines during defense. Keep action status
  // in the same flowing stack instead of pinning it over that second line.
  let notices, defenseChoices;
  function battleNotices() {
    const stage = document.querySelector('.duelMapStage');
    if (!stage) return;
    if (!notices) {
      notices = document.createElement('div'); notices.className = 'dwBattleNotices';
      stage.prepend(notices);
      new ResizeObserver(() => {
        stage.style.setProperty('--dw-notices-height', Math.ceil(notices.getBoundingClientRect().height) + 'px');
      }).observe(notices);
    }
    for (const node of document.querySelectorAll('.duelTimers,.combatFlowStatus,.directFlowWarning,.aiThinking,.guardTargetHint')) {
      if (node.parentElement !== notices) notices.append(node);
    }
    const board = stage.querySelector('.boardWrap');
    if (board && !defenseChoices) {
      defenseChoices = document.createElement('div'); defenseChoices.className = 'dwDefenseChoices';
      board.append(defenseChoices);
    }
    for (const node of document.querySelectorAll('.heroDefenseBar,.directDefensePanel')) {
      if (defenseChoices && node.parentElement !== defenseChoices) defenseChoices.append(node);
    }
    // On a short landscape viewport the skill chooser extends beside the map.
    // Hoist it out of the map's clipping context so its final buttons stay usable.
    const chooser = document.querySelector('.heroSkillPanel');
    const parent = innerWidth < 900 && innerHeight <= 500 ? document.getElementById('gameScreen') : board;
    if (chooser && parent && chooser.parentElement !== parent) parent.append(chooser);
  }
  function update() {
    battleNotices();
    for (const brand of document.querySelectorAll('.brand')) add(brand,'logo','dwPackLogo');
    const cards = document.querySelectorAll('.playHubCard');
    ['ai','casual','ranked'].forEach((key,i) => add(cards[i],key,'dwHubIllustration'));
    for (const tab of document.querySelectorAll('.dwDockTab')) {
      const key = tab.dataset.tab || tab.dataset.onlineTab;
      if (key) add(tab,{hero:'tabHero',skills:'tabSkills',cards:'tabCards'}[key],'dwTabIcon');
    }
    skillIcons();
    for (const title of document.querySelectorAll('.gameOverTitle,.onlineResult > h2')) {
      const text = title.textContent;
      const key = /HÒA|Hòa/.test(text) ? 'draw' : /THẤT|Thất|Thua|THUA/.test(text) ? 'lose' : 'win';
      const existing = title.querySelector('.dwResultCrown');
      if (existing?.dataset.outcome === key) continue;
      existing?.remove();
      const crown = pack.sprite(key,'dwResultCrown'); crown.dataset.outcome = key; title.prepend(crown);
    }
    for (const dialog of document.querySelectorAll('.trainingDialog[open]:not(.dwConfirmDialog)')) trainingPreview(dialog);
    const room = document.querySelector('.dwOnline #room[data-phase="ready"] #setup');
    if (room && !room.querySelector('.dwRoomPreview')) {
      const image = document.createElement('img'); image.className = 'dwRoomPreview'; image.src = prefix + 'assets/map-gallery/map-compact-dw-style-01.webp'; image.alt = 'Chiến trường Đối Đầu'; room.append(image);
    }
    for (const button of document.querySelectorAll('.heroSkillPanel > .btn')) {
      const text = button.textContent.trim();
      const numeric = /^(✓\s*)?[1-6]$/.test(text);
      if (numeric) {
        const selected = text.startsWith('✓'); button.setAttribute('aria-pressed',String(selected)); button.classList.toggle('gold',selected);
      } else if (text === 'XÁC NHẬN') button.classList.add('gold');
    }
    for (const list of document.querySelectorAll('.troopList')) {
      for (const row of list.querySelectorAll(':scope > .choice')) {
        const kind = row.querySelector('[data-k]')?.dataset.k;
        const symbol = row.querySelector('.sym');
        if (!kind || !symbol || symbol.querySelector('img')) continue;
        const image = document.createElement('img'); image.src = prefix + 'assets/troops-compact-dw-style-01/' + kind + '-blue.webp'; image.alt = ''; symbol.replaceChildren(image);
      }
    }
  }
  let scheduled = false;
  const decorative = node => node.nodeType === 1 && (node.matches('.dwPackPiece,.dwPngSkin,.dwPngCrest,.dwTrainingPreview') || node.closest('.dwTrainingPreview'));
  new MutationObserver(records => {
    if (scheduled || !records.some(record => record.type === 'attributes' || [...record.addedNodes,...record.removedNodes].some(node => !decorative(node)))) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; update(); });
  }).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['open']});
  document.addEventListener('change', event => { if (event.target.closest('.trainingDialog')) update(); });
  window.addEventListener('resize', update);
  update();
  return { update };
})();
