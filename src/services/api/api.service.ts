import { Injectable, OnInit } from '@angular/core';
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

@Injectable()
export class ApiService implements OnInit {

  public headers: Headers = new Headers({
    'Accept': 'application/json',
    'Content-type': 'application/json-patch+json'
  });
  public token: string = '';
  protected endpoint: string = 'http://regen-dev.azurewebsites.net/api/mobile';

  constructor(
    public http: Http
  ) {}

  public ngOnInit() {
    this.headers = new Headers({
      'Accept': 'application/json',
      'Content-type': 'application/json-patch+json'
    });
  }

  public get(path: string): Observable<any> {
    return this.http.get(`${this.endpoint}${path}`, this.getDefaultOptions())
      .map(this.checkForError)
      .catch((err: any) => Observable.throw(err))
      .map(this.getJson);
  }

  public getByUrl(url: string): Observable<any> {
    return this.http.get(`${url}`)
      .map(this.checkForError)
      .catch((err: any) => Observable.throw(err))
      .map((resp: any) => {
        console.log(resp);
        return resp;
      });
  }

  public post(path, body): Observable<any> {
    return this.http.post(
      `${this.endpoint}${path}`,
      JSON.stringify(body),
      this.getDefaultOptions()
      )
      .map(this.checkForError)
      .catch((err: any) => Observable.throw(err))
      .map(this.getJson);
  }

  public put(path: string, body: any): Observable<any> {
    return this.http.put(
      `${this.endpoint}${path}`,
      JSON.stringify(body),
      this.getDefaultOptions()
      )
      .map(this.checkForError)
      .catch((err: any) => Observable.throw(err))
      .map(this.getJson);
  }

  public delete(path: string): Observable<any> {
    return this.http.delete(`${this.endpoint}${path}`, this.getDefaultOptions())
      .map(this.checkForError)
      .catch((err: any) => Observable.throw(err))
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
