import { Component, OnInit } from '@angular/core';

import { NavController } from 'ionic-angular';

import {
  ANGLE_IMG,
  DPW_CLINIC_CARD,
  DPW_PEN_CARD,
  DPW_LOGO_TRANSPARENT,
  USER_PROFILE_IMG
} from '../../app/constants';
import { AccountService, AuthService } from '../../services'

import {
  LegalsComponent,
  SigninComponent,
  MyAccountComponent,
  MyClinicComponent,
  MyPenComponent
} from '../';

@Component({
  selector: 'home-menu',
  templateUrl: 'home-menu.html'
})
export class HomeMenu implements OnInit {

  public logoTransparent: string = DPW_LOGO_TRANSPARENT;
  public clinicImg: string = DPW_CLINIC_CARD;
  public penImg: string = DPW_PEN_CARD;
  public userProfileImg: string = USER_PROFILE_IMG;
  public angleImg: string = ANGLE_IMG;

  constructor(
    public _auth: AuthService,
    public _account: AccountService,
    public navCtrl: NavController
  ) {

  }

  public ngOnInit() {
    // this._account.isAgreementAgreed().subscribe(
    //   (isAgreed: boolean) => {
    //     if (!isAgreed) {
    //       this.openPage(LegalsComponent, { isEula: true })
    //     }
    //   },
    //   (err: any) => {
    //     alert(JSON.stringify(err));
    //   }
    // );
    this._account.checkAgreements((resp: any) => {
      if (resp && resp.shouldAgree && resp.shouldAgree.length) {
        this.openPage(LegalsComponent, { shouldAgree: resp.shouldAgree });
      }
    });
  }

  public ionViewDidLoad() {
    if (!localStorage.getItem('token_mobile')) {
      console.log('NO token found!');
      this._auth.signOut().subscribe(
        (resp: any) => {
          this.openPage(SigninComponent);
        },
        (err: any) => {
          console.log(err);
        }
      );
    } else {
      console.log('Token found.');
    }
  }

  public backButtonAction() {
    this.goBack();
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

  public openPage(page: any, params?: any) {
    this.navCtrl.push(page, params);
  }
}
