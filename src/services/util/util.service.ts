import { Injectable } from '@angular/core';
import { ApiService } from '../';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
// noinspection TypeScriptCheckImport
import * as _ from 'lodash';

import { T_LOCATION_PARAMS } from '../../app/types';

@Injectable()
export class UtilService {
  public path: string = '/Location';

  constructor(private api: ApiService) {}

  public getLocation(params: T_LOCATION_PARAMS): Observable<any> {
    return this.api.post(`${this.path}/getLocations`, params)
      .map((resp: any) => {
        /** TODO: change "counties" to "countries" after API fix typo **/
        if (resp && resp.counties && resp.counties.length) {
          let countries: any[] = _.clone(resp.counties);
          /** Move "top used" countries to top for better UX **/
          const au: any = _.find(countries, { name: 'Australia' });
          const ca: any = _.find(countries, { name: 'Canada' });
          const us: any = _.find(countries, { name: 'United States' });
          const topCountries: any[] = [ au, ca, us ];

          countries.splice(countries.indexOf(au), 1);
          countries.splice(countries.indexOf(ca), 1);
          countries.splice(countries.indexOf(us), 1);

          resp.counties = topCountries.concat(countries);
        }
        return resp;
      });
  }

  // /**
  //  * Convert firmware hex string to buffer array
  //  * @param {string} firmwareHex
  //  * @returns {any[]}
  //  */
  // public getFirmwareHexBuffer(firmwareHex: string) {
  //   const firmwareHexStr: string = firmwareHex.replace(/[\s\n:]/g, '');
  //   const buffer: any[] = [];
  //   let bytesLength: number = 0;
  //
  //   for (let i = 0; i < firmwareHexStr.length; i += 36) {
  //     const strChunk: string = firmwareHexStr.substr(i, 36);
  //     const chunk: any = new Uint8Array(18);
  //     for (let j = 0; j < strChunk.length; j += 1) {
  //       chunk[j] = parseInt(strChunk.substr(j*2, 2), 16);
  //     }
  //     bytesLength += strChunk.length / 2;
  //
  //     let packageNumber: any = new Uint8Array(2);
  //     const uint8idx: any = this.uint16to8arr(new Uint16Array([Math.floor(bytesLength / 18 - 1)]));
  //     // console.log('package idx: ', bytesLength / 18 - 1, ' uint8idx: ', uint8idx);
  //     packageNumber = new Uint8Array(uint8idx);
  //     if (buffer && buffer.length && buffer[buffer.length-1] && buffer[buffer.length-1].length) {
  //       let prevIdx: any = [ buffer[buffer.length-1][0], buffer[buffer.length-1][1] ];
  //       if (prevIdx == packageNumber) {
  //         packageNumber = new Uint8Array(uint8idx);
  //         packageNumber[0] |= 128;
  //       }
  //     }
  //
  //     buffer.push(this.concatTypedArrays(packageNumber, chunk));
  //
  //     // buffer.push(chunk);
  //   }
  //   return { buffer, bytesLength };
  // }

  /**
   * Convert bytes array to buffer chunks array with pack numbers
   * @param {any[]} content
   * @returns {any[]}
   */
  public getBufferChunksOf(content: any[]) {
    // let content: any[] = JSON.parse(JSON.stringify(data));
    const buffer: any[] = [];
    const bytesLength: number = content.length;

    for (let i = 0; i < content.length; i += 18) {
      let chunk: any = new Uint8Array(content.slice(i, i + 18));

      const uint8idx: any = this.uint16to8arr(new Uint16Array([i / 18]));
      let packageNumber = new Uint8Array(uint8idx);
      if (buffer && buffer.length && buffer[buffer.length-1] && buffer[buffer.length-1].length) {
        let prevIdx: any = [ buffer[buffer.length-1][0], buffer[buffer.length-1][1] ];
        if (prevIdx == packageNumber) {
          packageNumber = new Uint8Array(uint8idx);
          packageNumber[0] |= 128;
        }
      }

      if (chunk && chunk.length && chunk.length < 18) {
        const zeroLen: number = 18 - chunk.length;
        const zeroPad: any = new Uint8Array(zeroLen);
        chunk = this.concatTypedArrays(chunk, zeroPad);
      }

      buffer.push(this.concatTypedArrays(packageNumber, chunk));

      // buffer.push(chunk);
    }
    // console.log('buffer last item: ', buffer[buffer.length-1], ' before last: ', buffer[buffer.length-2]);
    return { buffer, bytesLength };
  }

  // private uint32to8arr(uint32: any) {
  //   let resultArr: any = new Uint8Array(4);
  //   resultArr[3] = uint32 & 0xff;
  //   resultArr[2] = (uint32 >> 8) & 0xff;
  //   resultArr[1] = (uint32 >> 16) & 0xff;
  //   resultArr[0] = (uint32 >> 24) & 0xff;
  //   return resultArr;
  // }

  private uint16to8arr(uint16: any) {
    let resultArr: any = new Uint8Array(2);
    resultArr[1] = uint16 & 0xff;
    resultArr[0] = (uint16 >> 8) & 0xff;
    return resultArr;
  }

  private concatTypedArrays(a: any, b: any) { // a, b TypedArray of same type
    let c = new (a.constructor)(a.length + b.length);
    c.set(a, 0);
    c.set(b, a.length);
    return c;
  }

}
