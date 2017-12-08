import { Injectable } from '@angular/core';
import { ApiService } from '../index';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
// noinspection TypeScriptCheckImport
import * as _ from 'lodash';

@Injectable()
export class ClinicService {
  public path: string = '/Clinic';
  public clinicAllowedFields: any[] = [
    'id',
    'name',
    'location',
    'phoneNumber',
    'contactPerson',
    'webSiteUrl',
    'finderPageEnabled'
  ];

  constructor(
    private api: ApiService
  ) {}

  public createClinic(data: any): Observable<any> {
    const clinicData: any = _.pick(data, this.clinicAllowedFields);
    // {
    //  "name": "string",
    //  "location": {
    //  "state": "string",
    //    "zip": "string",
    //    "address": "string",
    //    "latitude": "string",
    //    "longitude": "string",
    //    "country": "string",
    //    "city": "string"
    // },
    //  "phoneNumber": "string",
    //  "contactPerson": "string",
    //  "webSiteUrl": "string",
    //  "finderPageEnabled": true
    // }
    return this.api.post(`${this.path}/create`, clinicData);
  }

  public getClinicById(id: any): Observable<any> {
    return this.api.get(`${this.path}/getById?id=${id}`)
      .map((res: any) => res);
  }

  public updateClinic(data: any): Observable<any> {
    const clinicData: any = _.pick(data, this.clinicAllowedFields);
    // {
    //  "id": 0,
    //  "name": "string",
    //  "location": {
    //  "state": "string",
    //    "zip": "string",
    //    "address": "string",
    //    "latitude": "string",
    //    "longitude": "string",
    //    "country": "string",
    //    "city": "string"
    //  },
    //  "phoneNumber": "string",
    //  "contactPerson": "string",
    //  "webSiteUrl": "string",
    //  "finderPageEnabled": true
    // }
    return this.api.post(`${this.path}/update`, clinicData);
  }

  public getClinics(): Observable<any> {
    return this.api.get(`${this.path}/clinics`)
      .map((res: any) => res);
  }

  public getClinicsSearch(search: string): Observable<any> {
    return this.api.get(`${this.path}/clinicsSearch?search=${search}`)
      .map((res: any) => res);
  }

  public deleteClinic(id: string | number): Observable<any> {
    return this.api.post(`${this.path}/delete`, { id });
  }
}
