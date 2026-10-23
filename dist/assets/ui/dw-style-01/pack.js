/* Regions of the original uploaded concept boards. All labels/data stay live. */
window.DWUIPack = (() => {
  const keys = ['00-mode','01-desktop-hud','02-hero-skills-equipment','03-defense-results-dialogs','04-mobile-ingame','05-play-hub','06-online-lobby-room','07-ready-dice-deal','08-hero-team-selection','09-deployment','10-special-skills','11-equipment-reactions-ranked','12-training-system-kit','13-mobile-pregame'];
  const base = new URL((document.body.classList.contains('dwOnline') ? '../' : './') + 'assets/ui/dw-style-01/sheets/', document.baseURI);
  const sources = keys.map((key, index) => ({ url: new URL(key + '.webp', base).href, width: [4,13].includes(index) ? 1536 : index === 10 ? 1673 : 1672, height: [4,13].includes(index) ? 1024 : index === 10 ? 940 : 941 }));
  const frame = (sheet, rect, cuts = [24,12,24,20], cap = [28,20]) => ({ sheet, rect, cuts, cap });
  const frames = {
    hub: frame(5,[254,68,1240,515],[54,14,54,26],[48,24]),
    hubCard: frame(5,[313,170,344,375]),
    lobby: frame(6,[101,157,708,580],[40,14,40,24],[38,22]),
    room: frame(6,[820,158,785,578],[40,14,40,24],[38,22]),
    ready: frame(7,[58,117,503,606]),
    readyPlayer: frame(7,[85,308,450,126],[18,8,18,12],[22,12]),
    dice: frame(7,[581,117,515,606]),
    die: frame(7,[604,223,208,229],[18,8,18,18],[22,16]),
    deal: frame(7,[1118,118,514,604]),
    team: frame(8,[151,77,1370,657],[54,14,54,26],[48,24]),
    deploy: frame(9,[1260,104,384,545]),
    hero: frame(2,[25,83,826,345]),
    equipment: frame(2,[24,449,890,464]),
    defense: frame(3,[108,142,665,358]),
    confirm: frame(3,[911,176,321,197]),
    result: frame(3,[82,612,712,295]),
    special: frame(10,[34,94,522,391]),
    reaction: frame(11,[76,82,767,401]),
    ranked: frame(11,[908,505,727,396]),
    training: frame(12,[755,83,447,404]),
    mobileBattle: frame(4,[105,81,420,817],[15,12,15,18],[20,18]),
    mobileTeam: frame(13,[559,70,406,746],[18,12,18,18],[24,18]),
    mobileRoom: frame(13,[104,69,437,747],[18,12,18,18],[24,18])
  };
  const parts = {
    logo: [0,[151,7,342,59]],
    sceneLeft: [0,[0,82,202,551]], sceneRight: [0,[1465,82,207,551]],
    ai: [5,[382,181,224,140]], casual: [5,[768,181,236,140]], ranked: [5,[1158,180,226,142]],
    win: [3,[303,557,260,73]], lose: [3,[1043,555,198,73]], draw: [3,[1434,626,170,61]],
    shield: [2,[909,165,121,113]], chain: [2,[1068,163,128,115]], dragon: [2,[1225,163,127,115]],
    cardBack: [7,[943,762,72,104]],
    tabHero: [4,[224,939,31,26]], tabSkills: [4,[306,835,29,30]], tabCards: [4,[896,837,22,30]]
  };
  function piece(source, rect, className = '') {
    const node = document.createElement('span');
    node.className = 'dwPackPiece ' + className;
    node.setAttribute('aria-hidden','true');
    const [x,y,w,h] = rect;
    node.style.backgroundImage = `url("${source.url}")`;
    node.style.backgroundSize = `${source.width / w * 100}% ${source.height / h * 100}%`;
    node.style.backgroundPosition = `${x / (source.width - w) * 100}% ${y / (source.height - h) * 100}%`;
    node.style.aspectRatio = w + '/' + h;
    return node;
  }
  function sprite(key, className) { const [sheet,rect] = parts[key]; return piece(sources[sheet],rect,className); }
  function frameFor(host) {
    const mobile = innerWidth < 900;
    if (host.matches('.dwConfirmDialog,.modeConfirmPopup')) return 'confirm';
    if (host.matches('.trainingDialog')) return 'training';
    if (host.matches('.heroSkillPanel')) return 'special';
    if (host.matches('.combatEquipmentDialog')) return host.dataset.uiKind === 'post' || host.dataset.uiKind === 'reaction' ? 'reaction' : 'equipment';
    if (host.matches('.directDefensePanel,.defensePopup')) return 'defense';
    if (host.matches('.gameOverPopup')) return host.dataset.ranked === 'true' ? 'ranked' : 'result';
    if (host.matches('.dwDeploymentTray,.deployMenu')) return 'deploy';
    if (host.matches('.playHubWrap')) return 'hub';
    if (host.matches('.playHubCard')) return 'hubCard';
    if (host.matches('.readyWrap')) return 'ready';
    if (host.matches('.readyCard,.onlinePlayerSlot')) return 'readyPlayer';
    if (host.matches('.diceWrap')) return 'dice';
    if (host.matches('.dieBox')) return 'die';
    if (host.matches('.dealWrap')) return 'deal';
    if (host.matches('.selectWrap')) return mobile ? 'mobileTeam' : 'team';
    if (host.matches('.dwTeamHero')) return 'hero';
    if (host.matches('.dwOnline #lobby')) return mobile ? 'mobileRoom' : 'lobby';
    if (host.matches('.dwOnline .onlineResult')) return 'result';
    if (host.matches('.dwOnline #room[data-phase="team"] #setup')) return mobile ? 'mobileTeam' : 'team';
    if (host.matches('.dwOnline #room[data-phase="deploy"] #setup')) return 'deploy';
    if (host.matches('.dwOnline #setup')) return 'room';
    if (host.matches('.dwOnline #controls')) return mobile ? 'mobileBattle' : 'special';
    if (host.matches('.dwOnline #room')) return mobile ? 'mobileRoom' : 'room';
    if (mobile && host.matches('.duelControlDock > .box,.onlineActorPanel,.onlineHandPanel')) return 'mobileBattle';
    return null;
  }
  return { sources,frames,parts,piece,sprite,frameFor };
})();
