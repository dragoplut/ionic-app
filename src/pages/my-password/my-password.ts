import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import {
  ANGLE_IMG,
  DPW_LOGO_TRANSPARENT
} from '../../app/constants';
import { MyAccountComponent } from '../index';

@Component({
  selector: 'my-password',
  templateUrl: 'my-password.html'
})
export class MyPasswordComponent {

  public logoTransparent: string = DPW_LOGO_TRANSPARENT;
  public angleImg: string = ANGLE_IMG;
  public user: any = {};

  public passwordInputs: any = [
    { modelName: 'oldPassword', placeholder: 'Existing Password', type: 'password', required: true },
    { modelName: 'newPassword', placeholder: 'New Password', type: 'password', required: true },
    { modelName: 'confirmPassword', placeholder: 'Confirm Password', type: 'password', required: true }
  ];

  constructor(public navCtrl: NavController) {

  }

  public save() {
    this.openPage(MyAccountComponent);
  }

  public goBack() {
    this.openPage(MyAccountComponent);
  }

  public openPage(page) {
    this.navCtrl.push(page);
  }
}
