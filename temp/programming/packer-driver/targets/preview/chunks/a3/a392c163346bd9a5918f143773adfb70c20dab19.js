System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, _decorator, Component, Node, Layers, UITransform, UIOpacity, Sprite, tween, math, BMSLoader, _dec, _class, _crd, ccclass, property, BMSMain;

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

  function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

  function _reportPossibleCrUseOfBMSData(extras) {
    _reporterNs.report("BMSData", "./BMSData", _context.meta, extras);
  }

  function _reportPossibleCrUseOfBMSLoader(extras) {
    _reporterNs.report("BMSLoader", "./BMSLoader", _context.meta, extras);
  }

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      _decorator = _cc._decorator;
      Component = _cc.Component;
      Node = _cc.Node;
      Layers = _cc.Layers;
      UITransform = _cc.UITransform;
      UIOpacity = _cc.UIOpacity;
      Sprite = _cc.Sprite;
      tween = _cc.tween;
      math = _cc.math;
    }, function (_unresolved_2) {
      BMSLoader = _unresolved_2.BMSLoader;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "f3c3boE4V9MKoaum9RB5MW9", "BMSMain", undefined);

      ({
        ccclass,
        property
      } = _decorator);
      /**
       * bms player by 
       * Edwin Liang
       * edwinliang.tw@gmail.com
       * (本版不含遊玩功能, 僅播放功能)
       */

      _export("BMSMain", BMSMain = (_dec = ccclass('BMSMain'), _dec(_class = class BMSMain extends Component {
        constructor() {
          super(...arguments);
          this.bms = void 0;
          this.bmpRC = void 0;
          this.wavRC = void 0;
          this.dataRC = void 0;
          this.barRC = void 0;
          this.measureInfo = void 0;
          this.displaySprite = void 0;
          this.displayTrans = void 0;
          this.startTime = 0;
        }

        onLoad() {
          var _this = this;

          return _asyncToGenerator(function* () {
            // 所有 bms 音樂包下載處 (bms download place: https://www.bmsworld.nz/)
            // cranKy – J219, (147BPM Genre, Euro Beat ^^ Fan Made)
            // [youtube J219] https://www.youtube.com/watch?v=jp4cjU8NLZQ&width=1280&height=720
            // [download J219] https://mega.co.nz/#!yQoBmYib!X5dXTxxRjJEmz4isPQ402xFAfvWZ3ttXdtR8T1twBpk
            // 請自行用 vscode live server 架 server 放音樂包測試 
            var resourceURL = 'http://127.0.0.1:5500/cranky%20%5BEURO%20BEAT%5D%20J219/'; // 產生遊戲歌曲相關資源

            _this.bms = yield (_crd && BMSLoader === void 0 ? (_reportPossibleCrUseOfBMSLoader({
              error: Error()
            }), BMSLoader) : BMSLoader).loadBMS(resourceURL, 'J219.bms');
            _this.bmpRC = yield (_crd && BMSLoader === void 0 ? (_reportPossibleCrUseOfBMSLoader({
              error: Error()
            }), BMSLoader) : BMSLoader).loadImages((type, cur, total, filename) => {
              console.log(type, cur, '/', total, filename, 'loaded');
            });
            _this.wavRC = yield (_crd && BMSLoader === void 0 ? (_reportPossibleCrUseOfBMSLoader({
              error: Error()
            }), BMSLoader) : BMSLoader).loadSounds((type, cur, total, filename) => {
              console.log(type, cur, '/', total, filename, 'loaded');
            });
            _this.dataRC = JSON.parse(JSON.stringify(_this.bms.data));
            _this.barRC = _this.generateBarsWithDuration(_this.bms.data, 2000); // 動畫視圖

            var {
              node,
              sp,
              trans,
              opacity
            } = _this.createImage(null, _this.node);

            _this.displaySprite = sp;
            _this.displayTrans = trans; // 動畫迴圈

            _this.loop = _this.loop.bind(_this);
            _this.startTime = performance.now();
            requestAnimationFrame(_this.loop);
            console.log(_this.bms);
          })();
        }

        loop() {
          var _this2 = this;

          var tDiff = performance.now() - this.startTime;

          if (this.measureInfo) {
            // 圖像播放
            for (var i = 0, l = this.measureInfo.bmp.id.length; i < l; i++) {
              if (tDiff > this.measureInfo.bmp.timing[i]) {
                var frame = this.bmpRC[this.measureInfo.bmp.id[i]];
                this.displaySprite.spriteFrame = frame;
                this.displayTrans.width = this.displayTrans.height = 640;
                this.measureInfo.bmp.id.shift();
                this.measureInfo.bmp.timing.shift();
                i--;
                l--;
              } else break;
            } // 聲音播放


            for (var _i = 0, _l = this.measureInfo.wav.id.length; _i < _l; _i++) {
              if (tDiff > this.measureInfo.wav.timing[_i]) {
                var audio = this.wavRC[this.measureInfo.wav.id[_i]];
                audio.playOneShot(audio.clip, 1);
                this.measureInfo.wav.id.shift();
                this.measureInfo.wav.timing.shift();
                _i--;
                _l--;
              } else break;
            } // 音符播放


            for (var j = 0, jl = this.measureInfo.note.key.length; j < jl; j++) {
              var key = this.measureInfo.note.key[j];

              for (var _i2 = 0, _l2 = key.id.length; _i2 < _l2; _i2++) {
                if (tDiff > key.timing[_i2]) {
                  var _audio = this.wavRC[key.id[_i2]];

                  _audio.playOneShot(_audio.clip, 1);

                  key.id.shift();
                  key.timing.shift();
                  _i2--;
                  _l2--;
                } else break;
              }
            } // 確認音符播放完畢 keyslen == 0


            var keyslen = this.measureInfo.note.key.map(info => info.length).reduce((i, s) => i + s); // 聲音圖像播完換下一小節

            if (!this.measureInfo.wav.id.length && !this.measureInfo.bmp.id.length && !keyslen) {
              this.dataRC.shift();
              this.measureInfo = null;
            }
          } // 取得小節資訊


          if (!this.measureInfo) {
            for (var _i3 = 0, _l3 = this.dataRC.length; _i3 < _l3; _i3++) {
              var info = this.dataRC[_i3];

              if (tDiff > info.timing) {
                this.measureInfo = info;
                _i3--;
                _l3--;
              } else break;
            }
          } // 音符在指定時間出現


          for (var _j = 0, _jl = this.barRC.length; _j < _jl; _j++) {
            var bar = this.barRC[_j];

            for (var _i4 = 0, _l4 = bar.id.length; _i4 < _l4; _i4++) {
              if (tDiff > bar.timing[_i4]) {
                (function () {
                  var {
                    node,
                    sp,
                    trans,
                    opacity
                  } = _this2.createImage(_this2.bmpRC[0], _this2.node);

                  trans.width = 50;
                  trans.height = 20;
                  var x = trans.width * _j - 640 * .5 + 100;
                  node.setPosition(x, 1136 * .5);
                  tween(node).to(2, {
                    position: new math.Vec3(x, -1136 * .5 + 100)
                  }, {
                    easing: "linear"
                  }).call(() => {
                    _this2.node.removeChild(node);
                  }).start();
                  bar.id.shift();
                  bar.timing.shift();
                  _i4--;
                  _l4--;
                })();
              } else break;
            }
          }

          requestAnimationFrame(this.loop);
        }
        /**
         * 音符出現資源設定 (所有音符提早 duration 時間出現)
         * @param data bms.data
         * @param duration 音符出現時間設定 (毫秒)
         * @returns 
         */


        generateBarsWithDuration(data, duration) {
          var keyArr = data.map(d => d.note.key);
          var timing = {};
          var id = {};
          var result = [];

          for (var j = 0, jl = keyArr.length; j < jl; j++) {
            var keys = keyArr[j];

            for (var i = 0, il = keys.length; i < il; i++) {
              timing[i] = timing[i] || [];
              timing[i] = [...timing[i], ...keys[i].timing];
              id[i] = id[i] || [];
              id[i] = [...id[i], ...keys[i].id];
            }
          }

          Object.keys(timing).forEach(tk => result.push({
            id: id[tk],
            timing: timing[tk].map(t => t - duration)
          }));
          return result;
        }
        /**
         * 動態產生圖在容器裡
         * @param sf SpriteFrame
         * @param container 父容器
         * @param alpha 透明度
         * @returns 
         */


        createImage(sf, container, alpha) {
          if (alpha === void 0) {
            alpha = 255;
          }

          var node = new Node();
          node.layer = Layers.Enum.UI_2D;
          var trans = node.addComponent(UITransform);
          var opacity = node.addComponent(UIOpacity);
          opacity.opacity = alpha;
          var sp = node.addComponent(Sprite);
          sp.spriteFrame = sf;
          container.addChild(node);
          return {
            node,
            sp,
            trans,
            opacity
          };
        }

      }) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=a392c163346bd9a5918f143773adfb70c20dab19.js.map