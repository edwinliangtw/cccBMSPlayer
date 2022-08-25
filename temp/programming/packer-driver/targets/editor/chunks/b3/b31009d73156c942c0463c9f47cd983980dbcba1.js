System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, BMSData, _crd;

  _export("BMSData", void 0);

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "63101CQvatLUr6Zu2baOFqc", "BMSData", undefined);

      _export("BMSData", BMSData = class BMSData {
        constructor() {
          this.player = '';
          this.genre = '';
          this.title = '';
          this.artist = '';
          this.bpm = '';
          this.playLevel = '';
          this.rank = '';
          this.total = 0;
          this.sategFile = '';
          this.keyNum = '';
          this.difficulty = '';
          this.wav = {};
          this.bmp = {};
          this.data = [];
          this.exbpm = {};
          this.stop = {};
          this.totalNote = 0;
          this.bgms = [];
          this.animations = [];
          this.bpms = [];
          this.stopTiming = [];
          this.endTime = 0;
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=b31009d73156c942c0463c9f47cd983980dbcba1.js.map