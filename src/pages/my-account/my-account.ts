import { Component } from '@angular/core';
import { AccountService } from '../../services/index';
import { ActionSheetController, NavController } from 'ionic-angular'

import {
  API_URL,
  APP_VERSION,
  ANGLE_IMG,
  DPW_LOGO_TRANSPARENT,
  USER_PROFILE_IMG
} from '../../app/constants';

import {
  MyNameComponent,
  MyPasswordComponent,
  HomeMenu,
  SigninComponent
} from '../index';

@Component({
  selector: 'my-account',
  templateUrl: 'my-account.html'
})
export class MyAccountComponent {

  public account: any = {};
  public logoTransparent: string = DPW_LOGO_TRANSPARENT;
  public userProfileImg: string = USER_PROFILE_IMG;
  public angleImg: string = ANGLE_IMG;
  public apiUrl: string = API_URL;
  public appVersion: string = APP_VERSION;

  constructor(
    public navCtrl: NavController,
    public actionSheetCtrl: ActionSheetController,
    public _account: AccountService
  ) {}

  public ionViewDidLoad() {
    this.account.email = atob(localStorage.getItem('app_email'));
  }

  public presentLogOutConfirm() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Are you sure you want to log out ?',
      buttons: [
        {
          text: 'Log Out',
          role: 'destructive',
          handler: () => {
            console.log('Destructive clicked');
            this.logOut();
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });

    actionSheet.present();
  }

  public navigateTo(pageName) {
    switch (pageName) {
      case 'MyName':
        this.openPage(MyNameComponent);
        break;
      case 'MyPassword':
        this.openPage(MyPasswordComponent);
        break;
      default:
        break;
    }
  }

  public logOut() {
    this.openPage(SigninComponent);
  }

  public goBack() {
    this.openPage(HomeMenu);
  }

  public openPage(page) {
    this.navCtrl.push(page);
  }
}
