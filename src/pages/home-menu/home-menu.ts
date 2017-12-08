import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';

import {
  ANGLE_IMG,
  DPW_CLINIC_CARD,
  DPW_PEN_CARD,
  DPW_LOGO_TRANSPARENT,
  USER_PROFILE_IMG
} from '../../app/constants';
// import { AuthService } from '../../services/index'

import {
  SigninComponent,
  MyAccountComponent,
  MyClinicComponent,
  MyPenComponent
} from '../index';

@Component({
  selector: 'home-menu',
  templateUrl: 'home-menu.html'
})
export class HomeMenu {

  public logoTransparent: string = DPW_LOGO_TRANSPARENT;
  public clinicImg: string = DPW_CLINIC_CARD;
  public penImg: string = DPW_PEN_CARD;
  public userProfileImg: string = USER_PROFILE_IMG;
  public angleImg: string = ANGLE_IMG;

  constructor(
    // public _auth: AuthService,
    public navCtrl: NavController
  ) {

  }

  public ionViewDidLoad() {
    if (!localStorage.getItem('token_mobile')) {
      // this._auth.signOut();
    }
  }

  public goBack() {
    this.openPage(SigninComponent)
  }

  public goToPen() {
    this.openPage(MyPenComponent)
  }

  public goToClinic() {
    this.openPage(MyClinicComponent)
  }

  public goToProfile() {
    this.openPage(MyAccountComponent)
  }

  public openPage(page) {
    this.navCtrl.push(page);
  }
}
