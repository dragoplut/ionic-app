import { Injectable } from '@angular/core';
import { ApiService, BleService, UtilService } from '../index';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import * as moment from 'moment';
import EventEmitter from 'events';

import { T_DEVICE_INTERFACE } from '../../app/types';
import { CHAR_ELEM } from '../../app/constants';

// noinspection TypeScriptCheckImport
import * as _ from 'lodash';

@Injectable()
export class PenService {

  public bleWriteEmitter: EventEmitter = new EventEmitter();

  public path: string = '/Pen';
  public penAllowedFields: string[] = [
    'id',
    'name',
    'serialNumber',
    'clinicId'
  ];

  public deviceInterface: T_DEVICE_INTERFACE = {
    services: [ '1800', '1801', 'a8a91000-38e9-4fbe-83f3-d82aae6ff68e', '180a' ],
    characteristics: [
      {
        name: '',
        service: '1800',
        characteristic: '2a00',
        properties: [ 'Read', 'Write' ]
      },
      {
        name: '',
        service: '1800',
        characteristic: '2a01',
        properties: [ 'Read' ]
      },
      {
        name: '',
        service: '1800',
        characteristic: '2a04',
        properties: [ 'Read' ]
      },
      {
        name: '',
        service: '1801',
        characteristic: '2a05',
        properties: [ 'Indicate' ],
        descriptors: [ { uuid: '2902' } ]
      },
      {
        type: 'uint8',
        name: 'Brightness',
        service: 'a8a91000-38e9-4fbe-83f3-d82aae6ff68e',
        characteristic: 'a8a91001-38e9-4fbe-83f3-d82aae6ff68e',
        properties: [ 'Read', 'Write' ]
      },
      {
        type: 'uint8',
        name: 'Volume',
        service: 'a8a91000-38e9-4fbe-83f3-d82aae6ff68e',
        characteristic: 'a8a91002-38e9-4fbe-83f3-d82aae6ff68e',
        properties: [ 'Read', 'Write' ]
      },
      // {
      //   type: 'fileRequest',
      //   name: 'File Request',
      //   service: 'a8a91000-38e9-4fbe-83f3-d82aae6ff68e',
      //   characteristic: 'a8a91003-38e9-4fbe-83f3-d82aae6ff68e',
      //   properties: [ 'Write' ]
      // },
      // {
      //   type: 'fileResponse',
      //   name: 'File Response',
      //   service: 'a8a91000-38e9-4fbe-83f3-d82aae6ff68e',
      //   characteristic: 'a8a91004-38e9-4fbe-83f3-d82aae6ff68e',
      //   properties: [ 'Read', 'Notify' ],
      //   descriptors: [ { uuid: '2902' } ]
      // },
      // {
      //   type: 'fileReadBuffer',
      //   name: 'File Read Buffer',
      //   service: 'a8a91000-38e9-4fbe-83f3-d82aae6ff68e',
      //   characteristic: 'a8a91005-38e9-4fbe-83f3-d82aae6ff68e',
      //   properties: [ 'Read', 'Notify' ],
      //   descriptors: [ { uuid: '2902' } ]
      // },
      // {
      //   type: 'fileWriteBuffer',
      //   name: 'File Write Buffer',
      //   service: 'a8a91000-38e9-4fbe-83f3-d82aae6ff68e',
      //   characteristic: 'a8a91006-38e9-4fbe-83f3-d82aae6ff68e',
      //   properties: [ 'WriteWithoutResponse', 'Write' ]
      // },
      // {
      //   type: 'uint8',
      //   name: 'Key Info',
      //   service: 'a8a91000-38e9-4fbe-83f3-d82aae6ff68e',
      //   characteristic: 'a8a91007-38e9-4fbe-83f3-d82aae6ff68e',
      //   properties: [ 'Read' ]
      // },
      {
        type: 'string',
        name: 'Manufacturer Name String',
        service: '180a',
        characteristic: '2a29',
        properties: [ 'Read' ]
      },
      {
        type: 'string',
        name: 'Model Number String',
        service: '180a',
        characteristic: '2a24',
        properties: [ 'Read' ]
      },
      {
        type: 'string',
        name: 'Serial Number String',
        service: '180a',
        characteristic: '2a25',
        properties: [ 'Read' ]
      },
      {
        type: 'string',
        name: 'Hardware Revision String',
        service: '180a',
        characteristic: '2a27',
        properties: [ 'Read' ]
      },
      {
        type: 'string',
        name: 'Firmware Revision String',
        service: '180a',
        characteristic: '2a26',
        properties: [ 'Read' ]
      },
      {
        type: 'string',
        name: 'Software Revision String',
        service: '180a',
        characteristic: '2a28',
        properties: [ 'Read' ]
      }
    ]
  };

