/* DOZEN WAR II v1.26 - Part 13.1 Module Boundary Contract
   Architecture metadata only. No gameplay behavior lives here. */
(function(){
  'use strict';
  const frozen = Object.freeze;
  window.DWArchitecture = frozen({
    version: '13.1',
    policy: 'CORE_MODE_SHELL_CONTENT_PRESENTATION_NETWORK',
    layers: frozen({
      CORE: 'Reusable gameplay mechanics, resolvers, transactions, state engine.',
      MODE: 'Match-specific policies, win/lose rules, setup and configuration.',
      CONTENT: 'Hero, Unit, Skill, Equipment, Effect, Status and content schemas.',
      SHELL: 'Mode select, rooms, matchmaking, ready, game over and rematch.',
      UI: 'HUD and interaction views. Does not own gameplay truth.',
      PRESENTATION: 'Board/unit rendering, camera, VFX and future Three.js adapter.',
      NETWORK: 'Local/online transport adapters and server-facing contracts.',
      SHARED: 'Stable IDs, pure contracts and utilities safe across boundaries.'
    }),
    invariants: frozen([
      'Core does not compute universal victory conditions.',
      'Mode configures Core mechanics but does not own their implementation.',
      'Shell renders MatchResult and never evaluates victory.',
      'Content definitions are separate from runtime state.',
      'Presentation does not mutate authoritative gameplay state.',
      'Gameplay coordinates are independent from camera/screen coordinates.',
      'UI routes gameplay intent through controllers/dispatcher.',
      'Online authority can replace LocalAdapter without rewriting presentation.'
    ]),
    migration: frozen({
      phase: 'PART_13_1',
      currentRuntimeLocation: 'src/legacy/legacy-runtime.js',
      strategy: 'STRANGLER_MIGRATION',
      next: 'PART_13_2_CONTENT_EXTRACTION'
    })
  });
})();
