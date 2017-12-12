import { Component, ViewChild, OnInit } from '@angular/core';
import {
  AuthService,
  ApiService,
  AccountService,
  PermissionService
} from '../../services/index';
import {
  ANGLE_IMG,
  DEFAULT_ERROR_MESSAGE,
  DPW_LOGO_TRANSPARENT,
  EMAIL_REGEXP,
  PAGES_LIST,
  US_CITY_NAMES
} from '../../app/constants';
import {
  CreateAccountClinicComponent,
  CreateAccountComponent,
  SigninComponent
} from '../index';
import { Nav, NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'create-account-address',
  templateUrl: `./create-account-address.html`
})
export class CreateAccountAddressComponent implements OnInit {
  @ViewChild(Nav) nav: Nav;

  public account: any = { location: {} };
  public user: any = { email: '', password: '' };
  public logoTransparent: string = DPW_LOGO_TRANSPARENT;
  public loading: boolean = false;
  public formValid: boolean = false;
  public errorMessage: any = '';
  public PAGES_LIST: any = PAGES_LIST;
  public angleImg: string = ANGLE_IMG;

  public emailRegExp: any = EMAIL_REGEXP;
  public usCityNames: any[] = US_CITY_NAMES;

  public dependencies: any = {};

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public _api: ApiService,
    public _auth: AuthService,
    public _account: AccountService,
    public _permission: PermissionService
  ) {}

  public ionViewDidLoad() {
    this.account = this.navParams.get('account');
    if (!this.account.location) {
      this.account.location = {};
    }
    this.onChangeValidate();
  }

  public ngOnInit() {
    this._api.setHeaders({});
  }

  public showErrorMessage(message?: string) {
    this.errorMessage = message ? message : DEFAULT_ERROR_MESSAGE;
  }

  public goToReset() {
    console.log('goToReset');
  }

  public clearError() {
    this.errorMessage = '';
  }

  public handleSuccess(resp: any) {
    this.loading = false;
    if (this._permission.isAllowedAction('view', 'signin')) {
      for (const page of this.PAGES_LIST) {
        if (this._permission.isAllowedAction('view', page.permissionRef)) {
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
    this.formValid = false;
    const message = err && err._body ?
      JSON.parse(err._body) : { error: { message: DEFAULT_ERROR_MESSAGE } };
    alert(message.error.message);
    return err && err._body ? JSON.parse(err._body) : message;
  }

  public onChangeValidate() {
    let isValid = true;
    if (!this.account.location ||
        !this.account.location.country ||
        !this.account.location.country.length ||
        !this.account.location.city ||
        !this.account.location.city.length) {
      isValid = false;
    }
    this.formValid = isValid;
  }

  public back() {
    this.openPage(CreateAccountComponent);
  }

  public next() {
    if (!this.account.created) {
      this.loading = true;
      this._account.createAccount(this.account).subscribe(
        (resp: any) => {
          this.account.created = resp;
          this.loading = false;
          this.authenticate();
        },
        (err: any) => {
          this.loading = false;
          this.handleErr(err);
        }
      );
    } else {
      this.openPage(CreateAccountClinicComponent);
    }
  }

  public authenticate() {
    this.loading = true;
    const credentials = {
      email: this.account.email,
      password: this.account.password
    };
    this._auth.generateToken(credentials)
      .subscribe(
        (resp: any) => {
          this.loading = false;
          // alert('Account created!');
          this.openPage(CreateAccountClinicComponent);
        },
        (err: any) => {
          this.loading = false;
          this.handleErr(err);
        }
      );
  }

  public openPage(page) {
    this.navCtrl.push(page, { account: this.account, dependencies: this.dependencies });
  }
}
