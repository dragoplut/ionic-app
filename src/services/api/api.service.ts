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
  protected endpoint: string = 'http://regen-dev.azurewebsites.net/api';

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

  public setHeaders(headers) {
     Object.keys(headers)
      .forEach((header: any) => this.headers.set(header, headers[header]));
  }

  public getJson(resp: Response) {
    return resp.json();
  }

  public checkForError(resp: Response): Response {
    if (resp.status >= 200 && resp.status < 300) {
      console.log('OK: resp', resp);
      return resp;
    } else if (resp.status === 401) {
      console.log('AUTH ERR: resp', resp);
      const error = new Error(resp.statusText);
      error['response'] = resp;
      this.post('/auth/signOut', {})
        .subscribe(
          (done: any) => { console.log('checkForError done: ', done); },
          (err: any) => { console.log('checkForError err: ', err); }
        );
      throw error;
    } else {
      console.log('ERR: resp', resp);
      const error = new Error(resp.statusText);
      error['response'] = resp;
      throw error;
    }
  }

  protected getDefaultOptions(): RequestOptions {
    const headers: any = new Headers({
      'Accept': 'application/json',
      'Content-type': 'application/json-patch+json'
    });
    let options: RequestOptions = new RequestOptions({ headers });
    options.withCredentials = true;
    return options;
  }
}
