import { Injectable } from '@angular/core';
import { Platform } from "ionic-angular";
import {
  GOOGLE_API_KEY_ANDROID,
  GOOGLE_API_KEY_IOS,
  GOOGLE_MAP_API_URL
} from '../../app/constants';

@Injectable()
export class GoogleService {

  constructor(public platform: Platform) {}

  /**
   * Init Google maps for next use in app.
   * Done only once on app start.
   */
  public initGoogleMaps() {
    const apiKey: string = this.platform.is('ios') ?
      GOOGLE_API_KEY_IOS : GOOGLE_API_KEY_ANDROID;
    let script = document.createElement("script");
    script.id = 'googleMaps';
    script.src = `${GOOGLE_MAP_API_URL}?key=${apiKey}&callback=mapInited`;

    document.body.appendChild(script);
  }
}