  public penErrors: any = {
    0: {
      name: 'UNKNOWN_ERROR',
      description: 'Unexpected Error'
    },
    1: {
      name: 'MOTOR_ERROR',
      description: 'A high current was detected on the (speed) Motor'
    },
    2: {
      name: 'SERVO_ERROR',
      description: 'A high current was detected on the (depth) Servo'
    },
    3: {
      name: 'BATTERY_CRITICAL',
      description: 'The Battery level is critically low and the unit has been shut down.'
    },
    4: {
      name: 'SYNC_FAILURE',
      description: 'A Failure was encountered in the synchronization process'
    },
    5: {
      name: 'CARTRIDGE_CHECKSUM',
      description: 'A cartridge was detected which failed the checksum process'
    },
    6: {
      name: 'INVALID_USER',
      description: 'A cartridge was detected for a different User ID'
    },
    7: {
      name: 'CARTRIDGE_RUN_TIME',
      description: 'A cartridge has reached its maximum run time'
    },
    8: {
      name: 'CARTRIDGE_BLACKLIST',
      description: 'A cartridge has been detected and is on the black list.'
    }
  };

  public timeNowSeconds: number = moment().diff(moment().year(2017).startOf('year'), 'seconds');
  public dummyWhiteBlackList: number[] = [];
  public blackListEncrypted: number[] = [];
  public firmwareBuffer: any = [];
  public dummySettings: any[] = [
    123456,
    this.timeNowSeconds,
    this.timeNowSeconds + (24 * 60 * 60),
    this.timeNowSeconds + (7 * 24 * 60 * 60)
  ];

  public rawData: any = [];

  public buffWriteStatus: any = {
    idx: 0,
    lastConfirmedIdx: 0,
    lastRequestedIdx: 0,
    packCounter: 0,
    pauseStart: 0,
    bufferSize: 0,
    bufferFullTime: 0,
    iterationTimeMs: 0,
    transferStart: 0,
    data: [],
    status: 'ok',
    lock: false,
    died: false
  };

  public config: any = {
    packIdxStart: 2,
    packIdxEnd: 6,
    writeRetryTimeout: 1000
  };

