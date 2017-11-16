import { Component, ViewChild, OnInit } from '@angular/core';
import { AuthService, ApiService, PermissionService } from '../../services/index';
import {
  ANGLE_IMG,
  CHECK,
  DEFAULT_ERROR_MESSAGE,
  DPW_LOGO_TRANSPARENT,
  EMAIL_REGEXP,
  PAGES_LIST
} from '../../app/constants';
import { CreateAccountAddressComponent, SigninComponent } from '../index';
import { Nav, NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'create-account',
  templateUrl: `./create-account.html`
})
export class CreateAccountComponent implements OnInit {
  @ViewChild(Nav) nav: Nav;

  public user: any = { email: '', password: '' };
  public logoTransparent: string = DPW_LOGO_TRANSPARENT;
  public loading: boolean = false;
  public errorMessage: any = '';
  public PAGES_LIST: any = PAGES_LIST;
  public angleImg: string = ANGLE_IMG;

  public emailRegExp: any = EMAIL_REGEXP;

  // TODO: Remove signin page blocker for prod
  public approved: boolean = false;
  public pwd: any = '';

  public createAccInputs: any = [
    { modelName: 'firstName', placeholder: 'First Name', type: 'text', required: false },
    { modelName: 'lastName', placeholder: 'Last Name', type: 'text', required: false },
    { modelName: 'companyName', placeholder: 'Company Name', type: 'text', required: false },
    { modelName: 'email', placeholder: 'Email', type: 'email', required: true },
    { modelName: 'password', placeholder: 'Password', type: 'password', required: true },
    { modelName: 'confirmPassword', placeholder: 'Confirm Password', type: 'password', required: true },
    { modelName: 'phoneNumber', placeholder: 'Phone Number', type: 'text', required: false }
  ];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public _api: ApiService,
    public _auth: AuthService,
    public _permission: PermissionService
  ) {}

  public ionViewDidLoad() {
    this.user.email = this.navParams.get('email');
  }

  public ngOnInit() {
    this._api.setHeaders({});
    let pwdCheck: any = sessionStorage.getItem('app_check');
    if (pwdCheck && pwdCheck === CHECK) {
      this.approved = true;
    }
  }

  public showErrorMessage(message?: string) {
    this.errorMessage = message ? message : DEFAULT_ERROR_MESSAGE;
  }

  public makeCheck() {
    if (this.pwd && btoa(this.pwd) === CHECK) {
      sessionStorage.setItem('app_check', CHECK);
      this.approved = true;
    } else {
      this.approved = false;
    }
    return this.approved;
  }

  public goToReset() {
    console.log('goToReset');
  }

  public clearError() {
    this.errorMessage = '';
  }

  public validateItem(field: any) {
    let errMessage: string = '';

    switch (field.type) {
      case 'email':
        errMessage = !this.emailRegExp.test(this.user.email) && this.user.email ?
          'Email is invalid' : '';
        break;
      case 'password':
        if (field.modelName === 'password') {
          errMessage = !this.user.password || this.user.password.length < 4 ?
            'Min length is 4 characters' : '';
        } else {
          if (!this.user.confirmPassword || this.user.confirmPassword.length < 4) {
            errMessage = !this.user.confirmPassword || this.user.confirmPassword.length < 4 ?
              'Min length is 4 characters' : '';
          } else if (this.user.confirmPassword && this.user.confirmPassword !== this.user.password) {
            errMessage = 'Confirm password and password do not match!'
          }
        }
        break;
      default:
        break;
    }

    return errMessage;
  }

  public handleSuccess(resp: any) {
    this.loading = false;
    if (this._permission.isAllowedAction('view', 'signin')) {
      for (const page of this.PAGES_LIST) {
        if (this._permission.isAllowedAction('view', page.permissionRef)) {
          console.log('handleSuccess page.routerLink: ', page.routerLink);
          this.openPage(SigninComponent);
          break;
        }
      }
    } else {
      // this._auth.signOut();
      const message: string = 'You are not allowed to sign in!';
      this.showErrorMessage(message);
    }
    return resp;
  }

  public handleErr(err: any) {
    this.loading = false;
    const message = err && err._body ?
      JSON.parse(err._body) : { error: { message: DEFAULT_ERROR_MESSAGE } };
    this.showErrorMessage(message.error.message);
    return err && err._body ? JSON.parse(err._body) : message;
  }

  public authenticate() {
    this.loading = true;
    this._auth.authenticate(this.user)
      .subscribe(
        (resp: any) => this.handleSuccess(resp),
        (err: any) => this.handleErr(err)
      );
  }

  public goToSignin() {
    console.log('goToSignin');
    this.openPage(SigninComponent);
  }

  public next() {
    this.openPage(CreateAccountAddressComponent);
  }

  public openPage(page) {
    this.navCtrl.push(page, { account: this.user });
  }
}
