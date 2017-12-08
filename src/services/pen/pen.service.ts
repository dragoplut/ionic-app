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
}
