import { Component, ViewChild, OnInit } from '@angular/core';
import { AuthService, ApiService, PermissionService } from '../../services/index';
import {
  ANGLE_IMG,
  DPW_LOGO_TRANSPARENT
} from '../../app/constants';
import { SigninComponent } from '../index';
import { Nav, NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'forgotten-password',
  templateUrl: `./forgotten-password.html`
})
export class ForgottenPasswordComponent implements OnInit {
  @ViewChild(Nav) nav: Nav;

  public logoTransparent: string = DPW_LOGO_TRANSPARENT;
  public angleImg: string = ANGLE_IMG;

  public email: string = 'developer@dermapenworld.com';
  public emailResent: boolean = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public _api: ApiService,
    public _auth: AuthService,
    public _permission: PermissionService
  ) {}

  public ionViewDidLoad() {
    this.email = this.navParams.get('email');
  }

  public ngOnInit() {
    this._api.setHeaders({});
  }

  public resendEmail() {
    this._auth.resetPassword(this.email).subscribe(
      (resp: any) => {
        this.emailResent = true;
      },
      (err: any) => {
        console.log('err: ', err);
      }
    );

    console.log('resendEmail');
  }

  public goBack() {
    this.openPage(SigninComponent);
  }

  public goToSignin() {
    console.log('goToSignin');
    this.openPage(SigninComponent);
  }

  public openPage(page) {
    this.navCtrl.push(page);
  }
}
