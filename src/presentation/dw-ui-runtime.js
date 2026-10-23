/* DW-STYLE-01 presentation. All actions still use the existing Shell/Core handlers. */
const DWStyleUI = {
  tab: 'hero',
  lastPhase: null,
  mounted: false,
  element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  },
  button(text, action, className = '') {
    const button = this.element('button', 'btn ' + className, text);
    button.type = 'button';
    button.onclick = action;
    return button;
  },
  confirm(title, description, action) {
    const dialog = this.confirmDialog;
    if (dialog.open) return;
    const heading = this.element('h2', '', title);
    heading.id = 'dwConfirmTitle';
    const text = this.element('p', '', description);
    const actions = this.element('div', 'combatEquipmentActions');
    const accept = this.button('XÁC NHẬN', () => { dialog.close(); action(); }, 'gold');
    actions.append(accept, this.button('QUAY LẠI', () => dialog.close()));
    dialog.replaceChildren(heading, text, actions);
    dialog.showModal();
    accept.focus();
  },
  mount() {
    if (this.mounted) return;
    this.mounted = true;
    DuelBoardLayout.mount();
    moveBtn.classList.add('primary');
    const screen = document.getElementById('gameScreen');
    this.dock = document.querySelector('.duelControlDock');
    this.dock.dataset.tab = this.tab;
    this.tabs = this.element('nav', 'dwDockTabs');
    this.tabs.setAttribute('aria-label', 'Điều khiển trong trận');
    this.tabs.setAttribute('role', 'tablist');
    const entries = [['hero', 'HERO', 'unitPanel'], ['skills', 'KỸ NĂNG', 'dwSkillsPanel'], ['cards', 'TRANG BỊ', 'dwCardsPanel']];
    document.querySelector('.dockSkills').id = 'dwSkillsPanel';
    document.querySelector('.dockCards').id = 'dwCardsPanel';
    for (const [key, label, target] of entries) {
      const button = this.button(label, () => this.selectTab(key));
      button.className = 'dwDockTab';
      button.id = 'dwTab-' + key;
      button.dataset.tab = key;
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-controls', target);
      this.tabs.append(button);
    }
    this.tabs.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      const buttons = [...this.tabs.children], index = buttons.indexOf(document.activeElement);
      if (index < 0) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (index + (event.key === 'ArrowRight' ? 1 : 2)) % 3;
      this.selectTab(buttons[next].dataset.tab);
      buttons[next].focus();
    });
    screen.append(this.tabs);
    this.tray = this.element('section', 'dwDeploymentTray');
    this.tray.setAttribute('aria-label', 'Quân triển khai');
    DuelBoardLayout.stage.append(this.tray);
    const toolbar = document.querySelector('.trainingToolbar');
    if (toolbar) screen.insertBefore(toolbar, DuelBoardLayout.stage);
    const menu = this.element('details', 'dwMatchMenu');
    const toggle = this.element('summary', 'btn', '☰');
    toggle.setAttribute('aria-label', 'Menu trận đấu');
    const body = this.element('div', 'dwGameMenu');
    body.append(this.button('CHƠI LẠI', () => { menu.open = false; resetBtn.click(); }));
    body.append(this.button('CHỌN CHẾ ĐỘ', () => {
      menu.open = false;
      this.confirm('RỜI TRẬN?', 'Trận hiện tại sẽ kết thúc trên thiết bị này.', () => {
        if (TrainingMode.active()) TrainingMode.exit();
        else { leaveToMenu(); ShellFlowController.openModeSelect(); }
      });
    }));
    body.append(this.element('small', '', 'DOZEN WAR II · ' + document.body.dataset.buildVersion));
    menu.append(toggle, body);
    document.querySelector('#gameScreen .statusLine > .row').append(menu);
    this.confirmDialog = this.element('dialog', 'trainingDialog dwConfirmDialog');
    this.confirmDialog.setAttribute('aria-labelledby', 'dwConfirmTitle');
    document.body.append(this.confirmDialog);
    resetBtn.onclick = () => this.confirm('CHƠI LẠI?', 'Trận hiện tại sẽ được đặt lại. Phòng chơi được giữ nguyên.', () => {
      if (TrainingMode.active()) TrainingMode.start();
      else if (S.roomSession) beginNewMatchInRoom();
    });
    const steps = ['Sẵn sàng', 'Xúc xắc', 'Nhận bài', 'Chọn đội', 'Xếp quân'];
    this.steps = this.element('ol', 'dwSetupSteps');
    this.steps.setAttribute('aria-label', 'Các bước chuẩn bị trận');
    for (let i = 0; i < steps.length; i++) this.steps.append(this.element('li', '', (i + 1) + ' · ' + steps[i]));
    document.querySelector('.grid').before(this.steps);
    const duel = document.getElementById('playDuelMode');
    const actions = this.element('div', 'dwModeActions');
    duel.before(actions);
    actions.append(duel, document.getElementById('trainingModeButton'));
    document.querySelector('.dwTroopPicker').append(document.getElementById('confirmTeam'));
    window.addEventListener('resize', () => this.sync());
    this.sync();
  },
  selectTab(tab) {
    this.tab = tab;
    this.syncTabs();
    DuelBoardLayout.schedule();
  },
  syncTabs() {
    if (!this.dock) return;
    this.dock.dataset.tab = this.tab;
    const mobile = window.innerWidth < 900;
    for (const button of this.tabs.children) {
      const selected = button.dataset.tab === this.tab;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
      const panel = document.getElementById(button.getAttribute('aria-controls'));
      panel.setAttribute('role', mobile ? 'tabpanel' : 'region');
      panel.setAttribute('aria-labelledby', button.id);
      if (mobile) panel.setAttribute('aria-hidden', String(!selected));
      else panel.removeAttribute('aria-hidden');
    }
  },
  team() {
    const panel = document.getElementById('dwTeamHero');
    if (!panel) return;
    const hero = ContentViews.hero(tempHeroDefinitionId);
    if (!hero) return;
    ShellDOM.team.title.textContent = 'CHỌN ĐỘI HÌNH · P' + S.selecting;
    panel.replaceChildren(this.element('h3', '', 'THÔNG TIN HERO'));
    const source = hero.assets?.portrait && AssetResolver.source(hero.assets.portrait);
    if (source) {
      const image = this.element('img'); image.src = source; image.alt = hero.name; image.draggable = false;
      panel.append(image);
    }
    panel.append(this.element('h2', '', hero.name));
    panel.append(this.element('p', '', 'HP ' + hero.stats.hp + ' · ' + ({ INF: 'Bộ binh', CAV: 'Kỵ binh', ARCH: 'Cung thủ', ALCH: 'Giả kim thuật sư' }[hero.class] || hero.class)));
    const skillList = this.element('div', 'dwTeamSkills');
    for (const id of hero.skillIds || []) {
      const skill = ContentViews.skill(id);
      if (!skill) continue;
      const row = this.element('div', 'dwTeamSkill', skill.name);
      row.dataset.skillId = id; row.title = skill.description;
      row.append(this.element('span', '', '★'.repeat(skill.star || 0)));
      skillList.append(row);
    }
    panel.append(skillList);
    panel.append(this.button('XEM KỸ NĂNG HERO', () => {
      const dialog = this.confirmDialog;
      dialog.replaceChildren();
      const title = this.element('h2', '', hero.name + ' · KỸ NĂNG'); title.id = 'dwConfirmTitle'; dialog.append(title);
      for (const id of hero.skillIds || []) {
        const skill = ContentViews.skill(id); if (!skill) continue;
        const heading = this.element('h3', '', skill.name + ' · ' + '★'.repeat(skill.star || 0)); heading.dataset.skillId = id;
        dialog.append(heading,this.element('p', '', skill.description));
      }
      dialog.append(this.button('ĐÓNG', () => dialog.close())); dialog.showModal();
    }));
    const total = Object.values(tempTroops).reduce((a, b) => a + b, 0);
    ShellDOM.team.confirmButton.disabled = total !== 5;
    for (const button of ShellDOM.team.troopChoices.querySelectorAll('button')) {
      button.disabled = Number(button.dataset.d) > 0 ? total >= 5 : !tempTroops[button.dataset.k];
      button.setAttribute('aria-label', (Number(button.dataset.d) > 0 ? 'Thêm ' : 'Bớt ') + TROOPS[button.dataset.k].name);
    }
    for (const button of ShellDOM.team.heroChoices.children) button.setAttribute('aria-pressed', String(button.classList.contains('on')));
  },
  deployment() {
    this.tray.hidden = S.phase !== 'deploy';
    if (this.tray.hidden) return;
    const side = S.deployOrder?.[S.deployIndex] || S.loser || 1;
    const team = S.teams[side];
    if (!team) return;
    const hero = ContentViews.hero(team.heroDefinitionId);
    const own = S.units.filter(unit => unit.side === side);
    this.tray.replaceChildren(this.element('h3', '', 'QUÂN CỦA PHE ' + side));
    this.tray.append(this.element('div', 'dwDeployCount', 'Đã xếp ' + own.length + '/6 · Còn lại ' + Math.max(0, 6 - own.length)));
    const list = this.element('div', 'dwDeployUnits');
    const entries = [{ name: hero?.name || 'Hero', source: hero?.assets?.portrait && AssetResolver.source(hero.assets.portrait), placed: own.some(unit => unit.hero) }];
    for (const [kind, count] of Object.entries(team.troops)) for (let i = 0; i < count; i++) {
      entries.push({ name: TROOPS[kind].name, source: './assets/troops-compact-dw-style-01/' + kind + '-' + (side === 1 ? 'blue' : 'red') + '.webp', placed: own.filter(unit => !unit.hero && unit.kind === kind).length > i });
    }
    for (const entry of entries.sort((a,b) => Number(a.placed) - Number(b.placed))) {
      const tile = this.element('div', 'dwDeployUnit' + (entry.placed ? ' placed' : ''));
      if (entry.source) { const image = this.element('img'); image.src = entry.source; image.alt = ''; tile.append(image); }
      tile.append(this.element('span', '', (entry.placed ? '✓ ' : '') + entry.name));
      list.append(tile);
    }
    this.tray.append(list, this.element('p', '', 'Chọn ô trống để đặt quân. Quân có dấu ✓ đã được xếp.'));
    mainBtn.disabled = own.length < 6 || side === S.botSide;
    if (window.innerWidth < 900) {
      if (this.tray.parentElement !== this.dock.parentElement) this.dock.before(this.tray);
    } else if (this.tray.parentElement !== DuelBoardLayout.stage) DuelBoardLayout.stage.append(this.tray);
  },
  resultPortraits() {
    const popup = document.querySelector('.gameOverPopup');
    if (popup) popup.dataset.ranked = String(!!S.isRanked);
    for (const side of [1, 2]) {
      const card = document.getElementById('playerResult' + side);
      const hero = S.units?.find(unit => unit.hero && unit.side === side);
      const definition = hero && ContentViews.hero(hero.definitionId);
      const source = definition?.assets?.portrait && AssetResolver.source(definition.assets.portrait);
      const existing = card.querySelector('.dwResultPortrait');
      if (!source) { existing?.remove(); continue; }
      if (existing?.getAttribute('src') === source) continue;
      existing?.remove();
      const image = this.element('img', 'dwResultPortrait'); image.src = source; image.alt = definition.name;
      card.prepend(image);
    }
  },
  sync() {
    if (!this.mounted) return;
    const match = document.getElementById('gameScreen').classList.contains('active') && ['deploy', 'battle'].includes(S.phase);
    document.body.classList.toggle('dwMatchLayout', match);
    document.body.classList.toggle('dwTrainingLayout', match && TrainingMode.active());
    document.body.dataset.uiPhase = S.phase;
    document.body.dataset.uiSide = String(S.phase === 'deploy' ? S.deployOrder?.[S.deployIndex] || 1 : S.battleSide || 1);
    CombatFlowUI.dialog.dataset.uiKind = CombatFlowUI.state?.kind || '';
    const names = { mode: 'CHỌN CHẾ ĐỘ', playmenu: 'CHỌN LOẠI TRẬN', ready: 'SẴN SÀNG', dice: 'TUNG XÚC XẮC', deal: 'NHẬN TRANG BỊ', team: 'CHỌN ĐỘI HÌNH', deploy: 'TRIỂN KHAI', battle: 'TRẬN ĐẤU' };
    phaseLabel.textContent = names[S.phase] || '';
    const order = ['ready', 'dice', 'deal', 'team', 'deploy'];
    const step = order.indexOf(S.phase);
    this.steps.hidden = step < 0 || match;
    [...this.steps.children].forEach((node, i) => {
      node.classList.toggle('done', i < step);
      if (i === step) node.setAttribute('aria-current', 'step'); else node.removeAttribute('aria-current');
    });
    if (this.lastPhase !== S.phase && S.phase === 'battle') this.tab = 'hero';
    this.lastPhase = S.phase;
    if (match) {
      this.syncTabs();
      this.deployment();
      DuelBoardLayout.decorateSkills();
      document.querySelectorAll('.dockSkills > h3').forEach(heading => { heading.textContent = heading.textContent.replace('HERO SKILLS', 'KỸ NĂNG'); });
      moveBtn.textContent = 'DI CHUYỂN';
      if (attackBtn.textContent === 'ATTACK') attackBtn.textContent = 'TẤN CÔNG';
      document.querySelector('.dockHero > h3').textContent = S.phase === 'deploy' ? 'ĐƠN VỊ ĐANG CHỌN' : 'HERO · PHE ' + (HeroSkillUI.actor()?.side || S.battleSide);
      const title = gameTitle.textContent.replace('DEPLOYMENT', 'TRIỂN KHAI').replace('TURN', 'LƯỢT').replace('PLAYER', 'PHE');
      if (gameTitle.textContent !== title) gameTitle.textContent = title;
    } else this.tray.hidden = true;
    this.resultPortraits();
  }
};
const _dwStyleShow = show;
show = function (...args) { const result = _dwStyleShow(...args); DWStyleUI.sync(); return result; };
const _dwStyleUpdate = updateUI;
updateUI = function (...args) { const result = _dwStyleUpdate(...args); DWStyleUI.sync(); return result; };
const _dwStyleTeam = renderTeamPicker;
renderTeamPicker = function (...args) { const result = _dwStyleTeam(...args); DWStyleUI.team(); return result; };
const _dwStyleResult = showGameOver;
showGameOver = function (...args) { const result = _dwStyleResult(...args); DWStyleUI.resultPortraits(); return result; };
DWStyleUI.mount();
