import { BMSData } from "./BMSData"

/**
 * https://github.com/bokuweb/bmsjs/
 * bmsjs typescript version recoded by
 * Edwin Liang
 * edwinliang.tw@gmail.com
 */
export class BMSParser {

    private bms: BMSData
    private wavMessages

    // 主解析函式
    parse(rawText) {
        this.bms = new BMSData;
        this.wavMessages = []
        rawText.split('\n').forEach(row => this._parse(row));
        this._modifyAfterParse();
        this.bms.bpms[0] = {
            timing: 0,
            val: this.bms.bpm
        };
        this._serialize(this.bms.bpms, "bpm", this.bms.data);
        this._serialize(this.bms.animations, "bmp", this.bms.data);
        this._serialize(this.bms.bgms, "wav", this.bms.data);
        this._serialize(this.bms.stopTiming, "stop", this.bms.data);
        this.bms.totalNote = this._calcTotalNote();
        if (this.bms.total == null) {
            this.bms.total = 200 + this.bms.totalNote;
        }
        return this.bms;
    }

    private _parse(row: string) {

        // #開頭才是有用的資訊, 程式才往下跑
        if (row.substring(0, 1) !== '#') {
            return;
        }
        // 比對聲音資訊返回聲音清單
        let wav = /^#WAV(\w{2}) +(.*)/.exec(row);
        if (wav != null) {
            this._parseWAV(wav);
            return;
        }
        // 比對圖片索引返回圖片清單
        let bmp = /^#BMP(\w{2}) +(.*)/.exec(row);
        if (bmp != null) {
            this._parseBMP(bmp);
            return;
        }
        // 比對停止資訊返回停止資訊清單
        let stop = /^#STOP(\w{2}) +(.*)/.exec(row);
        if (stop != null) {
            this._parseSTOP(stop);
            return;
        }
        // 比對BPM資訊返回BPM資訊清單
        let exbpm = /^#BPM(\w{2}) +(.*)/.exec(row);
        if (exbpm != null) {
            this._parseBPM(exbpm);
            return;
        }
        // 比對Channel資訊返回Channel資訊清單
        let channelMsg = /^#([0-9]{3})([0-9]{2}):([\w\.]+)/.exec(row);
        if (channelMsg != null) {
            this._parseChannelMsg(channelMsg);
            return;
        }
        // 比對Property資訊返回Property資訊清單 (HEADER基本資訊)
        let property = /^#(\w+) +(.+)/.exec(row);
        if (property != null) {
            this._parseProperty(property);
        }
    }
    private _parseWAV(wav) {
        // 正規表達式回傳陣列前兩個值作為 k v
        return this.bms.wav[parseInt(wav[1], 36)] = wav[2];
    }
    private _parseBMP(bmp) {
        // 正規表達式回傳陣列前兩個值作為 k v
        return this.bms.bmp[parseInt(bmp[1], 36)] = bmp[2];
    }
    private _parseSTOP(stop) {
        // 正規表達式回傳陣列前兩個值作為 k v
        return this.bms.stop[parseInt(stop[1], 36)] = stop[2];
    }
    private _parseBPM(exbpm) {
        // 正規表達式回傳陣列前兩個值作為 k v
        return this.bms.exbpm[parseInt(exbpm[1], 36)] = exbpm[2];
    }
    private _parseProperty(property) {
        // 正規表達式回傳陣列前兩個值作為 k v
        return this.bms[property[1].toLowerCase()] = property[2];
    }
    private _parseChannelMsg(msg) {
        // 第幾小節
        let measureNum = parseInt(msg[1]);
        // 第幾channel
        let ch = parseInt(msg[2]);
        // channel資料
        let data = msg[3];
        // 建立空資料結構
        if (this.bms.data[measureNum] == null) {
            this.bms.data[measureNum] = this._createBar();
        }
        switch (ch) {
            case 1: // 儲存 wav 資訊
                return this._storeWAV(data, this.bms.data[measureNum].wav, measureNum);
            case 2: // 儲存 meter 節拍
                let meter = parseFloat(data);
                if (meter > 0) {
                    return this.bms.data[measureNum].meter = meter;
                }
                break;
            case 3: // 儲存 bpm 資訊
                return this._storeBPM(data, this.bms.data[measureNum].bpm);
            case 4: // 儲存 圖片
                return this._storeData(data, this.bms.data[measureNum].bmp);
            case 8: // 儲存 bpm 資訊
                return this._storeEXBPM(data, this.bms.data[measureNum].bpm);
            case 9: // 儲存 暫停
                return this._storeSTOP(data, this.bms.data[measureNum].stop);
            case 11:
            case 12:
            case 13:
            case 14:
            case 15: // 儲存 note 資訊
                return this._storeData(data, this.bms.data[measureNum].note.key[ch - 11]);
            case 16:
            case 17: // 儲存 note 資訊
                return this._storeData(data, this.bms.data[measureNum].note.key[ch - 9]);
            case 18:
            case 19: // 儲存 note 資訊
                return this._storeData(data, this.bms.data[measureNum].note.key[ch - 13]);
        }
    }

