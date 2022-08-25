import { _decorator, Component, Node, SpriteFrame, Layers, UITransform, UIOpacity, Sprite, assetManager, ImageAsset, Texture2D, AudioSource, tween, math } from 'cc';
import { BMSData } from './BMSData';
import { BMSLoader } from './BMSLoader';
const { ccclass, property } = _decorator;

/**
 * bms player by 
 * Edwin Liang
 * edwinliang.tw@gmail.com
 * (本版不含遊玩功能, 僅播放功能)
 */

@ccclass('BMSMain')
export class BMSMain extends Component {

    // 遊戲音樂包資訊
    private bms: BMSData; // 所有 bms 解碼資訊
    private bmpRC; // 圖片資訊
    private wavRC; // 聲音資訊
    private dataRC; // 播放資訊
    private barRC; // 遊戲音符出現資訊
    // 小節資訊
    private measureInfo;
    // 動畫視圖
    private displaySprite: Sprite;
    private displayTrans: UITransform;
    // 播放起始時間
    private startTime = 0;

    async onLoad() {

        // 所有 bms 音樂包下載處 (bms download place: https://www.bmsworld.nz/)
        // cranKy – J219, (147BPM Genre, Euro Beat ^^ Fan Made)
        // [youtube J219] https://www.youtube.com/watch?v=jp4cjU8NLZQ&width=1280&height=720
        // [download J219] https://mega.co.nz/#!yQoBmYib!X5dXTxxRjJEmz4isPQ402xFAfvWZ3ttXdtR8T1twBpk
        // 請自行用 vscode live server 架 server 放音樂包測試 
        let resourceURL = 'http://127.0.0.1:5500/cranky%20%5BEURO%20BEAT%5D%20J219/'

        // 產生遊戲歌曲相關資源
        this.bms = await BMSLoader.loadBMS(resourceURL, 'J219.bms') as any;
        this.bmpRC = await BMSLoader.loadImages((type, cur, total, filename) => {
            console.log(type, cur, '/', total, filename, 'loaded')
        });
        this.wavRC = await BMSLoader.loadSounds((type, cur, total, filename) => {
            console.log(type, cur, '/', total, filename, 'loaded')
        });
        this.dataRC = JSON.parse(JSON.stringify(this.bms.data));
        this.barRC = this.generateBarsWithDuration(this.bms.data, 2000);
        // 動畫視圖
        let { node, sp, trans, opacity } = this.createImage(null, this.node)
        this.displaySprite = sp;
        this.displayTrans = trans
        // 動畫迴圈
        this.loop = this.loop.bind(this)
        this.startTime = performance.now();
        requestAnimationFrame(this.loop);

        console.log(this.bms)
    }

    private loop() {
        const tDiff = performance.now() - this.startTime
        if (this.measureInfo) {
            // 圖像播放
            for (let i = 0, l = this.measureInfo.bmp.id.length; i < l; i++) {
                if (tDiff > this.measureInfo.bmp.timing[i]) {
                    let frame = this.bmpRC[this.measureInfo.bmp.id[i]];
                    this.displaySprite.spriteFrame = frame;
                    this.displayTrans.width = this.displayTrans.height = 640;
                    this.measureInfo.bmp.id.shift();
                    this.measureInfo.bmp.timing.shift();
                    i--;
                    l--;
                } else break;
            }
            // 聲音播放
            for (let i = 0, l = this.measureInfo.wav.id.length; i < l; i++) {
                if (tDiff > this.measureInfo.wav.timing[i]) {
                    let audio = this.wavRC[this.measureInfo.wav.id[i]];
                    audio.playOneShot(audio.clip, 1);
                    this.measureInfo.wav.id.shift();
                    this.measureInfo.wav.timing.shift();
                    i--;
                    l--;
                } else break;
            }
            // 音符播放
            for (let j = 0, jl = this.measureInfo.note.key.length; j < jl; j++) {
                let key = this.measureInfo.note.key[j];
                for (let i = 0, l = key.id.length; i < l; i++) {
                    if (tDiff > key.timing[i]) {
                        let audio = this.wavRC[key.id[i]];
                        audio.playOneShot(audio.clip, 1);
                        key.id.shift();
                        key.timing.shift();
                        i--;
                        l--;
                    } else break;
                }
            }
            // 確認音符播放完畢 keyslen == 0
            let keyslen = this.measureInfo.note.key.map(info => info.length).reduce((i, s) => i + s);
            // 聲音圖像播完換下一小節
            if (!this.measureInfo.wav.id.length && !this.measureInfo.bmp.id.length && !keyslen) {
                this.dataRC.shift();
                this.measureInfo = null;
            }
        }
        // 取得小節資訊
        if (!this.measureInfo) {
            for (let i = 0, l = this.dataRC.length; i < l; i++) {
                let info = this.dataRC[i]
                if (tDiff > info.timing) {
                    this.measureInfo = info;
                    i--;
                    l--;
                } else break;
            }
        }
        // 音符在指定時間出現
        for (let j = 0, jl = this.barRC.length; j < jl; j++) {
            let bar = this.barRC[j]
            for (let i = 0, l = bar.id.length; i < l; i++) {
                if (tDiff > bar.timing[i]) {
                    let { node, sp, trans, opacity } = this.createImage(this.bmpRC[0], this.node);
                    trans.width = 50;
                    trans.height = 20;
                    let x = trans.width * j - 640 * .5 + 100
                    node.setPosition(x, 1136 * .5)
                    tween(node).to(2, { position: new math.Vec3(x, -1136 * .5 + 100) }, { easing: "linear" })
                        .call(() => {
                            this.node.removeChild(node);
                        })
                        .start();
                    bar.id.shift();
                    bar.timing.shift();
                    i--;
                    l--;
                } else break;
            }
        }
        requestAnimationFrame(this.loop)
    }

    /**
     * 音符出現資源設定 (所有音符提早 duration 時間出現)
     * @param data bms.data
     * @param duration 音符出現時間設定 (毫秒)
     * @returns 
     */
    private generateBarsWithDuration(data, duration) {
        const keyArr = data.map(d => d.note.key)
        let timing = {}
        let id = {}
        let result = []
        for (let j = 0, jl = keyArr.length; j < jl; j++) {
            const keys = keyArr[j]
            for (let i = 0, il = keys.length; i < il; i++) {
                timing[i] = timing[i] || []
                timing[i] = [...timing[i], ...keys[i].timing]
                id[i] = id[i] || []
                id[i] = [...id[i], ...keys[i].id]
            }
        }
        Object.keys(timing).forEach(tk => result.push({ id: id[tk], timing: timing[tk].map(t => t - duration) }))
        return result;
    }

    /**
     * 動態產生圖在容器裡
     * @param sf SpriteFrame
     * @param container 父容器
     * @param alpha 透明度
     * @returns 
     */
    private createImage(sf: SpriteFrame, container: Node, alpha: number = 255) {
        let node = new Node;
        node.layer = Layers.Enum.UI_2D;
        let trans = node.addComponent(UITransform)
        let opacity = node.addComponent(UIOpacity)
        opacity.opacity = alpha;
        let sp = node.addComponent(Sprite);
        sp.spriteFrame = sf;
        container.addChild(node);
        return { node, sp, trans, opacity };
    }
}

