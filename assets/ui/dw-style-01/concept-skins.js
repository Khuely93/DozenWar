/* Nine-slice each isolated RGBA PNG. Labels and game data remain live HTML. */
(() => {
  const buttonsSelector = '.btn:not(.skill),.dwDockTab';
  const panels = '.modeWrap,.playHubWrap,.readyWrap,.diceWrap,.selectWrap,.dealWrap,.modeCard,.playHubCard,.box,.readyCard,.dieBox,.hubPopup,.modeConfirmPopup,.gameOverPopup,.combatEquipmentDialog,.trainingDialog,.heroSkillPanel,.skillTargetPanel,.defensePopup,.attackPopup,.unitMenu,.deployMenu,.directDefensePanel,.dwDeploymentTray,.dwGameMenu,.onlineTeamInfo,.onlinePlayerSlot,.dwOnline #lobby,.dwOnline #room,.dwOnline #setup,.dwOnline #controls,.dwOnline .onlineHandPanel,.onlineActorPanel';
  const outer = '.modeWrap,.playHubWrap,.readyWrap,.diceWrap,.selectWrap,.dealWrap,.gameOverPopup';

  function skin(art, state = 'normal') {
    const node = document.createElement('span');
    node.className = 'dwPngSkin dwPngSkin--' + state;
    node.setAttribute('aria-hidden', 'true');
    node.style.borderImageSource = 'url("' + art.url + '")';
    node.style.borderImageSlice = art.cuts.join(' ') + ' fill';
    node.style.borderImageWidth = art.cap[1] + 'px ' + art.cap[0] + 'px';
    return node;
  }
  function decorate(host) {
    const button = host.matches(buttonsSelector);
    const unitAction = host.id === 'moveBtn' ? 'move' : host.id === 'attackBtn' ? 'attack' : host.dataset.uiAction === 'unit' ? (host.textContent.startsWith('Di chuyển') ? 'move' : 'attack') : null;
    const packFrame = !button && DWUIPack.frameFor(host);
    const kind = button ? (host.disabled ? 'disabled' : unitAction || (host.matches('.danger,.bad') ? 'danger' : host.matches('.gold,[aria-selected="true"]') ? 'gold' : host.matches('.primary,.good') ? 'blue' : 'iron')) : packFrame || (host.matches('.dockHero,.dockSkills,.dockCards,.onlineActorPanel,.onlineHandPanel') ? 'hud' : host.matches(outer) ? 'panel' : host.matches('.locked') ? 'locked' : 'card');
    if (host.dataset.dwArtwork === kind && host.querySelector(':scope > .dwPngSkin')) return;
    for (const child of host.querySelectorAll(':scope > .dwPngSkin,:scope > .dwPngCrest')) child.remove();
    host.dataset.dwArtwork = kind;
    host.classList.add('dwConceptArt');
    if (getComputedStyle(host).position === 'static') host.classList.add('dwArtAnchor');
    if (button) {
      for (const state of ['normal','hover','pressed']) {
        const key = kind + '-' + state;
        host.append(skin(DWUIPack.buttons[key] || DWUIPack.buttons[kind + '-normal'],state));
      }
    } else {
      host.append(skin(DWUIPack.frames[kind]));
      if (host.matches(outer) && !host.matches('.gameOverPopup')) host.append(DWUIPack.sprite('crest','dwPngCrest'));
    }
  }
  let scheduled = false;
  function update() {
    scheduled = false;
    document.querySelectorAll(panels + ',' + buttonsSelector).forEach(decorate);
  }
  new MutationObserver(records => {
    if (scheduled || !records.some(record => record.type === 'attributes' || [...record.addedNodes, ...record.removedNodes].some(node => !(node.nodeType === 1 && node.matches('.dwPngSkin,.dwPngCrest'))))) return;
    scheduled = true;
    requestAnimationFrame(update);
  }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['disabled', 'class', 'aria-selected', 'data-ui-kind', 'data-ranked'] });
  window.addEventListener('resize', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(update); } });
  update();
})();