    private _createBar() {
        return {
            timing: 0.0,
            wav: {
                message: [],
                timing: [],
                id: []
            },
            bmp: {
                message: [],
                timing: [],
                id: []
            },
            bpm: {
                message: [],
                timing: [],
                val: []
            },
            stop: {
                message: [],
                timing: [],
                id: []
            },
            meter: 1.0,
            note: {
                key: JSON.parse(JSON.stringify(Array(9).fill({
                    message: [],
                    timing: [],
                    id: []
                })))
            }
        };
    }

    /** store */
    private _storeWAV(msg, array, measureNum) {
        this.wavMessages[measureNum] = this.wavMessages[measureNum] || [];
        let results = [];
        for (let i = 0, l = msg.length; i < l; i += 2)
            results.push(parseInt(msg.slice(i, i + 2), 36));
        return this.wavMessages[measureNum].push(results);
    }
    private _storeData(msg, array) {
        let results = [];
        for (let i = 0, l = msg.length; i < l; i += 2)
            results.push(parseInt(msg.slice(i, i + 2), 36));
        return array.message = this._merge(array.message, results);
    }
    private _storeSTOP(msg, array) {
        let results = [];
        for (let i = 0, l = msg.length; i < l; i += 2)
            results.push(parseInt(msg.slice(i, i + 2), 36));
        return array.message = this._merge(array.message, results);
    }
    private _storeBPM(msg, bpm) {
        let results = [];
        for (let i = 0, l = msg.length; i < l; i += 2)
            results.push(parseInt(msg.slice(i, i + 2), 36));
        return bpm.message = results;
    }
    private _storeEXBPM(msg, bpm) {
        let results = [];
        for (let i = 0, l = msg.length; i < l; i += 2) {
            if (this.bms.exbpm[parseInt(msg.slice(i, i + 2), 16)] != null) {
                results.push(parseFloat(this.bms.exbpm[parseInt(msg.slice(i, i + 2), 16)]));
            } else {
                results.push(0);
            }
        }
        return bpm.message = results
    }

    /** tool */
    _lcm = (a, b) => {
        const gcm = (x, y) => y === 0 ? x : gcm(y, x % y)
        return a / gcm(a, b) * b;
    }

    // ex. expand([1,2,3],6) == [1,0,2,0,3,0]
    _expand = function (array, length) {
        if (array.length === 0)
            return Array(length).fill(0);
        let interval = length / array.length;
        let results = [];
        for (let i = 0; i < length; i++)
            results.push(i % interval === 0 ? array[i / interval] : 0);
        return results;
    }

    // ex. merge([1,2,3], [0,4,0]) == [1,4,3]
    _merge = function (ary1, ary2) {
        if (ary1.length === 0) return ary2;
        let lcm = this._lcm(ary1.length, ary2.length);
        let ret = this._expand(ary1, lcm);
        let ref = this._expand(ary2, lcm);
        for (let i = 0, l = ref.length; i < l; i++) {
            let value = ref[i];
            if (value === 0) continue;
            ret[i] = value;
        }
        return ret;
    }