  constructor(
    public _ble: BleService,
    public _util: UtilService,
    private api: ApiService
  ) {
    this.bleWriteEmitter.on('write', (bleWriteEmitter: any, item: any) => {
      const successStatus: number = 5;
      if (this.buffWriteStatus.lock || this.buffWriteStatus.died || this.buffWriteStatus.status === successStatus) {
        console.log('locked or died');
        return;
      }

      this._ble.write(
        item.address,
        { serviceUUID: item.serviceUUID, characteristicUUID: 'a8a91006-38e9-4fbe-83f3-d82aae6ff68e', type: 'fileWriteBuffer' },
        item.buffer,
        (done: any) => {
          if (this.buffWriteStatus.idx + 1 === this.buffWriteStatus.data.length) {
            console.log('wrote everything');
            this.buffWriteStatus.status = successStatus;
          } else if (!this.buffWriteStatus.bufferSize) {
            this.buffWriteStatus.idx += 1;
            let nextItem: any = item;
            nextItem.buffer = this.buffWriteStatus.data[this.buffWriteStatus.idx];
            if (this.buffWriteStatus.status !== successStatus && !this.buffWriteStatus.lock && !this.buffWriteStatus.died) {
              this.buffWriteStatus.transferStart = moment().valueOf();
              this.bleWriteEmitter.emit('write', this.bleWriteEmitter, nextItem);
              this.buffWriteStatus.packCounter++;
            }
          } else if (this.buffWriteStatus.idx < this.buffWriteStatus.lastConfirmedIdx + this.buffWriteStatus.bufferSize) {
            this.buffWriteStatus.idx += 1;
            const timeNow: number = moment().valueOf();
            let nextItem: any = item;
            nextItem.buffer = this.buffWriteStatus.data[this.buffWriteStatus.idx];
            if (this.buffWriteStatus.status !== successStatus && !this.buffWriteStatus.lock && !this.buffWriteStatus.died) {
              if (this.buffWriteStatus.bufferSize && this.buffWriteStatus.idx === this.buffWriteStatus.lastConfirmedIdx + this.buffWriteStatus.bufferSize - 1) {
                if (this.buffWriteStatus.bufferFullTime) {
                  this.buffWriteStatus.iterationTimeMs = timeNow - this.buffWriteStatus.bufferFullTime;
                }
                this.buffWriteStatus.bufferFullTime = timeNow;
              }
              this.bleWriteEmitter.emit('write', this.bleWriteEmitter, nextItem);
            }
          }
        },
        (err: any) => {
          console.log('bleWriteEmitter this._ble.write err: ', err, ' index failed: ', this.buffWriteStatus.idx);
          if (this.buffWriteStatus.status !== 5) {
            this.bleWriteEmitter.emit('pause');
            const errPackIdx: number = this.buffWriteStatus.idx;
            let nextItem: any = _.clone(item);
            setTimeout(() => {
              console.log('Write retry invoke: ', errPackIdx > this.buffWriteStatus.lastConfirmedIdx, ' from index ', errPackIdx, ' last confirmed: ', this.buffWriteStatus.lastConfirmedIdx, ' last resume: ', this.buffWriteStatus.lastRequestedIdx);
              if (errPackIdx > this.buffWriteStatus.lastConfirmedIdx && this.buffWriteStatus.status !== successStatus && !this.buffWriteStatus.died) {
                nextItem.buffer = this.buffWriteStatus.data[errPackIdx];
                this.buffWriteStatus.lock = false;
                this.bleWriteEmitter.emit('write', this.bleWriteEmitter, nextItem);
                console.log('Buffer transfer write retry from index: ', errPackIdx);
              }
            }, this.config.writeRetryTimeout);
          }
        }
      );
    });

    this.bleWriteEmitter.on('pause', () => {
      this.buffWriteStatus.lock = true;
      this.buffWriteStatus.lockIndex = this.buffWriteStatus.idx + (this.buffWriteStatus.bufferSize || 64);
      this.buffWriteStatus.pauseStart = moment().valueOf();

      setTimeout(() => {
        if (this.buffWriteStatus.lock && this.buffWriteStatus.lockIndex < this.buffWriteStatus.idx) {
          this.buffWriteStatus.died = true;
          this.bleWriteEmitter.emit('error', 'died waiting for resume');
        }
      }, 5000);
    });

    this.bleWriteEmitter.on('resume', (bleWriteEmitter: any, item: any, resumeIndex: number) => {
      const successStatus: number = 5;
      if (this.buffWriteStatus.died) {
        console.log('already decided that we died waiting');
        return;
      }

      this.buffWriteStatus.lock = false;
      this.buffWriteStatus.idx = resumeIndex;
      this.buffWriteStatus.pauseStart = 0;

      if (!this.buffWriteStatus.bufferSize && this.buffWriteStatus.packCounter) {
        this.buffWriteStatus.bufferSize = resumeIndex;
      }

      let nexItem: any = _.clone(item);
      nexItem.buffer = this.buffWriteStatus.data[resumeIndex];
      if (this.buffWriteStatus.status !== successStatus) {
        this.buffWriteStatus.lastRequestedIdx = resumeIndex;
        this.bleWriteEmitter.emit('write', bleWriteEmitter, nexItem);
      }
    });

    this.bleWriteEmitter.on('error', (err: any) => {
      this.buffWriteStatus.died = true;
      console.log('error happened: ', err);
    });
  }

  public registerPen(data: any): Observable<any> {
    const penData: any = _.pick(data, this.penAllowedFields);
    // {
    //   "serialNumber": "string",
    //   "clinicId": 0
    // }
    return this.api.post(`${this.path}/register`, penData);
  }

  // public updatePen(data: any): Observable<any> {
  //   // const penData: any = _.pick(data, this.penAllowedFields);
  //   // {
  //   //   "id": 0,
  //   //   "serialNumber": "string"
  //   // }
  //   return this.api.post(`${this.path}/update`, data);
  // }

  public getPens(): Observable<any> {
    /** Resp example **/
    // [
    //   {
    //     "id": 0,
    //     "serialNumber": "string"
    //   }
    // ]
    return this.api.get(`${this.path}/pens`)
      .map((res: any) => res);
  }

  public getSettings(serialNumber: string): Observable<any> {
    /** Resp example **/
    // {
    //   "userId": 0,
    //   "currentDateTime": 0,
    //   "warmDateTime": 0,
    //   "forceDateTime": 0
    // }
    return this.api.get(`${this.path}/getSettings?serialNumber=${serialNumber}`)
      .map((res: any) => res);
  }

  public getSettingsEncrypted(serialNumber: string, keyInfo: any[]): Observable<any> {
    let keyInfoStr: string = '';
    keyInfo.forEach((n: number) => {
      keyInfoStr = keyInfoStr + '&keyInfo=' + n;
    });
    return this.api.get(`${this.path}/getSettingsEncrypted?serialNumber=${serialNumber}${keyInfoStr}`)
      .map((res: any) => res);
  }

