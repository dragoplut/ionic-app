import { Injectable, OnInit } from '@angular/core';
import { AlertController } from 'ionic-angular';
import {
  Headers,
  Http,
  Response,
  RequestOptions
} from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/timeout';
import { API_URL, NETWORK_TIMEOUT } from '../../app/constants';

@Injectable()
export class ApiService implements OnInit {

  public headers: Headers = new Headers({
    'Accept': 'application/json',
    'Content-type': 'application/json-patch+json'
  });
  public token: string = '';
  // Environment URL
  protected endpoint: string = API_URL;

  constructor(
    public http: Http,
    public alertCtrl: AlertController
  ) {}

  public ngOnInit() {
    this.headers = new Headers({
      'Accept': 'application/json',
      'Content-type': 'application/json-patch+json'
    });
  }

  public get(path: string): Observable<any> {
    return this.http.get(`${this.endpoint}${path}`, this.getDefaultOptions())
      .timeout(NETWORK_TIMEOUT)
      .map(this.checkForError)
      .catch((err: any) => {
        this.checkAndShowAlert(err);
        return Observable.throw(err);
      })
      .map(this.getJson);
  }

  public getByUrl(url: string): Observable<any> {
    return this.http.get(`${url}`)
      .timeout(NETWORK_TIMEOUT)
      .map(this.checkForError)
      .catch((err: any) => {
        this.checkAndShowAlert(err);
        return Observable.throw(err);
      })
      .map((resp: any) => resp);
  }

  public post(path, body): Observable<any> {
    return this.http.post(
      `${this.endpoint}${path}`,
      JSON.stringify(body),
      this.getDefaultOptions()
      )
      .timeout(NETWORK_TIMEOUT)
      .map(this.checkForError)
      .catch((err: any) => {
        this.checkAndShowAlert(err);
        return Observable.throw(err);
      })
      .map(this.getJson);
  }

  public put(path: string, body: any): Observable<any> {
    return this.http.put(
      `${this.endpoint}${path}`,
      JSON.stringify(body),
      this.getDefaultOptions()
      )
      .timeout(NETWORK_TIMEOUT)
      .map(this.checkForError)
      .catch((err: any) => {
        this.checkAndShowAlert(err);
        return Observable.throw(err);
      })
      .map(this.getJson);
  }

  public delete(path: string): Observable<any> {
    return this.http.delete(`${this.endpoint}${path}`, this.getDefaultOptions())
      .timeout(NETWORK_TIMEOUT)
      .map(this.checkForError)
      .catch((err: any) => {
        this.checkAndShowAlert(err);
        return Observable.throw(err);
      })
      .map(this.getJson);
  }

  public setHeaders(headers: any) {
     Object.keys(headers)
      .forEach((header: any) => this.headers.set(header, headers[header]));
  }

  public getJson(resp: Response | any) {
    if (resp && (!resp._body || (resp._body && resp._body[0] === '<'))) {
      resp._body = '{}';
    }
    return resp.json();
  }

  public checkForError(resp: Response): Response {
    if (resp.status >= 200 && resp.status < 300) {
      return resp;
    } else if (resp.status === 401) {
      const error = new Error(resp.statusText);
      error['response'] = resp;
      this.post('/auth/signOut', {})
        .subscribe(
          (done: any) => { console.log('checkForError done: ', done); },
          (err: any) => { console.log('checkForError err: ', err); }
        );
      throw error;
    } else {
      const error = new Error(resp.statusText);
      error['response'] = resp;
      throw error;
    }
  }

  public setHeadersToken() {
    const tokenEncrypted: any = localStorage.getItem('token_mobile');
    this.token = tokenEncrypted ? atob(tokenEncrypted) : '';
    this.setHeaders({ Authorization: `Bearer ${this.token}` });
  }

  /**
   * Show error alert if network connection issue occurs
   * @param err
   */
  public checkAndShowAlert(err: any) {
    if (err && (err.name === 'TimeoutError' || err.status === 0)) {
      const alert: any = this.alertCtrl.create({
        title: 'Error',
        subTitle: 'Network connection error.',
        buttons: ['OK']
      });
      alert.present();
    }
  }

  protected getDefaultOptions(): RequestOptions {
    const tokenEncrypted: any = localStorage.getItem('token_mobile');
    this.token = tokenEncrypted ? atob(tokenEncrypted) : '';
    const headers: any = tokenEncrypted ?
      new Headers({
        'Accept': 'application/json',
        'Content-type': 'application/json-patch+json',
        'Authorization': `Bearer ${this.token}`
      }) :
      new Headers({
        'Accept': 'application/json',
        'Content-type': 'application/json-patch+json'
      });
    let options: RequestOptions = new RequestOptions({ headers });
    options.withCredentials = true;
    return options;
  }

  protected getAzureOptions(): RequestOptions {
    const headers: any = new Headers({
        'Content-type': 'application/octet-stream\n',
        'Authorization': `SharedKeyLite`
      });
    return new RequestOptions({ headers });
  }
}
