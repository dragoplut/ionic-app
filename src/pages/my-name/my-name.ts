import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import {
  ANGLE_IMG,
  DPW_LOGO_TRANSPARENT
} from '../../app/constants';
import { AccountService } from '../../services/index';
import { MyAccountComponent } from '../index';
// noinspection TypeScriptCheckImport
import * as _ from 'lodash';

@Component({
  selector: 'my-name',
  templateUrl: 'my-name.html'
})
export class MyNameComponent {

  public logoTransparent: string = DPW_LOGO_TRANSPARENT;
  public angleImg: string = ANGLE_IMG;
  public user: any = {
    firstName: '',
    lastName: '',
    companyId: '',
    phoneNumber: ''
  };
  public formValid: boolean = false;
  public loading: boolean = false;

  public updateAccInputs: any = [
    { modelName: 'firstName', placeholder: 'First Name', type: 'text', required: false },
    { modelName: 'lastName', placeholder: 'Last Name', type: 'text', required: false },
    { modelName: 'companyId', placeholder: 'Company Name', type: 'select', required: false, options: [] },
    { modelName: 'phoneNumber', placeholder: 'Phone Number', type: 'text', required: false }
  ];

  constructor(
    public _account: AccountService,
    public navCtrl: NavController
  ) {}

  public ionViewDidLoad() {
    this.loading = true;
    this._account.getAccountInfo().subscribe(
      (resp: any) => {
        this.user = resp;
        this.loading = false;
        this.getCompanies();
      },
      (err: any) => {
        this.loading = false;
        console.log('err: ', err);
      }
    );
  }

  public save() {
    console.log('this.user: ', this.user);
    this._account.updateAccount(this.user).subscribe(
      (resp: any) => {
        this.openPage(MyAccountComponent);
      },
      (err: any) => {
        alert(err);
      }
    );
  }

  public getCompanies() {
    this.loading = true;
    this._account.getAllCompanies().subscribe(
      (resp: any) => {
        _.forEach(this.updateAccInputs, (option: any) => {
          if (option.modelName === 'companyId') {
            option.options = resp;
          }
        });
        this.onChangeValidate();
        this.loading = false;
      },
      (err: any) => {
        this.loading = false;
        alert(err);
      }
    );
  }

  public onChangeValidate() {
    let isValid = true;
    if (!this.user.firstName ||
      !this.user.firstName.length ||
      !this.user.lastName ||
      !this.user.lastName.length ||
      !this.user.phoneNumber ||
      !this.user.companyId) {
      isValid = false;
    }
    this.formValid = isValid;
  }

  public goBack() {
    this.openPage(MyAccountComponent);
  }

  public openPage(page) {
    this.navCtrl.push(page);
  }
}
