import * as Raven from 'raven-js';
import { NgModule, ErrorHandler, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule } from 'ionic-angular';
import { MyApp } from './app.component';

import { GoogleMaps } from '@ionic-native/google-maps';
import { Camera } from '@ionic-native/camera';

import { MomentModule } from 'angular2-moment';
import { NgCircleProgressModule } from 'ng-circle-progress';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { PdfViewerModule } from 'ng2-pdf-viewer';

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

// export const mapValuesToArray = (item: any) => Object.keys(item).map((key: any) => item[key]);

@NgModule({
  declarations: [
    MyApp,
    components.CustomInputComponent,
    components.CustomProgressBarComponent,
    components.CustomSelectComponent,
    components.GooglePlacesAutocompleteComponent,
    components.InputSelectComponent,
    components.RowWithActionComponent,
    components.RowWithInfoComponent,
    pages.CreateAccountComponent,
    pages.CreateAccountAddressComponent,
    pages.CreateAccountClinicComponent,
    pages.EditClinicComponent,
    pages.ForgottenPasswordComponent,
    pages.HomeMenu,
    pages.LegalsComponent,
    pages.MyAccountComponent,
    pages.MyClinicComponent,
    pages.MyNameComponent,
    pages.MyPasswordComponent,
    pages.MyPenComponent,
    pages.RegisterClinicAddressComponent,
    pages.RegisterClinicContactsComponent,
    pages.RegisterPenComponent,
    pages.RegisterPenToClinicComponent,
    pages.SigninComponent,
    pages.UpdatePenComponent
  ],
  imports: [
    MomentModule,
    BrowserModule,
    PdfViewerModule,
    CommonModule,
    HttpModule,
    IonicModule.forRoot(
      MyApp,
      {
        scrollAssist: true,
        autoFocusAssist: true
      },
      { links: [] }),
    NgCircleProgressModule.forRoot({
      // set defaults here
      radius: 100,
      outerStrokeWidth: 6,
      innerStrokeWidth: 6,
      outerStrokeColor: "#24408e",
      innerStrokeColor: "#b3b3b3",
      animationDuration: 300
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    components.CustomInputComponent,
    components.CustomProgressBarComponent,
    components.CustomSelectComponent,
    components.GooglePlacesAutocompleteComponent,
    components.InputSelectComponent,
    components.RowWithActionComponent,
    components.RowWithInfoComponent,
    pages.CreateAccountComponent,
    pages.CreateAccountAddressComponent,
    pages.CreateAccountClinicComponent,
    pages.EditClinicComponent,
    pages.ForgottenPasswordComponent,
    pages.HomeMenu,
    pages.LegalsComponent,
    pages.MyAccountComponent,
    pages.MyClinicComponent,
    pages.MyNameComponent,
    pages.MyPasswordComponent,
    pages.MyPenComponent,
    pages.RegisterClinicAddressComponent,
    pages.RegisterClinicContactsComponent,
    pages.RegisterPenComponent,
    pages.RegisterPenToClinicComponent,
    pages.SigninComponent,
    pages.UpdatePenComponent
  ],
  providers: [
    GoogleMaps,
    Camera,
    BluetoothSerial,
    StatusBar,
    SplashScreen,
    BLE,
    services.ApiService,
    services.AccountService,
    services.AuthService,
    services.BleService,
    services.ClinicService,
    services.FirmwareService,
    services.GoogleService,
    services.PenService,
    services.PermissionService,
    services.UtilService,
    { provide: ErrorHandler, useClass: RavenErrorHandler }
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class AppModule { }
