import { Asset, assetManager, AudioSource, ImageAsset, resources, SpriteFrame, Texture2D } from "cc";
import { BMSData } from "./BMSData";
import { BMSParser } from "./BMSParser";

/**
 * resource loader by
 * Edwin Liang
 * edwinliang.tw@gmail.com
 */

export class BMSLoader {

    private static _bms: BMSData;
    private static _remoteUrlBase = ''

    public static loadBMS(remoteUrlBase: string, bmsFileName: string) {
        return new Promise(resolve => {
            assetManager.loadRemote<Asset>(remoteUrlBase + bmsFileName, (err, asset) => {
                this._remoteUrlBase = remoteUrlBase;
                this._bms = (new BMSParser).parse(asset['_file']) as BMSData;
                resolve(this._bms);
            });
        });
    }

    public static async loadImages(progress) {
        let promise = []
        let bmpSFs = { counter: 0 }
        Object.keys(this._bms.bmp).forEach((key, idx, keys) => {
            promise.push(this.loadImage(bmpSFs, key, keys.length, this._remoteUrlBase, this._bms.bmp[key], progress))
        })
        await Promise.all(promise)
        delete bmpSFs.counter
        return Promise.resolve(bmpSFs)
    }

    public static async loadSounds(progress) {
        let promise = []
        let wavASs = { counter: 0 }
        Object.keys(this._bms.wav).forEach((key, idx, keys) => {
            promise.push(this.loadSound(wavASs, key, keys.length, this._remoteUrlBase, this._bms.wav[key], progress))
        })
        await Promise.all(promise)
        delete wavASs.counter
        return Promise.resolve(wavASs)
    }

    private static loadImage(obj, key, len, baseUrl, filename, progress) {
        return new Promise(resolve => {
            assetManager.loadRemote<ImageAsset>(baseUrl + filename, (err, imageAsset) => {
                const spriteFrame = new SpriteFrame();
                const texture = new Texture2D();
                texture.image = imageAsset;
                spriteFrame.texture = texture;
                obj[key] = spriteFrame;
                progress && progress('image', ++obj.counter, len, filename);
                resolve(null)
            });
        })
    }

    private static loadSound(obj, key, len, baseUrl, filename, progress) {
        return new Promise(resolve => {
            assetManager.loadRemote(baseUrl + filename, (err, audioClip) => {
                const audioSource = new AudioSource(audioClip.name)
                audioSource.clip = audioClip;
                obj[key] = audioSource
                progress && progress('sound', ++obj.counter, len, filename);
                resolve(null)
            });
        })
    }
}