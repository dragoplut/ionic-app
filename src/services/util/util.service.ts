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

  /**
   * Convert firmware hex string to buffer array
   * @param {string} firmwareHex
   * @returns {any[]}
   */
  public getFirmwareHexBuffer(firmwareHex: string) {
    const firmwareHexStr: string = firmwareHex.replace(/[\s\n:]/g, '');
    const buffer: any[] = [];
    let bytesLength: number = 0;

    for (let i = 0; i < firmwareHexStr.length; i += 36) {
      const strChunk: string = firmwareHexStr.substr(i, 36);
      const chunk: any = new Uint8Array(18);
      for (let j = 0; j < strChunk.length; j += 1) {
        chunk[j] = parseInt(strChunk.substr(j*2, 2), 16);
      }
      bytesLength += strChunk.length / 2;
      buffer.push(chunk);
    }
    return { buffer, bytesLength };
  }
}
