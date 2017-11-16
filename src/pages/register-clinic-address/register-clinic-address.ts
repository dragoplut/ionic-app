import { Component, ViewChild, OnInit } from '@angular/core';
import { ApiService, PermissionService } from '../../services/index';
import {
  DEFAULT_ERROR_MESSAGE,
  DPW_LOGO_TRANSPARENT,
  EMAIL_REGEXP,
  US_CITY_NAMES
} from '../../app/constants';
import { MyClinicComponent, RegisterClinicContactsComponent } from '../index';
import { Nav, NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'register-clinic-address',
  templateUrl: `./register-clinic-address.html`
})
export class RegisterClinicAddressComponent implements OnInit {
  @ViewChild(Nav) nav: Nav;

  public account: any = {};
  public logoTransparent: string = DPW_LOGO_TRANSPARENT;
  public loading: boolean = false;
  public errorMessage: any = '';

  public emailRegExp: any = EMAIL_REGEXP;
  public usCityNames: any[] = US_CITY_NAMES;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public _api: ApiService,
    public _permission: PermissionService
  ) {}

  public ionViewDidLoad() {
    const acc: any = this.navParams.get('account');
    this.account = acc ? acc : {};
  }

  public ngOnInit() {
    this._api.setHeaders({});
  }

  public showErrorMessage(message?: string) {
    this.errorMessage = message ? message : DEFAULT_ERROR_MESSAGE;
  }

  public clearError() {
    this.errorMessage = '';
  }

  public back() {
    this.openPage(MyClinicComponent);
  }

  public next() {
    console.log('nex: ', this.account);
    this.openPage(RegisterClinicContactsComponent);
  }

  public openPage(page) {
    this.navCtrl.push(page, { account: this.account });
  }
}
