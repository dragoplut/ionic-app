import { Component, ViewChild, OnInit } from '@angular/core';
import {
  AuthService,
  ApiService,
  AccountService,
  PermissionService,
  UtilService
} from '../../services/index';
import {
  ANGLE_IMG,
  DEFAULT_ERROR_MESSAGE,
  DPW_LOGO_TRANSPARENT,
  EMAIL_REGEXP,
  PAGES_LIST
} from '../../app/constants';
import { T_LOCATION_PARAMS } from '../../app/types';
import {
  CreateAccountClinicComponent,
  CreateAccountComponent,
  SigninComponent
} from '../';
import { Nav, NavController, NavParams } from 'ionic-angular';

// noinspection TypeScriptCheckImport
import * as _ from 'lodash';

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
  public countryNamesArr: any[] = [];
  public stateNamesArr: any[] = [];
  public cityNamesArr: any[] = [];

  public dependencies: any = {};

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public _api: ApiService,
    public _auth: AuthService,
    public _account: AccountService,
    public _permission: PermissionService,
    public _util: UtilService
  ) {}

  public ionViewDidLoad() {
    this.account = this.navParams.get('account');
    if (!this.account.location) {
      this.account.location = {
        country: '',
        state: '',
        city: ''
      };
    }
    this.initDropDowns(this.onChangeValidate());
  }

  public ngOnInit() {
    this._api.setHeaders({});
  }

  public showErrorMessage(message?: string) {
    this.errorMessage = message ? message : DEFAULT_ERROR_MESSAGE;
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

  /**
   * Validate fields and update drop-downs
   * @param {string} target
   */
  public onChangeValidate(target?: string) {
    /** Clear child items if parent changed **/
    switch (target) {
      case 'country':
        this.account.location.state = '';
        this.account.location.city = '';
        this.stateNamesArr = [];
        this.cityNamesArr = [];
        break;
      case 'state':
        this.account.location.city = '';
        this.cityNamesArr = [];
        break;
      default:
        break;
    }

    if (target && target !== 'city') {
      /** Prepare location params before request update **/
      const params: T_LOCATION_PARAMS = {
        countryName: this.account.location.country || '',
        stateName: this.account.location.state || '',
      };
      this.updateLocationParams(params);
    }

    /** Assume data is valid **/
    let isValid = true;
    /** Check and update if data is really valid **/
    if (!this.account.location ||
        !this.account.location.country ||
        !this.account.location.country.length ||
        !this.account.location.city ||
        !this.account.location.city.length) {
      isValid = false;
    }
    /** Update validity **/
    this.formValid = isValid;
  }

  public goBack() {
    this.openPage(CreateAccountComponent);
  }

  public next() {
    if (!this.account.created) {
      this.loading = true;
      this._account.createAccount(_.clone(this.account)).subscribe(
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

  /**
   * Request initial countries list for drop-downs
   * execute callback if provided
   * @param callback
   */
  public initDropDowns(callback?: any) {
    /** Get initial/default location items **/
    const params: T_LOCATION_PARAMS = {
      countryName: '',
      stateName: ''
    };
    this.updateLocationParams(params, callback);
  }

  /**
   * Request "Countries/States/Cities" by params
   * update "address" drop-downs with received items
   * @param {T_LOCATION_PARAMS} params
   * @param callback
   */
  public updateLocationParams(params: T_LOCATION_PARAMS, callback?: any) {
    this.loading = true;
    this._util.getLocation(params).subscribe(
      (resp: any) => {
        this.loading = false;
        /** TODO: change "counties" to "countries" after API fix typo **/
        if (resp && resp.counties && resp.counties.length) {
          this.countryNamesArr = resp.counties.map((item: any) => item.name);
          this.stateNamesArr = resp.states.map((item: any) => item.name);
          this.cityNamesArr = resp.cities.map((item: any) => item.name);
        }
        if (callback) { callback(); }
      },
      (err: any) => {
        this.loading = false;
        if (callback) { callback(); }
        alert(JSON.stringify(err));
      }
    );
  }

  public openPage(page) {
    this.navCtrl.push(page, { account: this.account, dependencies: this.dependencies });
  }
}
