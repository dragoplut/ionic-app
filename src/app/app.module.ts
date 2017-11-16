import { NgModule, ErrorHandler } from '@angular/core';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { BLE } from '@ionic-native/ble';

import * as components from '../components/index';
import * as pages from '../pages/index';
import * as services from '../services/index';

export const mapValuesToArray = (item: any) => Object.keys(item).map((key: any) => item[key]);

@NgModule({
  declarations: [
    MyApp,
    ...mapValuesToArray(components),
    ...mapValuesToArray(pages)
  ],
  imports: [
    BrowserModule,
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
    BluetoothSerial,
    StatusBar,
    SplashScreen,
    BLE,
    ...mapValuesToArray(services),
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ]
})
export class AppModule { }
