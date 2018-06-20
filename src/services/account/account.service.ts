import { Injectable } from '@angular/core';
import { ApiService } from '../index';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
// noinspection TypeScriptCheckImport
import * as _ from 'lodash';

@Injectable()
export class AccountService {
  public path: string = '/Account';
  public accountAllowedFields: any[] = [
    'email',
    'password',
    'firstName',
    'lastName',
    'location',
    'phoneNumber',
    'companyName',
    'companyId'
  ];
  public updateAllowedFields: any[] = [
    'firstName',
    'lastName',
    'companyId',
    'phoneNumber'
  ];

  constructor(
    private api: ApiService
  ) {}

  public getAllCompanies(): Observable<any> {
    return this.api.get(`${this.path}/getAllCompanies`)
      .map((res: any) => res);
  }

  public getAgreement(): Observable<any> {
    return this.api.get(`${this.path}/getAgreement`)
      .map((res: any) => res);
  }

  public getAgreementLink(): Observable<any> {
    return this.api.get(`${this.path}/getAgreementLink`)
      .map((res: any) => res);
  }

  public isAgreementAgreed(): Observable<any> {
    return this.api.post(`${this.path}/isAgreementAgreed`, {})
      .map((res: any) => res);
  }

  public agreeAgreement(): Observable<any> {
    return this.api.post(`${this.path}/agreeAgreement`, {})
      .map((res: any) => res);
  }

  public createAccount(data: any): Observable<any> {
    if (data && data.location && data.location.state) {
      delete data.location.state;
    }
    const accData: any = _.pick(data, this.accountAllowedFields);
    // {
    //  "email": "string",
    //  "password": "string",
    //  "firstName": "string",
    //  "lastName": "string",
    //  "location": {
    //    "country": "string",
    //    "city": "string"
    //  },
    //  "phoneNumber": "string",
    //  "companyId": 0
    // }
    return this.api.post(`${this.path}/create`, accData);
  }

  public getAccountInfo(): Observable<any> {
    return this.api.get(`${this.path}/getInfo`)
      .map((res: any) => res);
  }

  public updateAccount(data: any): Observable<any> {
    const updateData: any = _.pick(data, this.updateAllowedFields);
    // {
    //  "firstName": "string",
    //  "lastName": "string",
    //  "companyId": 0,
    //  "phoneNumber": "string"
    // }
    return this.api.post(`${this.path}/update`, updateData);
  }
}