  public getPenSearch(search?: string): Observable<any> {
    /** Resp example **/
    // [
    //   {
    //     "id": 0,
    //     "serialNumber": "string"
    //   }
    // ]
    return this.api.get(`${this.path}/pensSearch?search=${search}`)
      .map((res: any) => res);
  }

  public getWhitelist(): Observable<any> {
    /** Resp example **/
    // [0,0,1,1,2,200]
    return this.api.get(`${this.path}/getWhitelist`)
      .map((res: any) => res);
  }

  public getTemporaryWhitelist(): Observable<any> {
    /** Resp example **/
    // [0,0,1,1,2,200]
    return this.api.get(`${this.path}/getTemporaryWhitelist`)
      .map((res: any) => res);
  }

  public addTemporaryWhitelist(data: any[]): Observable<any> {
    /** Resp example **/
    // [0,0,1,1,2,200]
    return this.api.post(`${this.path}/addTemporaryWhitelist`, data)
      .map((res: any) => res);
  }

  // public updateWhiteBlacklist(data: number[]): Observable<any> {
  //   /** Resp example **/
  //   // [0,2,1,8,3,200]
  //   return this.api.post(`${this.path}/getWhiteBlacklist`, data)
  //     .map((res: any) => res);
  // }

  public updateWhiteBlacklistEncrypted(data: number[], keyInfo: number[]): Observable<any> {
    /** Resp example **/
    // [0,2,1,8,3,200]
    let keyInfoStr: string = '?';
    let keyInfoArr: number[] = [];
    keyInfo.forEach((n: number) => {
      keyInfoStr = keyInfoStr + (keyInfoStr.length > 1 ? '&keyInfo=' : 'keyInfo=') + n;
      keyInfoArr.push(n);
    });
    return this.api.post(`${this.path}/getEncodedAndEncryptedFlatWhiteBlacklist${keyInfoStr}`, keyInfoArr)
      .map((res: any) => res);
  }

  // public saveSyncListData(data: any): Observable<any> {
  //   return this.api.post(`${this.path}/saveSyncListData`, data)
  //     .map((res: any) => res);
  // }

  public saveSyncData(data: any): Observable<any> {
    return this.api.post(`${this.path}/saveSyncData`, data)
      .map((res: any) => res);
  }

  public deletePen(id: string | number): Observable<any> {
    return this.api.post(`${this.path}/delete`, { id });
  }

  public writeWithResponse(address: string, item: any, rawData: any, success: any, fail: any, progressInfo?: any) {

    if (item && item.device && item.device.settings) {
      this.dummySettings = item.device.settings;
    }
    if (item && item.device && item.device.blackListEncrypted) {
      this.blackListEncrypted = item.device.blackListEncrypted;
    }
    if (item && item.device && item.device.dataBuffer) {
      this.firmwareBuffer = item.device.dataBuffer;
    }

    if (rawData && rawData.length) {
      switch (rawData[CHAR_ELEM.action]) {
        case CHAR_ELEM.read.action.write:
          this._ble.startNotification(
            address,
            { serviceUUID: item.serviceUUID, characteristicUUID: 'a8a91004-38e9-4fbe-83f3-d82aae6ff68e', type: item.type },
            (data: any) => this.onFileResponse(data, address, item, rawData, success, progressInfo),
            (err: any) => this._ble.stopNotification(address, { serviceUUID: item.serviceUUID, characteristicUUID: 'a8a91004-38e9-4fbe-83f3-d82aae6ff68e' }, true, err));
          break;
        case CHAR_ELEM.read.action.read:
          this._ble.startNotification(
            address,
            { serviceUUID: item.serviceUUID, characteristicUUID: 'a8a91005-38e9-4fbe-83f3-d82aae6ff68e', type: item.type },
            (data: any) => this.onData(data, address, item, rawData, success),
            (err: any) => this._ble.stopNotification(address, { serviceUUID: item.serviceUUID, characteristicUUID: 'a8a91005-38e9-4fbe-83f3-d82aae6ff68e' }, true, err));
          break;
        default:
          break;
      }
    }

    if (rawData[CHAR_ELEM.action] === CHAR_ELEM.read.action.write) {
      switch (rawData[CHAR_ELEM.file]) {
        case CHAR_ELEM.read.file.black_list:
          rawData[CHAR_ELEM.size] = this.blackListEncrypted.length;
          break;
        case CHAR_ELEM.read.file.firmware_image:
        case CHAR_ELEM.read.file.settings:
          rawData[CHAR_ELEM.size] = item.device.dataBytesLength;
          break;
      }
    }

    if (rawData[CHAR_ELEM.action] === CHAR_ELEM.read.action.write) {
      switch (rawData[CHAR_ELEM.file]) {
        case CHAR_ELEM.read.file.black_list:
          const blackListData: any = this._util.getBufferChunksOf(item.device.blackListEncrypted);
          this.buffWriteStatus.data = blackListData.buffer;

          break;
        case CHAR_ELEM.read.file.firmware_image:
          this.buffWriteStatus.data = item.device.dataBuffer;
          break;
        case CHAR_ELEM.read.file.settings:
          const settingsData: any = this._util.getBufferChunksOf(item.device.deviceSettingsEncrypted);
          this.buffWriteStatus.data = settingsData.buffer;
          break;
      }
    }

    this._ble.write(
      address,
      { serviceUUID: item.serviceUUID, characteristicUUID: item.characteristicUUID, type: item.type },
      rawData,
      (done: any) => {},
      fail);
  }

