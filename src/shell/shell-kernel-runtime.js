const DW_SHELL = {
  id: "GAME_SHELL",
  uiIds: DW_IDS.SHELL,
  _matchEndHandler: null,

  bindMatchEnd(handler){ this._matchEndHandler = handler; },

  // Shell renders a result already decided by the active Mode.
  onMatchEnd(matchResult){
    if(typeof this._matchEndHandler === "function"){
      this._matchEndHandler(matchResult);
    }
  }
};

