import { Injectable } from '@angular/core';
import { ApiService } from '../index';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
// noinspection TypeScriptCheckImport
import * as _ from 'lodash';

@Injectable()
export class PenService {
  public path: string = '/Pen';
  public penAllowedFields: any[] = [
    'id',
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

  constructor(
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

  public deletePen(id: string | number): Observable<any> {
    return this.api.post(`${this.path}/delete`, { id });
  }

  // private decodeBuffer(bufferArr: any[], type: string) {
  //   switch (type) {
  //     case 'errorList':
  //       const errorListBlockLength: number = 12;
  //       const errorListProps: any[] = [
  //         { name: 'cartId', bLen: 3 },
  //         { name: 'seconds', bLen: 4 },
  //         { name: 'errorId', bLen: 1 },
  //         { name: 'userId', bLen: 4 }
  //       ];
  //       const errorListResult: any[] = this.parseBufferProps(bufferArr, errorListProps, errorListBlockLength);
  //       return {
  //         result: errorListResult,
  //         log: (new Date()).toISOString() + ' Success "Error List Data": ' + JSON.stringify(errorListResult, null, 2)
  //       };
  //     case 'usageList':
  //       const usageListBlockLength: number = 11;
  //       const usageListProps: any[] = [
  //         { name: 'cartId', bLen: 3 },
  //         { name: 'usageDays', bLen: 2 },
  //         { name: 'runTime', bLen: 1 },
  //         { name: 'numUses', bLen: 1 },
  //         { name: 'userId', bLen: 4 }
  //       ];
  //       const usageListResult: any[] = this.parseBufferProps(bufferArr, usageListProps, usageListBlockLength);
  //       return {
  //         result: usageListResult,
  //         log: (new Date()).toISOString() + ' Success "Error List Data": ' + JSON.stringify(usageListResult, null, 2)
  //       };
  //     default:
  //       return { result: [], log: '' };
  //   }
  // }
  //
  // private parseBufferProps(bufferArr: any[], listProps: any[], blockLength: number) {
  //   let rawData: any[] = [];
  //   const amount: any = Math.ceil(bufferArr.length % blockLength) + 1;
  //   for (let i = 1; i <= amount; i++) {
  //     const idx: any = i * blockLength - blockLength;
  //     const arr: any = bufferArr.slice(idx, idx + blockLength);
  //     _.forEach(listProps, (item: any) => rawData[i-1][item.name] = arr.splice(0, item.bLen));
  //   }
  //   return rawData.map((item: any) => {
  //     let converted: any = {};
  //     _.forEach(listProps, (p: any) => {
  //       switch (p.bLen.length) {
  //         case 1:
  //           converted[p.name] = item[p.name][0];
  //           break;
  //         case 2:
  //           converted[p.name] = (item[p.name][0] << 8) | item[p.name][1];
  //           break;
  //         case 3:
  //           converted[p.name] = (item[p.name][0] << 16) | (item[p.name][1] << 8) | item[p.name][2];
  //           break;
  //         case 4:
  //           converted[p.name] = (item[p.name][0] << 24) | (item[p.name][1] << 16) | (item[p.name][2] << 8) | item[p.name][3];
  //           break;
  //       }
  //     });
  //     return converted;
  //   });
  // }
}