  // public intToVarints128(value: number) {
  //   if (value === 0) { return [0]; }
  //   let varints128: any[] = [];
  //
  //   let iterValue = value;
  //   let i = 0;
  //   while(iterValue !== 0) {
  //     if (i > 0) {
  //       varints128[i - 1] = varints128[i - 1] | 0x80;
  //     }
  //
  //     varints128.push(iterValue & 0x7f);
  //     iterValue >>= 7;
  //     ++i;
  //   }
  //
  //   return varints128;
  // }

  public decodeBuffer(bufferArr: any, type: string) {
    let data: any = {};
    switch (type) {
      case 'errorList':
        const errorListBlockLength: number = 8;
        const errorListProps: any[] = [
          { name: 'catridgeId', bLen: 3 },
          { name: 'time', bLen: 4 },
          { name: 'errorId', bLen: 1 }
        ];
        const errorListResult: any[] = this.parseBufferProps(bufferArr, errorListProps, errorListBlockLength);
        data = {
          result: errorListResult,
          log: (new Date()).toISOString() + ' Success "Error List Data": ' + JSON.stringify(errorListResult, null, 2)
        };
        break;
      case 'usageList':
        const usageListBlockLength: number = 8;
        const usageListProps: any[] = [
          { name: 'catridgeId', bLen: 3 },
          { name: 'date', bLen: 2 },
          { name: 'runTimes', bLen: 1 },
          { name: 'numUses', bLen: 1 },
          { name: 'padding', bLen: 1 }
        ];
        const usageListResult: any[] = this.parseBufferProps(bufferArr, usageListProps, usageListBlockLength);
        data = {
          result: usageListResult,
          log: (new Date()).toISOString() + ' Success "Usage List Data": ' + JSON.stringify(usageListResult, null, 2)
        };
        break;
      default:
        data = { result: [], log: '' };
        break;
    }
    return data;
  }

