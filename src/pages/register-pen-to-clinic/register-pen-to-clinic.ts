import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular'

import {
  ANGLE_IMG,
  DPW_LOGO_TRANSPARENT
} from '../../app/constants';

import {
  MyPenComponent,
  MyClinicComponent,
  RegisterClinicAddressComponent
} from '../index';

@Component({
  selector: 'register-pen-to-clinic',
  templateUrl: 'register-pen-to-clinic.html'
})
export class RegisterPenToClinicComponent {

  public logoTransparent: string = DPW_LOGO_TRANSPARENT;
  public angleImg: string = ANGLE_IMG;
  public dependencies: any = {};

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams
  ) {}

  public ionViewDidLoad() {
    this.dependencies = this.navParams.get('dependencies') || {};
  }

  public navigateTo(pageName) {
    switch (pageName) {
      case 'MyPenComponent':
        this.openPage(MyPenComponent);
        break;
      case 'MyClinicComponent':
        this.dependencies.newPen = true;
        this.openPage(MyClinicComponent);
        break;
      case 'RegisterClinicAddressComponent':
        this.openPage(RegisterClinicAddressComponent);
        break;
      default:
        break;
    }
  }

  public goBack() {
    this.openPage(MyPenComponent);
  }

  public openPage(page) {
    this.navCtrl.push(page, { dependencies: this.dependencies });
  }
}
