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
  const skillArt = Object.freeze({
    SKILL_HERO_KAZU_S1: 'shield',
    SKILL_HERO_KAZU_S2: 'chain',
    SKILL_HERO_KAZU_S3: 'dragon'
  });
  function skillIcons() {
    for (const node of document.querySelectorAll('[data-skill-id]')) {
      const key = skillArt[node.dataset.skillId];
      if (!key || node.querySelector(':scope > .dwSkillIcon')) continue;
      const image = document.createElement('img');
      image.className = 'dwSkillIcon'; image.alt = ''; image.setAttribute('aria-hidden','true');
      image.draggable = false; image.width = 1254; image.height = 1254;
      image.src = prefix + 'assets/skills/kazu-dw-style-01/' + key + '.webp';
      node.prepend(image);
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
  function update() {
    for (const brand of document.querySelectorAll('.brand')) add(brand,'logo','dwPackLogo');
    if (!document.querySelector('.dwSceneLeft')) {
      document.body.prepend(pack.sprite('sceneLeft','dwSceneLeft'),pack.sprite('sceneRight','dwSceneRight'));
    }
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
  const decorative = node => node.nodeType === 1 && (node.matches('.dwPackPiece,.dwAtlasSkin,.dwAtlasCrest,.dwTrainingPreview') || node.closest('.dwTrainingPreview'));
  new MutationObserver(records => {
    if (scheduled || !records.some(record => record.type === 'attributes' || [...record.addedNodes,...record.removedNodes].some(node => !decorative(node)))) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; update(); });
  }).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['open']});
  document.addEventListener('change', event => { if (event.target.closest('.trainingDialog')) update(); });
  update();
  return { update };
})();