  public onFileResponse(data: any, address: string, item: any, rawData: any, callback?: any, progressInfo?: any) {
    if (data && data.data) {
      const idx8arr4: any[] = data.data.slice(this.config.packIdxStart, this.config.packIdxEnd);
      const index: number = this.uint8to32int(idx8arr4);
      switch (data.data[CHAR_ELEM.file]) {
        case CHAR_ELEM.write.file.none:
          switch (data.data[CHAR_ELEM.action]) {
            case CHAR_ELEM.write.action.timeout:
            case CHAR_ELEM.write.action.error:
            case CHAR_ELEM.write.action.unknown:
              this.buffWriteStatus.died = true;
              this.buffWriteStatus.status = data.data[CHAR_ELEM.action];
              if (progressInfo) {
                const errorMessage: string = `${CHAR_ELEM.write.action[data.data[CHAR_ELEM.action]].toUpperCase()} in transfer! Upgrade will be skipped!`;
                progressInfo(this.getProgressObj(data, item, errorMessage));
              }
              console.log(`Stop buffer transfer due to ${CHAR_ELEM.write.action[data.data[CHAR_ELEM.action]]}!`);
              this.disconnectPen(item.device);
              break;
            default:
              this.buffWriteStatus.died = true;
              alert('Some unknown error happened!');
              break;
          }
          break;
        case CHAR_ELEM.write.file.black_list:
          let writeBufferItem: any = item;
          switch (data.data[CHAR_ELEM.action]) {
            case CHAR_ELEM.write.action.read:
            case CHAR_ELEM.write.action.pause:
              this.buffWriteStatus.idx = index;
              this.buffWriteStatus.lastRequestedIdx = index;
              this.buffWriteStatus.lastConfirmedIdx = index ? index - 1 : 0;
              this.buffWriteStatus.status = data.data[CHAR_ELEM.action];
              writeBufferItem.address = address;
              writeBufferItem.buffer = this.buffWriteStatus.data[index];
              if (this.buffWriteStatus.status !== CHAR_ELEM.write.action.done) {
                if (data.data[CHAR_ELEM.action] === CHAR_ELEM.write.action.read) {
                  if (progressInfo) {
                    const errorMessage: string = '';
                    progressInfo(this.getProgressObj(data, item, errorMessage));
                  }
                  this.bleWriteEmitter.emit(this.buffWriteStatus.lock ? 'resume' : 'write', this.bleWriteEmitter, writeBufferItem, index);
                } else {
                  this.bleWriteEmitter.emit('pause');
                }
              }
              break;
            case CHAR_ELEM.write.action.done:
              this.buffWriteStatus.idx = 0;
              this.buffWriteStatus.status = data.data[CHAR_ELEM.action];
              if (progressInfo) {
                const errorMessage: string = '';
                progressInfo(this.getProgressObj(data, item, errorMessage));
              }
              callback(data);
              break;
            case CHAR_ELEM.write.action.error:
              this.buffWriteStatus.died = true;
              this.buffWriteStatus.status = data.data[CHAR_ELEM.action];
              console.log(`Stop buffer transfer due to ${CHAR_ELEM.write.action[data.data[CHAR_ELEM.action]]}!`);
              break;
            default:
              break;
          }
          break;
        case CHAR_ELEM.write.file.firmware_image:
          let writeFWBufferItem: any = item;
          switch (data.data[CHAR_ELEM.action]) {
            case CHAR_ELEM.write.action.read:
              this.buffWriteStatus.idx = index;
              this.buffWriteStatus.lastRequestedIdx = index;
              this.buffWriteStatus.lastConfirmedIdx = index ? index - 1 : 0;
              this.buffWriteStatus.status = data.data[CHAR_ELEM.action];
              writeFWBufferItem.address = address;
              writeFWBufferItem.buffer = this.buffWriteStatus.data[index];
              if (this.buffWriteStatus.status !== CHAR_ELEM.read.action.done) {
                if (progressInfo) {
                  const errorMessage: string = '';
                  progressInfo(this.getProgressObj(data, item, errorMessage));
                }
                this.bleWriteEmitter.emit(this.buffWriteStatus.lock ? 'resume' : 'write', this.bleWriteEmitter, writeFWBufferItem, index);
              }
              break;
            case CHAR_ELEM.write.action.pause:
              this.buffWriteStatus.status = data.data[CHAR_ELEM.action];
              writeFWBufferItem.address = address;
              writeFWBufferItem.buffer = this.buffWriteStatus.data[this.buffWriteStatus.idx];
              if (this.buffWriteStatus.status !== 5) {
                this.bleWriteEmitter.emit('pause');
              }
              break;
            case CHAR_ELEM.write.action.done:
              this.buffWriteStatus.idx = 0;
              this.buffWriteStatus.status = data.data[CHAR_ELEM.action];
              if (progressInfo) {
                const errorMessage: string = '';
                progressInfo(this.getProgressObj(data, item, errorMessage));
              }
              callback(data);
              break;
            case CHAR_ELEM.write.action.timeout:
            case CHAR_ELEM.write.action.error:
            case CHAR_ELEM.write.action.unknown:
              this.buffWriteStatus.died = true;
              this.buffWriteStatus.status = data.data[CHAR_ELEM.action];
              if (progressInfo) {
                const errorMessage: string = `${CHAR_ELEM.write.action[data.data[CHAR_ELEM.action]].toUpperCase()} in transfer! Upgrade will be skipped!`;
                progressInfo(this.getProgressObj(data, item, errorMessage));
              }
              console.log(`Stop buffer transfer due to ${CHAR_ELEM.write.action[data.data[CHAR_ELEM.action]]}!`);
              this.disconnectPen(item.device);
              break;
            default:
              break;
          }
          break;
        case CHAR_ELEM.write.file.settings:
          let writeSettingsBufferItem: any = item;
          switch (data.data[CHAR_ELEM.action]) {
            case CHAR_ELEM.write.action.read:
            case CHAR_ELEM.write.action.pause:
              this.buffWriteStatus.idx = index;
              this.buffWriteStatus.lastRequestedIdx = index;
              this.buffWriteStatus.lastConfirmedIdx = index ? index - 1 : 0;
              this.buffWriteStatus.status = data.data[CHAR_ELEM.action];
              writeSettingsBufferItem.address = address;
              writeSettingsBufferItem.buffer = this.buffWriteStatus.data[index];
              if (this.buffWriteStatus.status !== CHAR_ELEM.write.action.done) {
                if (data.data[CHAR_ELEM.action] === CHAR_ELEM.write.action.read) {
                  if (progressInfo) {
                    const errorMessage: string = '';
                    progressInfo(this.getProgressObj(data, item, errorMessage));
                  }
                  this.bleWriteEmitter.emit(this.buffWriteStatus.lock ? 'resume' : 'write', this.bleWriteEmitter, writeSettingsBufferItem, index);
                } else {
                  this.bleWriteEmitter.emit('pause');
                }
              }

              // const zeroPad: any = new Uint8Array(2);
              // let settingsEncrypted: any = new Uint8Array(item.device.deviceSettingsEncrypted);
              // let bufferIndex: any = new Uint8Array(2);
              // bufferIndex[0] = 128;
              // settingsEncrypted = this.concatTypedArrays(bufferIndex, settingsEncrypted);
              // let dataBuffer: any = this.concatTypedArrays(settingsEncrypted, zeroPad);
              //
              // // _.forEach(this.dummySettings, (settingsItem: any) => {
              // //   const convertedUint32: any = this.uint32to8arr(settingsItem);
              // //   dataBuffer = this.concatTypedArrays(dataBuffer, convertedUint32);
              // // });
              // //
              // // dataBuffer = this.concatTypedArrays(dataBuffer, zeroPad);
              //
              // this._ble.write(
              //   address,
              //   { serviceUUID: item.serviceUUID, characteristicUUID: 'a8a91006-38e9-4fbe-83f3-d82aae6ff68e', type: 'fileWriteBuffer' },
              //   dataBuffer,
              //   (done: any) => {
              //     // callback(done);
              //   },
              //   false
              // );
              break;
            case CHAR_ELEM.write.action.done:
              this.buffWriteStatus.idx = 0;
              this.buffWriteStatus.status = data.data[CHAR_ELEM.action];
              if (progressInfo) {
                const errorMessage: string = '';
                progressInfo(this.getProgressObj(data, item, errorMessage));
              }
              callback(data);
              break;
            case CHAR_ELEM.write.action.timeout:
            case CHAR_ELEM.write.action.error:
            case CHAR_ELEM.write.action.unknown:
              this.buffWriteStatus.died = true;
              this.buffWriteStatus.status = data.data[CHAR_ELEM.action];
              if (progressInfo) {
                const errorMessage: string = `${CHAR_ELEM.write.action[data.data[CHAR_ELEM.action]].toUpperCase()} in transfer! Upgrade will be skipped!`;
                progressInfo(this.getProgressObj(data, item, errorMessage));
              }
              console.log(`Stop buffer transfer due to ${CHAR_ELEM.write.action[data.data[CHAR_ELEM.action]]}!`);
              this.disconnectPen(item.device);
              break;
            default:
              break;
          }
          break;
        default:
          console.log('Unexpected data: ' + JSON.stringify(data, null, 2));
          break;
      }
    }
  }

