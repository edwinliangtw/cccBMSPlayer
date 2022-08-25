System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, assetManager, AudioSource, SpriteFrame, Texture2D, BMSParser, BMSLoader, _crd;

  function _reportPossibleCrUseOfBMSData(extras) {
    _reporterNs.report("BMSData", "./BMSData", _context.meta, extras);
  }

  function _reportPossibleCrUseOfBMSParser(extras) {
    _reporterNs.report("BMSParser", "./BMSParser", _context.meta, extras);
  }

  _export("BMSLoader", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      assetManager = _cc.assetManager;
      AudioSource = _cc.AudioSource;
      SpriteFrame = _cc.SpriteFrame;
      Texture2D = _cc.Texture2D;
    }, function (_unresolved_2) {
      BMSParser = _unresolved_2.BMSParser;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "618a9GQy5lNQaEF7KGHTgMG", "BMSLoader", undefined);

      /**
       * resource loader by
       * Edwin Liang
       * edwinliang.tw@gmail.com
       */
      _export("BMSLoader", BMSLoader = class BMSLoader {
        static loadBMS(remoteUrlBase, bmsFileName) {
          return new Promise(resolve => {
            assetManager.loadRemote(remoteUrlBase + bmsFileName, (err, asset) => {
              this._remoteUrlBase = remoteUrlBase;
              this._bms = new (_crd && BMSParser === void 0 ? (_reportPossibleCrUseOfBMSParser({
                error: Error()
              }), BMSParser) : BMSParser)().parse(asset['_file']);
              resolve(this._bms);
            });
          });
        }

        static async loadImages(progress) {
          let promise = [];
          let bmpSFs = {
            counter: 0
          };
          Object.keys(this._bms.bmp).forEach((key, idx, keys) => {
            promise.push(this.loadImage(bmpSFs, key, keys.length, this._remoteUrlBase, this._bms.bmp[key], progress));
          });
          await Promise.all(promise);
          delete bmpSFs.counter;
          return Promise.resolve(bmpSFs);
        }

        static async loadSounds(progress) {
          let promise = [];
          let wavASs = {
            counter: 0
          };
          Object.keys(this._bms.wav).forEach((key, idx, keys) => {
            promise.push(this.loadSound(wavASs, key, keys.length, this._remoteUrlBase, this._bms.wav[key], progress));
          });
          await Promise.all(promise);
          delete wavASs.counter;
          return Promise.resolve(wavASs);
        }

        static loadImage(obj, key, len, baseUrl, filename, progress) {
          return new Promise(resolve => {
            assetManager.loadRemote(baseUrl + filename, (err, imageAsset) => {
              const spriteFrame = new SpriteFrame();
              const texture = new Texture2D();
              texture.image = imageAsset;
              spriteFrame.texture = texture;
              obj[key] = spriteFrame;
              progress && progress('image', ++obj.counter, len, filename);
              resolve(null);
            });
          });
        }

        static loadSound(obj, key, len, baseUrl, filename, progress) {
          return new Promise(resolve => {
            assetManager.loadRemote(baseUrl + filename, (err, audioClip) => {
              const audioSource = new AudioSource(audioClip.name);
              audioSource.clip = audioClip;
              obj[key] = audioSource;
              progress && progress('sound', ++obj.counter, len, filename);
              resolve(null);
            });
          });
        }

      });

      BMSLoader._bms = void 0;
      BMSLoader._remoteUrlBase = '';

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=013ac73c6eafc47724462d872cc1ea6b8256e9cd.js.map