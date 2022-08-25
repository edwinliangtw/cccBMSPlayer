System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, assetManager, AudioSource, SpriteFrame, Texture2D, BMSParser, BMSLoader, _crd;

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

  function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

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

        static loadImages(progress) {
          var _this = this;

          return _asyncToGenerator(function* () {
            var promise = [];
            var bmpSFs = {
              counter: 0
            };
            Object.keys(_this._bms.bmp).forEach((key, idx, keys) => {
              promise.push(_this.loadImage(bmpSFs, key, keys.length, _this._remoteUrlBase, _this._bms.bmp[key], progress));
            });
            yield Promise.all(promise);
            delete bmpSFs.counter;
            return Promise.resolve(bmpSFs);
          })();
        }

        static loadSounds(progress) {
          var _this2 = this;

          return _asyncToGenerator(function* () {
            var promise = [];
            var wavASs = {
              counter: 0
            };
            Object.keys(_this2._bms.wav).forEach((key, idx, keys) => {
              promise.push(_this2.loadSound(wavASs, key, keys.length, _this2._remoteUrlBase, _this2._bms.wav[key], progress));
            });
            yield Promise.all(promise);
            delete wavASs.counter;
            return Promise.resolve(wavASs);
          })();
        }

        static loadImage(obj, key, len, baseUrl, filename, progress) {
          return new Promise(resolve => {
            assetManager.loadRemote(baseUrl + filename, (err, imageAsset) => {
              var spriteFrame = new SpriteFrame();
              var texture = new Texture2D();
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
              var audioSource = new AudioSource(audioClip.name);
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
//# sourceMappingURL=e8488c71d900d4f8971f24786065c7dbbd7efbd7.js.map