  public onData(data: any, address: string, item: any, rawData: any, callback: any) {
    /** Describes last buffer package in queue **/
    const lastPackIdx: any = new Uint8Array([ 0x80 ]);

    if (data && data.idx && data.idx.length && data.idx[0] === 0 && data.idx[1] === 0) {
      this.rawData = [];
    }
    for (let prop in data.data) {
      this.rawData.push(data.data[prop]);
    }
    if (data && data.idx && data.idx.length && data.idx[0] === lastPackIdx[0]) {
      // console.log('onData dataDone rawData: ', this.rawData);
      const dataDone: any = rawData;
      dataDone[CHAR_ELEM.action] = CHAR_ELEM.read.action.done;
      this._ble.write(address, { serviceUUID: item.serviceUUID, characteristicUUID: item.characteristicUUID, type: item.type }, dataDone, (done: any) => {
        let resp: any = {};
        switch (dataDone[CHAR_ELEM.file]) {
          case CHAR_ELEM.read.file.usage_list:
            resp = this.decodeBuffer(this.rawData, 'usageList');
            resp.rawResult = this.rawData;
            break;
          case CHAR_ELEM.read.file.error_list:
            resp = this.decodeBuffer(this.rawData, 'errorList');
            resp.rawResult = this.rawData;
            break;
          case CHAR_ELEM.read.file.black_list:
            resp = this.decodeBuffer(this.rawData, 'blackList');
            resp.rawResult = this.rawData;
            break;
          case CHAR_ELEM.read.file.settings:
            resp = this.decodeBuffer(this.rawData, 'settings');
            resp.rawResult = this.rawData;
            break;
          default:
            break;
        }
        this.rawData = [];
        this._ble.startNotification(
          address,
          { serviceUUID: item.serviceUUID, characteristicUUID: 'a8a91004-38e9-4fbe-83f3-d82aae6ff68e', type: item.type },
          (done: any) => {
            // alert(JSON.stringify(done, null, 2));
            if (callback) {
              // this._ble.stopNotification(address, { serviceUUID: item.serviceUUID, characteristicUUID: 'a8a91004-38e9-4fbe-83f3-d82aae6ff68e' }, true, false);
              callback(resp);
            }
          },
          (err: any) => false,
          true
        );
      }, (err: any) => {
        console.log('this._ble.write err: ', err);
      });
    }
    // const cartIdArr: any = new Uint8Array(buffer, 2, 3);
    // const cartId: any = (cartIdArr[0] << 16) | (cartIdArr[1] << 8) | cartIdArr[2];

  }

