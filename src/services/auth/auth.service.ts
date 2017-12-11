import { Injectable } from '@angular/core';
import { ApiService } from '../index';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { APP_USER } from '../../app/constants';
// noinspection TypeScriptCheckImport
import * as _ from 'lodash';

@Injectable()
export class AuthService {
  public path: string = '/Auth';
  public newPasswordFields: any[] = [
    'currentPassword',
    'newPassword'
  ];

  constructor(
    private api: ApiService
  ) {}

  public isAuthorized(): boolean {
    // TODO: Bind user role logic here!
    return true;
  }

  public getCurrentUser() {
    const currentUser: any = localStorage.getItem(APP_USER);
    return currentUser ? JSON.parse(atob(currentUser)) : this.signOut();
  }

  public canActivate(): boolean {
    const canActivate = this.isAuthorized();
    return canActivate;
  }

  public authenticate(credits): Observable<any> {
    return this.api.post(`/auth/signIn`, credits)
      .map((res: any) => {
        const userData: string = JSON.stringify(res);
        localStorage.setItem(APP_USER, btoa(userData));
        return res;
      });
  }

  public getRoles(): Observable<any> {
    return this.api.get(`/user/getAllRoles`)
      .map((res: any) => res);
  }

  public getCompanies(): Observable<any> {
    return this.api.get(`/user/getAllCompanies`)
      .map((res: any) => res);
  }

  public sendReset(email: string): Observable<any> {
    return this.api.post('/account/reset_password/' + email, {});
  }

  public sendResetPassword(password: string, token?: string): Observable<any> {
    return this.api.post('/account/set_password/' + token, { password });
  }

  public signupConfirm(jwtToken: string): Observable<any> {
    return this.api.post('/signup/confirm', { token: jwtToken });
  }

  public checkAuth(response) {
    console.log('checkAuth check:', response);
  }

  public signOut(): Observable<any> {
    return this.api.post('/auth/signOut', {})
      .map(
        (done: any) => {
          localStorage.removeItem(APP_USER);
          localStorage.removeItem('token_mobile');
          localStorage.removeItem('app_email');
          return done;
        },
        (err: any) => err
      );
  }

  public generateToken(credentials: any): Observable<any> {
    localStorage.removeItem('token_mobile');
    localStorage.removeItem('app_email');
    return this.api.post(`${this.path}/generateToken`, credentials)
      .map((res: any) => {
        // const userData: string = JSON.stringify(res);
        // localStorage.setItem(APP_USER, btoa(userData));
        localStorage.setItem('token_mobile', btoa(res.token));
        localStorage.setItem('app_email', btoa(credentials.email));
        return res;
      });
  }

  public changePassword(credentials: any): Observable<any> {
    const newPassword: any = _.pick(credentials, this.newPasswordFields);
    // {
    //  "currentPassword": "string",
    //  "newPassword": "string"
    // }
    return this.api.post(`${this.path}/changePassword`, newPassword);
  }

  public resetPassword(email: any): Observable<any> {
    // {
    //  "currentPassword": "string",
    //  "newPassword": "string"
    // }
    return this.api.post(`${this.path}/resetPassword`, { email });
  }

}
