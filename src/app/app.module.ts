import * as Raven from 'raven-js';
import { NgModule, ErrorHandler, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule } from 'ionic-angular';
import { MyApp } from './app.component';

import { GoogleMaps } from '@ionic-native/google-maps';
import { Camera } from '@ionic-native/camera';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { BLE } from '@ionic-native/ble';

import * as components from '../components/index';
import * as pages from '../pages/index';
import * as services from '../services/index';

/** Config "Sentry" raven errors logger service **/
Raven
  .config('https://afa5fddabf534b62832c6a6682afa26e@sentry.io/258024')
  .install();

export class RavenErrorHandler implements ErrorHandler {
  handleError(err:any) : void {
    /** Uncomment only for dev testing purpose **/
    // console.error(err);
    Raven.captureException(err);
  }
}

export const mapValuesToArray = (item: any) => Object.keys(item).map((key: any) => item[key]);

@NgModule({
  declarations: [
    MyApp,
    ...mapValuesToArray(components),
    ...mapValuesToArray(pages)
  ],
  imports: [
    BrowserModule,
    CommonModule,
    HttpModule,
    IonicModule.forRoot(MyApp, {}, { links: [] })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    ...mapValuesToArray(components),
    ...mapValuesToArray(pages)
  ],
  providers: [
    GoogleMaps,
    Camera,
    BluetoothSerial,
    StatusBar,
    SplashScreen,
    BLE,
    ...mapValuesToArray(services),
    { provide: ErrorHandler, useClass: RavenErrorHandler }
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class AppModule { }
