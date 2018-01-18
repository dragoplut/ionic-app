import { Injectable } from '@angular/core';
import { ApiService, BleService } from '../index';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import * as moment from 'moment';
// noinspection TypeScriptCheckImport
import * as _ from 'lodash';

@Injectable()
export class PenService {
  public path: string = '/Pen';
  public penAllowedFields: any[] = [
    'id',
    'name',
    'serialNumber',
    'clinicId'
  ];

  public deviceInterface: any = {
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
        type: 'unit8',
        name: 'Brightness',
        service: 'a8a91000-38e9-4fbe-83f3-d82aae6ff68e',
        characteristic: 'a8a91001-38e9-4fbe-83f3-d82aae6ff68e',
        properties: [ 'Read', 'Write' ]
      },
      {
        type: 'unit8',
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
      //   type: 'unit8',
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

  public charElem: any = {
    'a8a91003-38e9-4fbe-83f3-d82aae6ff68e': {
      file: {
        none: 0,
        usage_list: 1,
        error_list: 2,
        black_list: 3,
        firmware_image: 4,
        settings: 5
      },
      action: {
        none: 0,
        size: 1,
        write: 2,
        read: 3,
        not_used: 4,
        done: 5,
        abort: 6
      }
    },
    'a8a91004-38e9-4fbe-83f3-d82aae6ff68e': {
      file: {
        0: 'none',
        1: 'usage_list',
        2: 'error_list',
        3: 'black_list',
        4: 'firmware_image',
        5: 'settings'
      },
      action: {
        1: 'size',
        2: 'not_used1',
        3: 'read',
        4: 'pause',
        5: 'done',
        6: 'not_used2',
        7: 'timeout',
        8: 'error'
      }
    }
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
  public dummyWhiteBlackList: any[] = [0,0,1,1,2,3,4,6,7,300];
  public dummySettings: any[] = [
    123456,
    this.timeNowSeconds,
    this.timeNowSeconds + (24 * 60 * 60),
    this.timeNowSeconds + (7 * 24 * 60 * 60)
  ];

  public rawData: any = [];

  public buffWriteStatus: any = {
    idx: 0,
    data: [],
    status: 'ok'
  };

  constructor(
    public _ble: BleService,
    private api: ApiService
  ) {}

  public registerPen(data: any): Observable<any> {
    const penData: any = _.pick(data, this.penAllowedFields);
    // {
    //   "serialNumber": "string",
    //   "clinicId": 0
    // }
    return this.api.post(`${this.path}/register`, penData);
  }

  public updatePen(data: any): Observable<any> {
    const penData: any = _.pick(data, this.penAllowedFields);
    // {
    //   "id": 0,
    //   "serialNumber": "string"
    // }
    return this.api.post(`${this.path}/update`, penData);
  }

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

  public getSettings(serialNumber: any): Observable<any> {
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

  public updateWhiteBlacklist(data: any[]): Observable<any> {
    /** Resp example **/
    // [0,2,1,8,3,200]
    return this.api.post(`${this.path}/getWhiteBlacklist`, data)
      .map((res: any) => res);
  }

  public saveSyncListData(data: any): Observable<any> {
    return this.api.post(`${this.path}/saveSyncListData`, data)
      .map((res: any) => res);
  }

  public deletePen(id: string | number): Observable<any> {
    return this.api.post(`${this.path}/delete`, { id });
  }

  public sendBuffPackage(address: string, item: any, buffer: any[]) {
    // alert('sendBuffPackage buffer: ' + JSON.stringify(buffer, null, 2));
    // const buffDuplicate: any = new Uint8Array(buffer);
    // alert('sendBuffPackage buffDuplicate: ' + JSON.stringify(buffDuplicate, null, 2));
    this.buffWriteStatus.idx = buffer[1] + 1;
    setTimeout(() => {
      this._ble.write(
        address,
        { serviceUUID: item.serviceUUID, characteristicUUID: 'a8a91006-38e9-4fbe-83f3-d82aae6ff68e', type: 'fileWriteBuffer' },
        buffer,
        (done: any) => {
          // alert('sendBuffPackage done: ' + JSON.stringify(done, null, 2));
          // success(done, 'Write buffer ' + JSON.stringify(rawData));
        },
        false
      );
    }, 50);
  }

  public checkBuffAndSend(address: string, item: any) {
    // alert('this.buffWriteStatus: ' + JSON.stringify(this.buffWriteStatus, null, 2));
    for (let j = 0; j < this.buffWriteStatus.data.length; j++) {
      // alert('checkBuffAndSend iteration this.buffWriteStatus.data[j]: ' + JSON.stringify(this.buffWriteStatus.data[j], null, 2));
      this.sendBuffPackage(address, item, this.buffWriteStatus.data[j]);
    }

    // if (this.buffWriteStatus.status === 'ok') {
    //   // let buff: any = this.buffWriteStatus.data[0];
    //   // buff[0] = 1;
    //   // this.sendBuffPackage(address, item, buff)
    //   for (let j = 0; j < this.buffWriteStatus.data.length; j++) {
    //     alert('checkBuffAndSend iteration this.buffWriteStatus.data[j]: ' + this.buffWriteStatus.data[j]);
    //     this.sendBuffPackage(address, item, this.buffWriteStatus.data[j]);
    //   }
    // } else if (this.buffWriteStatus.status === 3) {
    //   alert('checkBuffAndSend from index: ' + this.buffWriteStatus.idx);
    //   for (let j = this.buffWriteStatus.idx; j < this.buffWriteStatus.data.length; j++) {
    //     const buffer: any = this.buffWriteStatus.data[j];
    //     this.sendBuffPackage(address, item, buffer)
    //   }
    // } else {
    //   alert('FAIL: ' + JSON.stringify(this.buffWriteStatus, null, 2));
    // }
  }

  public writeWithResponse(address: string, item: any, rawData: any, success: any, fail: any) {

    if (item && item.device && item.device.settings) {
      this.dummySettings = item.device.settings;
    }
    if (item && item.device && item.device.dummyWhiteBlackList) {
      this.dummyWhiteBlackList = item.device.dummyWhiteBlackList;
    }

    if (rawData && rawData.length) {
      switch (rawData[1]) {
        case 2:
          // alert('writeWithResponse rawData: ' + JSON.stringify(rawData));
          this._ble.startNotification(
            address,
            { serviceUUID: item.serviceUUID, characteristicUUID: 'a8a91004-38e9-4fbe-83f3-d82aae6ff68e', type: item.type },
            (data: any) => this.onFileResponse(data, address, item, rawData, success),
            (err: any) => this._ble.stopNotification(address, { serviceUUID: item.serviceUUID, characteristicUUID: 'a8a91004-38e9-4fbe-83f3-d82aae6ff68e' }, true, err));
          // let onReadData: any[] = _.clone(rawData);
          // /** Set notification action as "3" - read **/
          // onReadData[1] = 3;
          // this._ble.startNotification(
          //   address,
          //   { serviceUUID: item.serviceUUID, characteristicUUID: 'a8a91004-38e9-4fbe-83f3-d82aae6ff68e' },
          //   (data: any) => this.onFileResponse(data, address, item, onReadData),
          //   (err: any) => this._ble.stopNotification(address, { serviceUUID: item.serviceUUID, characteristicUUID: 'a8a91004-38e9-4fbe-83f3-d82aae6ff68e' }, true, err));
          // let onDoneData: any[] = _.clone(rawData);
          // /** Set notification action as "5" - done **/
          // onDoneData[1] = 5;
          // this._ble.startNotification(
          //   address,
          //   { serviceUUID: item.serviceUUID, characteristicUUID: 'a8a91004-38e9-4fbe-83f3-d82aae6ff68e' },
          //   (data: any) => this.onFileResponse(data, address, item, onDoneData),
          //   (err: any) => this._ble.stopNotification(address, { serviceUUID: item.serviceUUID, characteristicUUID: 'a8a91004-38e9-4fbe-83f3-d82aae6ff68e' }, true, err));
          // let onErrorData: any[] = _.clone(rawData);
          // /** Set notification action as "8" - error **/
          // onErrorData[1] = 8;
          // this._ble.startNotification(
          //   address,
          //   { serviceUUID: item.serviceUUID, characteristicUUID: 'a8a91004-38e9-4fbe-83f3-d82aae6ff68e' },
          //   (data: any) => this.onFileResponse(data, address, item, onErrorData),
          //   (err: any) => this._ble.stopNotification(address, { serviceUUID: item.serviceUUID, characteristicUUID: 'a8a91004-38e9-4fbe-83f3-d82aae6ff68e' }, true, err));
          break;
        case 3:
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

    let resultViktor: any = [];
    const rangesArr: any[] = this.dummyWhiteBlackList;
    _.forEach(rangesArr, (num: any) => {
      resultViktor = resultViktor.concat(this.intToVarints128(num));
    });
    let resultViktorUint8: any = new Uint8Array(resultViktor);

    if (rawData[0] === 3 && rawData[1] === 2) {
      rawData[2] = resultViktorUint8.length;
      // rawData[2] = 18;
    } else if (rawData[0] === 5 && rawData[1] === 2) {
      rawData[2] = 16;
    }

    this._ble.write(address, { serviceUUID: item.serviceUUID, characteristicUUID: item.characteristicUUID, type: item.type }, rawData, (done: any) => {
      if (rawData[1] === 2) {
        switch (rawData[0]) {
          case 3:
            // alert('write 3 done: ' + JSON.stringify(done, null, 2));
            let bufferItems: any[] = [];
            const packagesAmount: number = Math.ceil(resultViktor.length / 18);
            for (let i = 0; i < packagesAmount; i++) {
              const rawPackageData: any = resultViktorUint8.slice(i ? 18 * i - 1 : i, 18 * (i + 1));
              let packageData: any = new Uint8Array(18);
              _.forEach(rawPackageData, (item: any, idx: number) => packageData[idx] = item);
              const packageNumber: any = new Uint8Array(2);
              packageNumber[0] = packagesAmount < 2 || i + 1 === packagesAmount ? 128 : i;
              packageNumber[1] = i;
              const packageBuffer: any = this.concatTypedArrays(packageNumber, packageData);
              bufferItems.push(packageBuffer);
              // alert('packagesAmount i: ' + i + ' packageBuffer: ' + JSON.stringify(packageBuffer, null, 2));

              // this._ble.write(
              //   address,
              //   { serviceUUID: item.serviceUUID, characteristicUUID: 'a8a91006-38e9-4fbe-83f3-d82aae6ff68e', type: 'fileWriteBuffer' },
              //   packageBuffer,
              //   (done: any) => {
              //     // alert('sendBuffPackage done: ' + JSON.stringify(done, null, 2));
              //     // success(done, 'Write buffer ' + JSON.stringify(rawData));
              //   },
              //   fail
              // );

            }
            this.buffWriteStatus.data = bufferItems;
            // alert('this.buffWriteStatus: ' + JSON.stringify(this.buffWriteStatus, null, 2));

            // this.checkBuffAndSend(address, item);

            break;
          case 4:
            break;
          case 5:
            // alert('write 5 done: ' + JSON.stringify(done, null, 2));
            let zeroPad: any = new Uint8Array(2);
            let dataBuffer: any = new Uint8Array(2);
            dataBuffer[0] = 128;

            // alert(JSON.stringify(this.dummySettings, null, 2));

            _.forEach(this.dummySettings, (item: any) => {
              const convertedUint32: any = this.uint32to8arr(item);
              dataBuffer = this.concatTypedArrays(dataBuffer, convertedUint32);
            });

            dataBuffer = this.concatTypedArrays(dataBuffer, zeroPad);
            this.buffWriteStatus.buffer = dataBuffer;
            // alert('write 5 done, send buffer:' + JSON.stringify(dataBuffer, null, 2));
            // setTimeout(() => {
            //   this._ble.write(
            //     address,
            //     { serviceUUID: item.serviceUUID, characteristicUUID: 'a8a91006-38e9-4fbe-83f3-d82aae6ff68e', type: 'fileWriteBuffer' },
            //     dataBuffer,
            //     (done: any) => {
            //       success(done, 'Write buffer settings ' + JSON.stringify(rawData));
            //     },
            //     fail
            //   );
            // }, 200);
            break;
        }
      }
    }, fail);
  }

  public intToVarints128(value: number) {
    if (value === 0) { return [0]; }
    let varints128: any[] = [];

    let iterValue = value;
    let i = 0;
    while(iterValue !== 0) {
      if (i > 0) {
        varints128[i - 1] = varints128[i -1] | 0x80;
      }

      varints128.push(iterValue & 0x7f);
      iterValue >>= 7;
      ++i;
    }

    return varints128;
  }

  public decodeBuffer(bufferArr: any, type: string) {
    let data: any = {};
    switch (type) {
      case 'errorList':
        const errorListBlockLength: number = 8;
        const errorListProps: any[] = [
          { name: 'cartridgeId', bLen: 3 },
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
        // let exampleObj: any = {
        //   "serialNumber": "string",
        //   "penUsageLists": [
        //     {
        //       "catridgeId": 0,
        //       "date": 0,
        //       "runTimes": 0,
        //       "numUses": 0,
        //       "padding": 0
        //     }
        //   ],
        //   "penErrorLists": [
        //     {
        //       "id": 0,
        //       "catridgeId": 0,
        //       "time": 0,
        //       "errorId": 0
        //     }
        //   ]
        // };

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

  public onFileResponse(data: any, address: string, item: any, rawData: any, callback?: any) {
    // alert('onFileResponse ' + JSON.stringify(data, null, 2));
    if (data && data.data) {
      switch (data.data['0']) {
        case 3:
          switch (data.data['1']) {
            case 3:
              this.buffWriteStatus.status = data[1];
              // this.buffWriteStatus.idx = data[2];
              let writeBufferItem: any = _.clone(item);
              writeBufferItem.type = 'fileWriteBuffer';
              this.checkBuffAndSend(address, item);
              break;
            case 4:
              this.buffWriteStatus.status = data[1];
              break;
            case 5:
              this.buffWriteStatus.status = data[1];
              // alert('write DONE!!!!!!!');
              callback(data);
              break;
            case 8:
              this.buffWriteStatus.status = data[1];
              break;
            default:
              break;
          }
          break;
        case 5:
          switch (data.data['1']) {
            case 3:
              let zeroPad: any = new Uint8Array(2);
              let dataBuffer: any = new Uint8Array(2);
              dataBuffer[0] = 128;

              // alert(JSON.stringify(this.dummySettings, null, 2));

              _.forEach(this.dummySettings, (settingsItem: any) => {
                const convertedUint32: any = this.uint32to8arr(settingsItem);
                dataBuffer = this.concatTypedArrays(dataBuffer, convertedUint32);
              });

              dataBuffer = this.concatTypedArrays(dataBuffer, zeroPad);
              // alert('!!!!!!! 5 dataBuffer: ' + JSON.stringify(dataBuffer, null, 2));
              this._ble.write(
                address,
                { serviceUUID: item.serviceUUID, characteristicUUID: 'a8a91006-38e9-4fbe-83f3-d82aae6ff68e', type: 'fileWriteBuffer' },
                dataBuffer,
                (done: any) => {
                  // callback(done);
                },
                false
              );
              break;
            case 5:
              // alert('write DONE!!!!!!!');
              callback(data);
              break;
          }
          break;
        default:
          // alert('Unexpected notification data: ' + JSON.stringify(data, null, 2));
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
      const dataDone: any = _.clone(rawData);
      dataDone[1] = 5;
      this._ble.write(address, { serviceUUID: item.serviceUUID, characteristicUUID: item.characteristicUUID, type: item.type }, dataDone, (done: any) => {
        let resp: any = {};
        switch (dataDone[0]) {
          case 1:
            resp = this.decodeBuffer(this.rawData, 'usageList');
            break;
          case 2:
            resp = this.decodeBuffer(this.rawData, 'errorList');
            break;
          case 3:
            resp = this.decodeBuffer(this.rawData, 'blackList');
            break;
          case 5:
            resp = this.decodeBuffer(this.rawData, 'settings');
            break;
          default:
            break;
        }
        this.rawData = [];
        if (callback) {
          callback(resp);
        }
      }, false);
    }
    // const cartIdArr: any = new Uint8Array(buffer, 2, 3);
    // const cartId: any = (cartIdArr[0] << 16) | (cartIdArr[1] << 8) | cartIdArr[2];

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

        // buff = [1,2,3,4];
        // sum = 0;
        // for (var i = 0; i < buff.length; i++) {
        //   sum += buff[buff.length-i-1] << (8*i)
        // }
      });
      return converted;
    });
  }

  private uint32to8arr(uint32: any) {
    let resultArr: any = new Uint8Array(4);
    resultArr[3] = uint32 & 0xff;
    resultArr[2] = (uint32 >> 8) & 0xff;
    resultArr[1] = (uint32 >> 16) & 0xff;
    resultArr[0] = (uint32 >> 24) & 0xff;
    return resultArr;
  }

  // private uint16to8arr(uint16: any) {
  //   let resultArr: any = new Uint8Array(2);
  //   resultArr[1] = uint16 & 0xff;
  //   resultArr[0] = (uint16 >> 8) & 0xff;
  //   return resultArr;
  // }

  private concatTypedArrays(a: any, b: any) { // a, b TypedArray of same type
    let c = new (a.constructor)(a.length + b.length);
    c.set(a, 0);
    c.set(b, a.length);
    return c;
  }
}
