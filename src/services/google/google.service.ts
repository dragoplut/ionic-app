import { Injectable, Inject } from '@angular/core';
import { Platform } from "ionic-angular";
import { Http } from '@angular/http';
import {
  GOOGLE_API_KEY_ANDROID,
  // GOOGLE_API_KEY_IOS,
  GOOGLE_MAP_API_URL
} from '../../app/constants';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
// noinspection TypeScriptCheckImport
import * as _ from 'lodash';

const GOOGLE_API_URL: string = "https://maps.googleapis.com/maps/api/place/";
const GOOGLE_KEY: string = "AIzaSyDJYtcVzKXghryIDmQaTBDp5gWYPbTBqfU";

@Injectable()
export class GoogleService {

  constructor(
    @Inject(Http) public http: Http,
    public platform: Platform
  ) {}

  /**
   * Init Google maps for next use in app.
   * Done only once on app start.
   */
  public initGoogleMaps() {
    // const apiKey: string = this.platform.is('ios') ?
    //   GOOGLE_API_KEY_IOS : GOOGLE_API_KEY_ANDROID;
    const apiKey: string = GOOGLE_API_KEY_ANDROID;
    let script = document.createElement("script");
    script.id = 'googleMaps';
    script.src = `${GOOGLE_MAP_API_URL}?key=${apiKey}&callback=mapInited`;

    document.body.appendChild(script);
  }

  public predictAddress(input: string): Observable<any> {
    const params: string = '&types=geocode';
    return this.http.get(GOOGLE_API_URL + "autocomplete/json?input=" + input + "&key=" + GOOGLE_KEY + params)
      .map((res: any) => {
        const resData: any = res.json();
        return resData.predictions[0];
      });
  }

  public predictLatLng(item: any): Observable<any> {
    return this.http.get(GOOGLE_API_URL + "details/json?placeid=" + item.place_id + "&language=en_US&key=" + GOOGLE_KEY)
      .map((result: any) => {
        let latLng: any = {};
        const data: any = result.json();
        const address: any = data.result;
        if (address.geometry && address.geometry.location && address.geometry.location.lat) {
          latLng.postal_code = _.get(_.find(address.address_components, { types: [ "postal_code" ] }), 'short_name');
          latLng.lat = address.geometry.location.lat;
          latLng.lng = address.geometry.location.lng;
        }
        return latLng;
      });
  }
}