  private disconnectPen(pen: any) {
    this._ble.disconnect(
      pen,
      (done: any) => console.log('disconnectPen done: ', done),
      (err: any) => console.log('disconnectPen err: ', err)
    )
  }

  private parseBufferProps(bufferArr: any, listProps: any, blockLength: number) {
    let rawData: any = [];
    const amount: any = Math.ceil(bufferArr.length / blockLength);
    for (let i = 0; i < amount; i++) {
      const idx: any = i * blockLength;
      const arr: any = bufferArr.slice(idx, idx + blockLength);
      rawData[i] = {};
      _.forEach(listProps, (item: any) => rawData[i][item.name] = arr.splice(0, item.bLen));
    }
    return rawData.map((item: any) => {
      let converted: any = {};
      _.forEach(listProps, (p: any) => {
        switch (p.bLen) {
          case 1:
            converted[p.name] = item[p.name][0];
            break;
          case 2:
            converted[p.name] = (item[p.name][0] << 8) | item[p.name][1];
            break;
          case 3:
            converted[p.name] = (item[p.name][0] << 16) | (item[p.name][1] << 8) | item[p.name][2];
            break;
          case 4:
            converted[p.name] = (item[p.name][0] << 24) | (item[p.name][1] << 16) | (item[p.name][2] << 8) | item[p.name][3];
            break;
        }
      });
      return converted;
    });
  }

  private getProgressObj(data: any, item: any, errorMessage?: string) {
    const packagesTotal: number = item.device.firmwareBufferLength;
    const averagePackTiming: number = this.buffWriteStatus.lastConfirmedIdx ?
      (moment().valueOf() - this.buffWriteStatus.transferStart) / this.buffWriteStatus.lastConfirmedIdx : 300;
    return {
      percent: data.data[CHAR_ELEM.action] === CHAR_ELEM.read.action.done ? 100 : Math.ceil(this.buffWriteStatus.idx / packagesTotal * 1000) / 10,
      packageIdx: this.buffWriteStatus.idx,
      packagesTotal: packagesTotal,
      status: data.data[CHAR_ELEM.action],
      errorMessage,
      iterationTimeMs: this.buffWriteStatus.iterationTimeMs,
      estimateMin: data.data[CHAR_ELEM.action] === CHAR_ELEM.read.action.done ? 0 : Math.floor(((packagesTotal - this.buffWriteStatus.lastConfirmedIdx) * averagePackTiming) / 1000 / 60)
    };
  }

  // private uint32to8arr(uint32: any) {
  //   let resultArr: any = new Uint8Array(4);
  //   resultArr[3] = uint32 & 0xff;
  //   resultArr[2] = (uint32 >> 8) & 0xff;
  //   resultArr[1] = (uint32 >> 16) & 0xff;
  //   resultArr[0] = (uint32 >> 24) & 0xff;
  //   return resultArr;
  // }

  private uint8to32int(arr: any[]) {
    // let sum = 0;
    // arr.reverse().forEach((n: any) => {
    //   sum = sum * 256 + n;
    // });
    // return sum;
    return arr.reduce((acc, next) => {
      return acc * 256 + next;
    }, 0);
  }

  // private uint16to8arr(uint16: any) {
  //   let resultArr: any = new Uint8Array(2);
  //   resultArr[1] = uint16 & 0xff;
  //   resultArr[0] = (uint16 >> 8) & 0xff;
  //   return resultArr;
  // }
  //
  // private concatTypedArrays(a: any, b: any) { // a, b TypedArray of same type
  //   let c = new (a.constructor)(a.length + b.length);
  //   c.set(a, 0);
  //   c.set(b, a.length);
  //   return c;
  // }
}
