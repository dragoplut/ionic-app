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

  // Get link for separate agreement
  public getPrivacyLink(): Observable<any> {
    return this.api.get(`${this.path}/getPrivacyLink`)
      .map((res: any) => res);
  }

  public getTermsLink(): Observable<any> {
    return this.api.get(`${this.path}/getTermsLink`)
      .map((res: any) => res);
  }

  public getEulaLink(): Observable<any> {
    return this.api.get(`${this.path}/getEulaLink`)
      .map((res: any) => res);
  }

  // Agree action
  public agreePrivacy(): Observable<any> {
    return this.api.post(`${this.path}/agreePrivacy`, {})
      .map((res: any) => res);
  }

  public agreeTerms(): Observable<any> {
    return this.api.post(`${this.path}/agreeTerms`, {})
      .map((res: any) => res);
  }

  public agreeEula(): Observable<any> {
    return this.api.post(`${this.path}/agreeEula`, {})
      .map((res: any) => res);
  }

  // Check if separate agreement agreed
  public isPrivacyAgreed(): Observable<any> {
    return this.api.post(`${this.path}/isPrivacyAgreed`, {})
      .map((res: any) => res);
  }

  public isTermsAgreed(): Observable<any> {
    return this.api.post(`${this.path}/isTermsAgreed`, {})
      .map((res: any) => res);
  }

  public isEulaAgreed(): Observable<any> {
    return this.api.post(`${this.path}/isEulaAgreed`, {})
      .map((res: any) => res);
  }

  public agreeNextAgreements(agreements: string[], callback: any) {
    let agreedCounter: number = 0;
    agreements.forEach((item: string) => {
      switch (item) {
        case 'privacy':
          this.agreePrivacy().subscribe(
            () => {
              agreedCounter++;
              if (agreedCounter === agreements.length) {
                if (callback) { callback('done'); }
              }
            },
            (err: any) => { console.log('err', err); }
          );
          break;
        case 'terms':
          this.agreeTerms().subscribe(
            () => {
              agreedCounter++;
              if (agreedCounter === agreements.length) {
                if (callback) { callback('done'); }
              }
            },
            (err: any) => { console.log('err', err); }
          );
          break;
        case 'eula':
          this.agreeEula().subscribe(
            () => {
              agreedCounter++;
              if (agreedCounter === agreements.length) {
                if (callback) { callback('done'); }
              }
            },
            (err: any) => { console.log('err', err); }
          );
          break;
      }
    })
  }

  public getNextLinks(props: string[], callback) {
    let gotLinks: number = 0;
    let result: any[] = [];
    props.forEach((prop: string) => {
      switch (prop) {
        case 'privacy':
          this.getPrivacyLink().subscribe(
            (privacyLink: string) => {
              result.push({
                propName: 'privacy',
                link: privacyLink,
                title: 'The General Privacy agreement',
                titleShort: 'Privacy Policy',
              });
              gotLinks++;
              if (gotLinks === props.length) {
                if (callback) { callback(result); }
              }
            },
            (err: any) => { console.log('err', err); }
          );
          break;
        case 'terms':
          this.getTermsLink().subscribe(
            (termsLink: string) => {
              result.push({
                propName: 'terms',
                link: termsLink,
                title: 'The Terms and Conditions',
                titleShort: 'The Terms and Conditions',
              });
              gotLinks++;
              if (gotLinks === props.length) {
                if (callback) { callback(result); }
              }
            },
            (err: any) => { console.log('err', err); }
          );
          break;
        case 'eula':
          this.getEulaLink().subscribe(
            (eulaLink: string) => {
              result.push({
                propName: 'eula',
                link: eulaLink,
                title: 'End User License Agreement',
                titleShort: 'EULA',
              });
              gotLinks++;
              if (gotLinks === props.length) {
                if (callback) { callback(result); }
              }
            },
            (err: any) => { console.log('err', err); }
          );
          break;
      }
    });
  }

  public checkAgreements(callback: any) {
    let isAgreed: any = {
      privacy: false,
      terms: false,
      eula: false,
      privacyLink: '',
      termsLink: '',
      eulaLink: '',
      linksToRequest: 0,
      shouldAgree: [],
      result: []
    };
    this.isPrivacyAgreed().subscribe(
      (isPrivacy: boolean) => {
        isAgreed.privacy = isPrivacy;
        if (!isPrivacy) { isAgreed.shouldAgree.push('privacy'); }
        this.isTermsAgreed().subscribe(
          (isTerms: boolean) => {
            isAgreed.terms = isTerms;
            if (!isTerms) { isAgreed.shouldAgree.push('terms'); }
            this.isEulaAgreed().subscribe(
              (isEula: boolean) => {
                isAgreed.eula = isEula;
                if (!isEula) { isAgreed.shouldAgree.push('eula'); }
                if (callback) { callback(isAgreed); }
                // let gotLinks: number = 0;
                // for (let prop in isAgreed) {
                //   if (prop && !isAgreed[prop]) {
                //     switch (prop) {
                //       case 'privacy':
                //         this.getPrivacyLink().subscribe(
                //           (privacyLink: string) => {
                //             isAgreed.privacyLink = privacyLink;
                //             isAgreed.result.push({
                //               propName: 'privacy',
                //               link: privacyLink,
                //               title: 'The General Privacy agreement',
                //               titleShort: 'Privacy Policy',
                //             });
                //             gotLinks++;
                //             if (gotLinks === isAgreed.linksToRequest) {
                //               if (callback) { callback(isAgreed); }
                //             }
                //           },
                //           (err: any) => { console.log('err', err); }
                //         );
                //         break;
                //       case 'terms':
                //         this.getTermsLink().subscribe(
                //           (termsLink: string) => {
                //             isAgreed.termsLink = termsLink;
                //             isAgreed.result.push({
                //               propName: 'terms',
                //               link: termsLink,
                //               title: 'The Terms and Conditions',
                //               titleShort: 'The Terms and Conditions',
                //             });
                //             gotLinks++;
                //             if (gotLinks === isAgreed.linksToRequest) {
                //               if (callback) { callback(isAgreed); }
                //             }
                //           },
                //           (err: any) => { console.log('err', err); }
                //         );
                //         break;
                //       case 'eula':
                //         this.getEulaLink().subscribe(
                //           (eulaLink: string) => {
                //             isAgreed.privacyLink = eulaLink;
                //             isAgreed.result.push({
                //               propName: 'eula',
                //               link: eulaLink,
                //               title: 'End User License Agreement',
                //               titleShort: 'EULA',
                //             });
                //             gotLinks++;
                //             if (gotLinks === isAgreed.linksToRequest) {
                //               if (callback) { callback(isAgreed); }
                //             }
                //           },
                //           (err: any) => { console.log('err', err); }
                //         );
                //         break;
                //     }
                //   }
                // }
              },
              (err: any) => { console.log('err', err); }
            );
          },
          (err: any) => { console.log('err', err); }
        );
      },
      (err: any) => { console.log('err', err); }
    )
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
