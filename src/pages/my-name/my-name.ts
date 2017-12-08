import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import {
  ANGLE_IMG,
  DPW_LOGO_TRANSPARENT
} from '../../app/constants';
import { AccountService } from '../../services/index';
import { MyAccountComponent } from '../index';

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
    companyName: '',
    phoneNumber: ''
  };

  public updateAccInputs: any = [
    { modelName: 'firstName', placeholder: 'First Name', type: 'text', required: false },
    { modelName: 'lastName', placeholder: 'Last Name', type: 'text', required: false },
    { modelName: 'companyName', placeholder: 'Company Name', type: 'text', required: false },
    { modelName: 'phoneNumber', placeholder: 'Phone Number', type: 'text', required: false }
  ];

  constructor(
    public _account: AccountService,
    public navCtrl: NavController
  ) {}

  public ionViewDidLoad() {
    this._account.getAccountInfo().subscribe(
      (resp: any) => {
        this.user = resp;
      },
      (err: any) => {
        console.log('err: ', err);
      }
    );
  }

  public save() {
    this._account.updateAccount(this.user).subscribe(
      (resp: any) => {
        this.openPage(MyAccountComponent);
      },
      (err: any) => {
        console.log('err: ', err);
        this.openPage(MyAccountComponent);
      }
    );
  }

  public goBack() {
    this.openPage(MyAccountComponent);
  }

  public openPage(page) {
    this.navCtrl.push(page);
  }
}
