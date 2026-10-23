/* Render windows of the approved board directly. No repainting or hue filters.
 * Nine slices preserve corner geometry while HTML labels remain live/selectable.
 * Source coordinates are in the original 1672 x 941 concept, not a resized copy.
 */
(() => {
  const atlas = new URL((document.body.classList.contains('dwOnline') ? '../' : './') + 'assets/ui/dw-style-01/concept-atlas.png', document.baseURI).href;
  const hudAtlas = new URL('hud-concept-atlas.png', atlas).href;
  const buttonsSelector = '.btn:not(.skill),.dwDockTab';
  const panels = '.modeWrap,.playHubWrap,.readyWrap,.diceWrap,.selectWrap,.dealWrap,.modeCard,.playHubCard,.box,.readyCard,.dieBox,.hubPopup,.modeConfirmPopup,.gameOverPopup,.combatEquipmentDialog,.trainingDialog,.heroSkillPanel,.skillTargetPanel,.defensePopup,.attackPopup,.unitMenu,.deployMenu,.directDefensePanel,.dwDeploymentTray,.dwGameMenu,.onlineTeamInfo,.onlinePlayerSlot,.dwOnline #lobby,.dwOnline #room,.dwOnline #setup,.dwOnline #controls,.dwOnline .onlineHandPanel,.onlineActorPanel';
  const outer = '.modeWrap,.playHubWrap,.readyWrap,.diceWrap,.selectWrap,.dealWrap,.gameOverPopup';
  function piece(rect, source = atlas) {
    const node = document.createElement('span');
    node.className = 'dwAtlasPiece';
    const [x, y, width, height] = rect;
    node.style.backgroundImage = `url("${source}")`;
    const dimensions = window.DWUIPack?.sources.find(item => item.url === source) || {width:1672,height:941};
    node.style.backgroundSize = `${dimensions.width / width * 100}% ${dimensions.height / height * 100}%`;
    node.style.backgroundPosition = `${x / (dimensions.width - width) * 100}% ${y / (dimensions.height - height) * 100}%`;
    return node;
  }
  function skin(rect, cuts, cap, state = 'normal', blank, source = atlas) {
    const node = document.createElement('span');
    node.className = 'dwAtlasSkin dwAtlasSkin--' + state;
    node.setAttribute('aria-hidden', 'true');
    const [x, y, width, height] = rect, [left, top, right, bottom] = cuts;
    node.style.setProperty('--dw-cap-x', cap[0] + 'px');
    node.style.setProperty('--dw-cap-y', cap[1] + 'px');
    const xs = [x, x + left, x + width - right], ys = [y, y + top, y + height - bottom];
    const widths = [left, width - left - right, right], heights = [top, height - top - bottom, bottom];
    for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) {
      node.append(piece(row === 1 && col === 1 && blank ? blank : [xs[col], ys[row], widths[col], heights[row]], source));
    }
    return node;
  }
  // The center fill comes from a text-free strip of each button. Text printed
  // on the concept board is never included in the live label area.
  const buttons = {
    gold: [[818, 684, 170, 40], [1020, 683, 171, 41], [1224, 684, 172, 40]],
    blue: [[813, 757, 183, 41], [1016, 757, 184, 41], [1217, 758, 187, 40]],
    iron: [[819, 840, 109, 41], [960, 840, 104, 41], [1097, 840, 109, 41]],
    move: [[1234, 744, 137, 43]],
    attack: [[1398, 744, 140, 43]],
    disabled: [[1431, 684, 184, 40]]
  };
  function decorate(host) {
    const button = host.matches(buttonsSelector);
    const unitAction = host.id === 'moveBtn' ? 'move' : host.id === 'attackBtn' ? 'attack' : host.dataset.uiAction === 'unit' ? (host.textContent.startsWith('Di chuyển') ? 'move' : 'attack') : null;
    const packFrame = !button && window.DWUIPack?.frameFor(host);
    const kind = button ? (host.disabled ? 'disabled' : unitAction || (host.matches('.gold,[aria-selected="true"]') ? 'gold' : host.matches('.primary,.good') ? 'blue' : 'iron')) : packFrame ? 'pack:' + packFrame : host.matches('.dockHero,.dockSkills,.dockCards,.onlineActorPanel,.onlineHandPanel') ? 'hud' : host.matches(outer) ? 'panel' : host.matches('.locked') ? 'locked' : 'card';
    if (host.dataset.dwArtwork === kind && host.querySelector(':scope > .dwAtlasSkin')) return;
    for (const child of host.querySelectorAll(':scope > .dwAtlasSkin,:scope > .dwAtlasCrest')) child.remove();
    host.dataset.dwArtwork = kind;
    host.classList.add('dwConceptArt');
    // A low-specificity class lets later phase rules still switch a panel to
    // fixed/absolute positioning (notably the online result dialog).
    if (getComputedStyle(host).position === 'static') host.classList.add('dwArtAnchor');
    if (button) {
      buttons[kind].forEach((rect, i) => {
        const [x, y, w] = rect;
        host.append(skin(rect, [10, 6, 10, 6], [11, 6], ['normal', 'hover', 'pressed'][i], [x + 24, y + 7, w - 48, 2], unitAction && !host.disabled ? hudAtlas : atlas));
      });
    } else if (packFrame) {
      const config = DWUIPack.frames[packFrame];
      const frame = skin(config.rect, config.cuts, config.cap, 'normal', undefined, DWUIPack.sources[config.sheet].url);
      // Long edges use text-free strips. Some source boards print labels or
      // banners near the edge; those must never be stretched into live UI.
      frame.children[1].replaceWith(piece([400,76,200,12]));
      frame.children[4].replaceWith(piece([80,736,230,92]));
      frame.children[7].replaceWith(piece([90,858,216,16]));
      host.append(frame);
    } else if (kind === 'hud') {
      host.append(skin([1007, 829, 626, 74], [25, 10, 25, 10], [23, 12], 'normal', [1033, 849, 155, 30], hudAtlas));
    } else {
      // Large frames use the full-size assembled frame, not the small kit
      // thumbnail. Its middle is filled by the kit's empty stone surface.
      const rect = kind === 'panel' ? [210, 76, 1248, 550] : kind === 'locked' ? [595, 698, 183, 175] : [386, 698, 192, 175];
      host.append(skin(rect, kind === 'panel' ? [90, 54, 90, 55] : [19, 19, 19, 19], kind === 'panel' ? [76, 48] : [22, 22], 'normal', kind === 'panel' ? [80, 736, 230, 92] : undefined));
      if (kind === 'panel') {
        // The crest is a separate fixed-width ornament, never stretched along
        // the full top edge with the frame's horizontal slice.
        const topEdge = host.querySelector('.dwAtlasPiece:nth-child(2)');
        topEdge.replaceWith(piece([400, 76, 200, 54]));
        const crest = piece([790, 51, 91, 61]);
        crest.classList.add('dwAtlasCrest');
        crest.setAttribute('aria-hidden', 'true');
        host.append(crest);
      }
    }
  }
  let scheduled = false;
  function update() {
    scheduled = false;
    document.querySelectorAll(panels + ',' + buttonsSelector).forEach(decorate);
  }
  new MutationObserver(records => {
    // Ignore the decorative nodes we just added; only application mutations
    // require a new pass (labels/disabled state can change during a turn).
    if (scheduled || !records.some(record => record.type === 'attributes' || [...record.addedNodes, ...record.removedNodes].some(node => !(node.nodeType === 1 && node.classList.contains('dwAtlasSkin')) && !(node.nodeType === 1 && node.classList.contains('dwAtlasCrest'))))) return;
    scheduled = true;
    requestAnimationFrame(update);
  }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['disabled', 'class', 'aria-selected', 'data-ui-kind', 'data-ranked'] });
  window.addEventListener('resize', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(update); } });
  update();
})();
