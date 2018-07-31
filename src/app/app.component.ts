import { Component, ViewChild } from '@angular/core';
import { App, Nav, Platform, ViewController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import * as pages from '../pages/index';
import { GoogleService } from '../services/index';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  public rootPage: any = pages.SigninComponent;

  public pages: Array<{ title: string, component: any }>;
  public backPressed: boolean = false;

  constructor(
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    private app: App,
    private _google: GoogleService
  ) {
    this.pages = [];
    this.initApp();
  }

  public initApp() {
    this.platform.ready().then(() => {
      this._google.initGoogleMaps();
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.overlaysWebView(true);
      //this.statusBar.styleDefault();
      if (this.platform.is('android')) {
        this.statusBar.backgroundColorByHexString("#33000000");
      } else {
        this.statusBar.overlaysWebView(false);
        // this.statusBar.styleBlackTranslucent();
        this.statusBar.styleDefault();
        this.statusBar.overlaysWebView(true);
      }
      this.splashScreen.hide();
      this.platform.registerBackButtonAction(() => {
        let nav = this.app.getActiveNav();
        let activeView: ViewController = nav.getActive();

        if(activeView != null){
          if (!this.backPressed) {
            this.backPressed = true;
            setTimeout(() => {
              this.backPressed = false;
              if(nav.canGoBack() && typeof activeView.instance.backButtonAction !== 'function') {
                nav.pop();
              } else if (typeof activeView.instance.backButtonAction === 'function') {
                activeView.instance.backButtonAction();
              } else if (nav.canGoBack()) {
                nav.pop();
              } else {
                if (nav && nav.parent) {
                  nav.parent.select(0); // goes to the first tab
                }
              }
            }, 300);
          } else {
            this.platform.exitApp();
          }

        }
      });
    });
  }

  public openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }
}
