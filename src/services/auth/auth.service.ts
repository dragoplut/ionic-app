import { Injectable } from '@angular/core';
import { ApiService } from '../index';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { APP_USER } from '../../app/constants';

@Injectable()
export class AuthService {

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
        console.log('authenticate res: ', res, ' userData: ', userData);
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

  public signOut() {
    localStorage.removeItem(APP_USER);
    this.api.post('/auth/signOut', {})
      .subscribe(
        (done: any) => { console.log('done', done); },
        (err: any) => { console.log('err', err); }
      );
  }
}
