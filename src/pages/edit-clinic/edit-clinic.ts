import { Component, ViewChild, OnInit } from '@angular/core';
import { ApiService, PermissionService } from '../../services/index';
import {
  DEFAULT_ERROR_MESSAGE,
  DPW_LOGO_TRANSPARENT,
  EMAIL_REGEXP,
  US_CITY_NAMES
} from '../../app/constants';
import { MyClinicComponent } from '../index';
import { Nav, NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'edit-clinic',
  templateUrl: `./edit-clinic.html`
})
export class EditClinicComponent implements OnInit {
  @ViewChild(Nav) nav: Nav;

  public account: any = {};
  public logoTransparent: string = DPW_LOGO_TRANSPARENT;
  public loading: boolean = false;
  public errorMessage: any = '';

  public emailRegExp: any = EMAIL_REGEXP;
  public usCityNames: any[] = US_CITY_NAMES;

  public createAccInputs: any = [
    { modelName: 'phoneNumber', placeholder: 'Phone Number', type: 'text', required: false },
    { modelName: 'contactPerson', placeholder: 'Contact Person', type: 'text', required: false },
    { modelName: 'websiteUrl', placeholder: 'Website URL', type: 'text', required: false }
  ];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public _api: ApiService,
    public _permission: PermissionService
  ) {}

  public ionViewDidLoad() {
    const acc: any = this.navParams.get('clinic');
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

  public save() {
    this.openPage(MyClinicComponent);
  }

  public openPage(page) {
    this.navCtrl.push(page, { account: this.account });
  }
}
