import { Component, ViewChild, OnInit } from '@angular/core';
import { ApiService, ClinicService, PermissionService } from '../../services/index';
import {
  DEFAULT_ERROR_MESSAGE,
  DPW_LOGO_TRANSPARENT,
  EMAIL_REGEXP,
  US_CITY_NAMES
} from '../../app/constants';
import { RegisterClinicAddressComponent, MyClinicComponent } from '../index';
import { Nav, NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'register-clinic-contacts',
  templateUrl: `./register-clinic-contacts.html`
})
export class RegisterClinicContactsComponent implements OnInit {
  @ViewChild(Nav) nav: Nav;

  public account: any = {};
  public logoTransparent: string = DPW_LOGO_TRANSPARENT;
  public loading: boolean = false;
  public formValid: boolean = false;
  public errorMessage: any = '';

  public emailRegExp: any = EMAIL_REGEXP;
  public cityNamesArr: any[] = US_CITY_NAMES;

  public createAccInputs: any = [
    { modelName: 'phoneNumber', placeholder: 'Phone Number', type: 'number', required: false },
    { modelName: 'contactPerson', placeholder: 'Contact Person', type: 'text', required: false },
    { modelName: 'webSiteUrl', placeholder: 'Website URL', type: 'text', required: false }
  ];

  public dependencies: any = {};

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public _api: ApiService,
    public _clinic: ClinicService,
    public _permission: PermissionService
  ) {}

  public ionViewDidLoad() {
    this.dependencies = this.navParams.get('dependencies') || {};
    const acc: any = this.navParams.get('account');
    this.account = acc ? acc : {};
    this.onChangeValidate();
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

  public goBack() {
    this.openPage(RegisterClinicAddressComponent);
  }

  public validate(clinic: any) {
    return clinic &&
      clinic.name &&
      clinic.location;
  }

  public onChangeValidate() {
    let isValid = true;
    if (!this.account.location ||
      !this.account.name ||
      !this.account.phoneNumber ||
      !this.account.contactPerson ||
      !this.account.location.address ||
      !this.account.location.address.length ||
      !this.account.location.country ||
      !this.account.location.country.length ||
      !this.account.location.state ||
      !this.account.location.state.length ||
      !this.account.location.zip ||
      !this.account.location.zip.length ||
      !this.account.location.city ||
      !this.account.location.city.length) {
      isValid = false;
    }
    this.formValid = isValid;
  }

  public save() {
    const valid: boolean = this.validate(this.account);
    if (valid) {
      this.loading = true;
      this._clinic.createClinic(this.account).subscribe(
        (resp: any) => {
          this.loading = false;
          this.openPage(MyClinicComponent);
        },
        (err: any) => {
          console.log('err: ', err);
          this.loading = false;
        }
      );
    }
  }

  public openPage(page) {
    this.navCtrl.push(page, { account: this.account, dependencies: this.dependencies });
  }
}