    // 解析整體後修復時間等
    private _modifyAfterParse() {
        let bpm = parseFloat(this.bms.bpm);
        let data = this.bms.data;
        let time = 0;
        let results = [];
        for (let i = 0, dl = data.length; i < dl; i++) {
            let bar = data[i];
            if (bar == null) {
                this.bms.data[i] = this._createBar();
                this.bms.data[i].timing = time;
                time += 240000 / bpm;
                continue;
            }
            bar.timing = time;
            if (bar.bpm.message.length === 0)
                bar.bpm.message = [0];
            this._noteTiming(time, bar, bpm);
            this._bmpTiming(time, bar, bpm);
            this._stopTiming(time, bar, bpm);
            this._wavTiming(time, bar, bpm, this.wavMessages[i]);
            let timeList = [];
            for (let j = 0, ml = bar.bpm.message.length; j < ml; j++) {
                let val = bar.bpm.message[j];
                if (val !== 0) {
                    bar.bpm.val.push(val);
                    bar.bpm.timing.push(time);
                    bpm = val;
                }
                time += (240000 / bpm) * (1 / ml) * bar.meter
                timeList.push(time);
            }
            results.push(timeList);
        }
        return results;
    }
    // 出現時間計算
    private _calcTiming(time, objects, bpmobj, bpm, meter) {
        let bl = bpmobj.message.length;
        let ol = objects.message.length;
        let lcm = this._lcm(bl, ol);
        let bpms = this._expand(bpmobj.message, lcm);
        let objs = this._expand(objects.message, lcm);
        let t = 0;
        let b = bpm;
        objects.timing = [];
        objects.id = [];
        for (let i = 0, l = bpms.length; i < l; i++) {
            let val = bpms[i];
            if (objs[i] !== 0) {
                objects.timing.push(time + t);
                objects.id.push(objs[i]);
                if (this.bms.endTime < time + t) {
                    this.bms.endTime = time + t;
                }
            }
            if (val !== 0) {
                b = val;
            }
            t += (240000 / b) * (1 / lcm) * meter;
        }
    }
    // 音符出現時間
    private _noteTiming(time, bar, bpm) {
        for (let i = 0, l = bar.note.key.length; i < l; i++) {
            let key = bar.note.key[i];
            if (key.message.length !== 0) {
                this._calcTiming(time, key, bar.bpm, bpm, bar.meter);
            }
        }
    }
    // 圖片出現時間
    private _bmpTiming(time, bar, bpm) {
        return this._calcTiming(time, bar.bmp, bar.bpm, bpm, bar.meter);
    }
    // 暫停出現時間
    private _stopTiming(time, bar, bpm) {
        return this._calcTiming(time, bar.stop, bar.bpm, bpm, bar.meter);
    }
    // 聲音出現時間
    private _wavTiming(time, bar, bpm, wavss) {
        if (wavss == null) return;
        let result = [];
        for (let i = 0, wl = wavss.length; i < wl; i++) {
            let ws = wavss[i];
            let lcm = this._lcm(bar.bpm.message.length, ws.length);
            let bpms = this._expand(bar.bpm.message, lcm);
            let wavs = this._expand(ws, lcm);
            let t = 0;
            let b = bpm;
            for (let j = 0, bl = bpms.length; j < bl; j++) {
                let val = bpms[j];
                if (wavs[j] !== 0) {
                    result.push({
                        timing: time + t,
                        id: wavs[j]
                    });
                    if (this.bms.endTime < time + t) {
                        this.bms.endTime = time + t;
                    }
                }
                if (val !== 0) {
                    b = val;
                }
                t += (240000 / b) * (1 / lcm) * bar.meter;
            }
        }
        let sorted = result.sort((a, b) => a.timing - b.timing);
        let results = [];
        for (let k = 0, sl = sorted.length; k < sl; k++) {
            let w = sorted[k];
            bar.wav.timing.push(w.timing);
            results.push(bar.wav.id.push(w.id));
        }
        return results;
    }
    // 資料序列化
    private _serialize(arr, name, bms_data) {
        let serialized = [];
        for (let i = 0, bl = bms_data.length; i < bl; i++) {
            let bmsData = bms_data[i];
            serialized.push((function () {
                let timing = bmsData[name].timing;
                let results = [];
                for (let j = 0, _len1 = timing.length; j < _len1; j++) {
                    let t = timing[j];
                    if (t != null) {
                        if (bmsData[name].val != null) {
                            results.push(arr.push({
                                timing: t,
                                val: bmsData[name].val[j]
                            }));
                        } else if (bmsData[name].id != null) {
                            results.push(arr.push({
                                timing: t,
                                id: bmsData[name].id[j]
                            }));
                        } else {
                            results.push(void 0);
                        }
                    }
                }
                return results;
            })());
        }
        return serialized;
    }
    // 計算音符數
    private _calcTotalNote() {
        return this.bms.data.reduce((t, d) => {
            return t + d.note.key.reduce((nt, k) => {
                return nt + k.id.length;
            }, 0);
        }, 0);
    }
}