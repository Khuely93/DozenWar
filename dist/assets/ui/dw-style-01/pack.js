/* Individual transparent PNG artwork. Original concept boards are archives only. */
window.DWUIPack = (() => {
  const catalog = {
  "frames": {
    "panel": {
      "file": "png/frames/panel.png",
      "width": 798,
      "height": 430,
      "cuts": [
        78,
        90,
        78,
        90
      ],
      "cap": [
        48,
        36
      ]
    },
    "card": {
      "file": "png/frames/card.png",
      "width": 608,
      "height": 344,
      "cuts": [
        78,
        90,
        78,
        90
      ],
      "cap": [
        22,
        22
      ]
    },
    "locked": {
      "file": "png/frames/locked.png",
      "width": 609,
      "height": 345,
      "cuts": [
        78,
        90,
        78,
        90
      ],
      "cap": [
        22,
        22
      ]
    },
    "hud": {
      "file": "png/frames/hud.png",
      "width": 824,
      "height": 190,
      "cuts": [
        46,
        90,
        46,
        90
      ],
      "cap": [
        23,
        15
      ]
    },
    "hub": {
      "file": "png/frames/hub.png",
      "width": 589,
      "height": 311,
      "cuts": [
        75,
        90,
        75,
        90
      ],
      "cap": [
        48,
        36
      ]
    },
    "hubCard": {
      "file": "png/frames/hubCard.png",
      "width": 226,
      "height": 314,
      "cuts": [
        75,
        41,
        75,
        41
      ],
      "cap": [
        22,
        22
      ]
    },
    "lobby": {
      "file": "png/frames/lobby.png",
      "width": 400,
      "height": 299,
      "cuts": [
        72,
        72,
        72,
        72
      ],
      "cap": [
        22,
        22
      ]
    },
    "room": {
      "file": "png/frames/room.png",
      "width": 453,
      "height": 318,
      "cuts": [
        76,
        82,
        76,
        82
      ],
      "cap": [
        22,
        22
      ]
    },
    "ready": {
      "file": "png/frames/ready.png",
      "width": 285,
      "height": 366,
      "cuts": [
        78,
        51,
        78,
        51
      ],
      "cap": [
        22,
        22
      ]
    },
    "readyPlayer": {
      "file": "png/frames/readyPlayer.png",
      "width": 458,
      "height": 160,
      "cuts": [
        38,
        82,
        38,
        82
      ],
      "cap": [
        22,
        22
      ]
    },
    "dice": {
      "file": "png/frames/dice.png",
      "width": 408,
      "height": 373,
      "cuts": [
        78,
        73,
        78,
        73
      ],
      "cap": [
        22,
        22
      ]
    },
    "die": {
      "file": "png/frames/die.png",
      "width": 256,
      "height": 247,
      "cuts": [
        59,
        46,
        59,
        46
      ],
      "cap": [
        22,
        22
      ]
    },
    "deal": {
      "file": "png/frames/deal.png",
      "width": 398,
      "height": 378,
      "cuts": [
        78,
        72,
        78,
        72
      ],
      "cap": [
        22,
        22
      ]
    },
    "team": {
      "file": "png/frames/team.png",
      "width": 772,
      "height": 366,
      "cuts": [
        78,
        90,
        78,
        90
      ],
      "cap": [
        48,
        36
      ]
    },
    "deploy": {
      "file": "png/frames/deploy.png",
      "width": 347,
      "height": 395,
      "cuts": [
        78,
        62,
        78,
        62
      ],
      "cap": [
        22,
        22
      ]
    },
    "special": {
      "file": "png/frames/special.png",
      "width": 605,
      "height": 295,
      "cuts": [
        71,
        90,
        71,
        90
      ],
      "cap": [
        22,
        22
      ]
    },
    "training": {
      "file": "png/frames/training.png",
      "width": 548,
      "height": 317,
      "cuts": [
        76,
        90,
        76,
        90
      ],
      "cap": [
        22,
        22
      ]
    },
    "mobileTeam": {
      "file": "png/frames/mobileTeam.png",
      "width": 315,
      "height": 438,
      "cuts": [
        78,
        57,
        78,
        57
      ],
      "cap": [
        22,
        22
      ]
    },
    "mobileRoom": {
      "file": "png/frames/mobileRoom.png",
      "width": 297,
      "height": 433,
      "cuts": [
        78,
        53,
        78,
        53
      ],
      "cap": [
        22,
        22
      ]
    },
    "hero": {
      "file": "png/frames/hero.png",
      "width": 494,
      "height": 203,
      "cuts": [
        49,
        89,
        49,
        89
      ],
      "cap": [
        22,
        22
      ]
    },
    "equipment": {
      "file": "png/frames/equipment.png",
      "width": 477,
      "height": 203,
      "cuts": [
        49,
        86,
        49,
        86
      ],
      "cap": [
        22,
        22
      ]
    },
    "defense": {
      "file": "png/frames/defense.png",
      "width": 483,
      "height": 203,
      "cuts": [
        49,
        87,
        49,
        87
      ],
      "cap": [
        22,
        22
      ]
    },
    "confirm": {
      "file": "png/frames/confirm.png",
      "width": 308,
      "height": 195,
      "cuts": [
        47,
        55,
        47,
        55
      ],
      "cap": [
        22,
        22
      ]
    },
    "result": {
      "file": "png/frames/result.png",
      "width": 557,
      "height": 213,
      "cuts": [
        51,
        90,
        51,
        90
      ],
      "cap": [
        22,
        22
      ]
    },
    "ranked": {
      "file": "png/frames/ranked.png",
      "width": 575,
      "height": 213,
      "cuts": [
        51,
        90,
        51,
        90
      ],
      "cap": [
        22,
        22
      ]
    },
    "mobileBattle": {
      "file": "png/frames/mobileBattle.png",
      "width": 310,
      "height": 451,
      "cuts": [
        78,
        56,
        78,
        56
      ],
      "cap": [
        22,
        22
      ]
    },
    "reaction": {
      "file": "png/frames/equipment.png",
      "width": 477,
      "height": 203,
      "cuts": [
        49,
        86,
        49,
        86
      ],
      "cap": [
        22,
        22
      ]
    }
  },
  "buttons": {
    "gold-normal": {
      "file": "png/buttons/gold-normal.png",
      "width": 379,
      "height": 120,
      "cuts": [
        24,
        24,
        24,
        24
      ],
      "cap": [
        11,
        8
      ]
    },
    "gold-hover": {
      "file": "png/buttons/gold-hover.png",
      "width": 378,
      "height": 120,
      "cuts": [
        24,
        24,
        24,
        24
      ],
      "cap": [
        11,
        8
      ]
    },
    "gold-pressed": {
      "file": "png/buttons/gold-pressed.png",
      "width": 380,
      "height": 120,
      "cuts": [
        24,
        24,
        24,
        24
      ],
      "cap": [
        11,
        8
      ]
    },
    "blue-normal": {
      "file": "png/buttons/blue-normal.png",
      "width": 378,
      "height": 119,
      "cuts": [
        24,
        24,
        24,
        24
      ],
      "cap": [
        11,
        8
      ]
    },
    "blue-hover": {
      "file": "png/buttons/blue-hover.png",
      "width": 378,
      "height": 119,
      "cuts": [
        24,
        24,
        24,
        24
      ],
      "cap": [
        11,
        8
      ]
    },
    "blue-pressed": {
      "file": "png/buttons/blue-pressed.png",
      "width": 380,
      "height": 119,
      "cuts": [
        24,
        24,
        24,
        24
      ],
      "cap": [
        11,
        8
      ]
    },
    "iron-normal": {
      "file": "png/buttons/iron-normal.png",
      "width": 378,
      "height": 119,
      "cuts": [
        24,
        24,
        24,
        24
      ],
      "cap": [
        11,
        8
      ]
    },
    "iron-hover": {
      "file": "png/buttons/iron-hover.png",
      "width": 378,
      "height": 120,
      "cuts": [
        24,
        24,
        24,
        24
      ],
      "cap": [
        11,
        8
      ]
    },
    "iron-pressed": {
      "file": "png/buttons/iron-pressed.png",
      "width": 380,
      "height": 119,
      "cuts": [
        24,
        24,
        24,
        24
      ],
      "cap": [
        11,
        8
      ]
    },
    "disabled-normal": {
      "file": "png/buttons/disabled-normal.png",
      "width": 378,
      "height": 119,
      "cuts": [
        24,
        24,
        24,
        24
      ],
      "cap": [
        11,
        8
      ]
    },
    "move-normal": {
      "file": "png/buttons/move-normal.png",
      "width": 376,
      "height": 121,
      "cuts": [
        24,
        24,
        24,
        24
      ],
      "cap": [
        11,
        8
      ]
    },
    "attack-normal": {
      "file": "png/buttons/attack-normal.png",
      "width": 380,
      "height": 121,
      "cuts": [
        24,
        24,
        24,
        24
      ],
      "cap": [
        11,
        8
      ]
    },
    "danger-normal": {
      "file": "png/buttons/danger-normal.png",
      "width": 378,
      "height": 119,
      "cuts": [
        24,
        24,
        24,
        24
      ],
      "cap": [
        11,
        8
      ]
    },
    "danger-hover": {
      "file": "png/buttons/danger-hover.png",
      "width": 378,
      "height": 120,
      "cuts": [
        24,
        24,
        24,
        24
      ],
      "cap": [
        11,
        8
      ]
    },
    "danger-pressed": {
      "file": "png/buttons/danger-pressed.png",
      "width": 380,
      "height": 119,
      "cuts": [
        24,
        24,
        24,
        24
      ],
      "cap": [
        11,
        8
      ]
    }
  },
  "parts": {
    "logo": {
      "file": "png/parts/logo.png",
      "width": 524,
      "height": 104
    },
    "crest": {
      "file": "png/parts/crest.png",
      "width": 220,
      "height": 216
    },
    "ai": {
      "file": "png/parts/ai.png",
      "width": 364,
      "height": 288
    },
    "casual": {
      "file": "png/parts/casual.png",
      "width": 342,
      "height": 292
    },
    "ranked": {
      "file": "png/parts/ranked.png",
      "width": 371,
      "height": 301
    },
    "win": {
      "file": "png/parts/win.png",
      "width": 446,
      "height": 176
    },
    "lose": {
      "file": "png/parts/lose.png",
      "width": 519,
      "height": 230
    },
    "draw": {
      "file": "png/parts/draw.png",
      "width": 337,
      "height": 223
    },
    "tabHero": {
      "file": "png/parts/tabHero.png",
      "width": 184,
      "height": 244
    },
    "tabSkills": {
      "file": "png/parts/tabSkills.png",
      "width": 239,
      "height": 223
    },
    "tabCards": {
      "file": "png/parts/tabCards.png",
      "width": 194,
      "height": 227
    },
    "hourglass": {
      "file": "png/parts/hourglass.png",
      "width": 160,
      "height": 227
    }
  }
};
  const base = new URL((document.body.classList.contains('dwOnline') ? '../' : './') + 'assets/ui/dw-style-01/', document.baseURI);
  for (const group of Object.values(catalog)) for (const item of Object.values(group)) item.url = new URL(item.file, base).href;
  function sprite(key, className = '') {
    const art = catalog.parts[key];
    const node = document.createElement('span');
    node.className = 'dwPackPiece ' + className;
    node.setAttribute('aria-hidden', 'true');
    node.style.backgroundImage = 'url("' + art.url + '")';
    node.style.backgroundSize = 'contain';
    node.style.backgroundPosition = 'center';
    node.style.aspectRatio = art.width + '/' + art.height;
    return node;
  }
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

  return { ...catalog, sprite, frameFor };
})();
