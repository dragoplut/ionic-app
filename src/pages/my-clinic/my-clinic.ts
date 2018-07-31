import { Component } from '@angular/core';
import { AlertController, ActionSheetController, NavController, NavParams } from 'ionic-angular';
// noinspection TypeScriptCheckImport
// import * as _ from 'lodash';

import { ClinicService } from '../../services/index';
import {
  ANGLE_IMG,
  DPW_LOGO_TRANSPARENT
} from '../../app/constants';
import {
  EditClinicComponent,
  HomeMenu,
  RegisterPenComponent,
  RegisterClinicAddressComponent
} from '../index';

@Component({
  selector: 'my-clinic',
  templateUrl: 'my-clinic.html'
})
export class MyClinicComponent {

  public logoTransparent: string = DPW_LOGO_TRANSPARENT;
  public angleImg: string = ANGLE_IMG;

  public searchInput: string = '';

  public clinicList: any[] = [];
  public clinicListFiltered: any[] = [];

  public dependencies: any = {};

  constructor(
    public _clinic: ClinicService,
    public alertCtrl: AlertController,
    public navCtrl: NavController,
    public navParams: NavParams,
    public actionSheetCtrl: ActionSheetController
  ) {
    this.clinicListFiltered = this.searchByString(this.searchInput, this.clinicList);
  }

  public ionViewDidLoad() {
    this.dependencies = this.navParams.get('dependencies') || {};
    this.getClinics();
  }

  public onInput(event) {
    if (event.target.value) {
      this.getClinicsSearch(event.target.value);
    } else {
      this.getClinics();
    }
  }

  public onCancel() {
    this.searchInput = '';
    this.getClinics();
  }

  public itemSelected(clinic) {
    if (this.dependencies.newPen) {
      this.dependencies.clinic = clinic;
      this.openPage(RegisterPenComponent);
    } else {
      this.navCtrl.push(EditClinicComponent, { clinic })
    }
  }

  public goBack() {
    this.openPage(HomeMenu);
    // this.navCtrl.pop();
  }

  public goToNewClinic() {
    this.openPage(RegisterClinicAddressComponent);
  }

  public openPage(page) {
    this.navCtrl.push(page, { dependencies: this.dependencies });
  }

  public getClinics() {
    this._clinic.getClinics().subscribe(
      (resp: any) => {
        console.log('resp: ', resp);
        this.clinicListFiltered = resp;
      },
      (err: any) => {
        console.log('err: ', err);
      }
    );
  }

  public removeItem(item: any) {
    this._clinic.deleteClinic(item.id).subscribe(
      (resp: any) => {
        this.getClinics();
      },
      (err: any) => {
        console.log(JSON.stringify(err));
        alert('Error. Clinic not removed. It may have connected pen!')
      }
    );
  }

  public getClinicsSearch(searchValue: string) {
    this._clinic.getClinicsSearch(searchValue).subscribe(
      (resp: any) => {
        console.log('resp: ', resp);
        this.clinicListFiltered = resp;
      },
      (err: any) => {
        console.log('err: ', err);
      }
    );
  }

  /** Search function **/
  public searchByString(searchVal: string, itemsList: any[]) {
    if (searchVal && searchVal.length && typeof searchVal === 'string') {
      /** Transform search string toLowerCase for next search **/
      searchVal = searchVal.toLowerCase();
      /** Found users will be stored here **/
      var filtered = [];
      /** Define prop names to search in **/
      const propsToSearch = [
        'clinicName',
        'address'
      ];
      /** Loop our itemsList **/
      itemsList.forEach(function(item) {
        /** Clone user to get rid of possible mutations **/
        var user = JSON.parse(JSON.stringify(item));
        /** Loop in allowed props to search **/
        for (var propName of propsToSearch) {
          /** Check if value exist and if it includes searchVal **/
          if (user[propName] && user[propName].toLowerCase().indexOf(searchVal) !== -1) {
            /** Found match push to filtered array and exit from current loop **/
            filtered.push(item);
            break;
          }
        }
      });
      /** Return filtered itemsList **/
      return filtered;
    } else {
      /** Return empty result if searchVal is empty or not a string **/
      return itemsList;
    }
  }

  public requestRemove(item: any) {
    const options: any = {
      title: 'Confirm',
      message: `Do you really want to remove Clinic ${item.name}, ${item.address}?`
    };
    this.showConfirm(options, 'delete', item);
  }

  public showConfirm(options: any, action: string, item?: any) {
    let alert: any = this.alertCtrl.create({
      title: options.title,
      message: options.message,
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Yes',
          handler: () => {
            this.doConfirmed(action, item);
          }
        }
      ]
    });
    alert.present();
  }

  public presentActionsConfirm(item: any) {
    let actionSheet = this.actionSheetCtrl.create({
      title: item.title,
      buttons: [
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            console.log('Destructive clicked');
            this.requestRemove(item);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });

    actionSheet.present();
  }

  public doConfirmed(action: string, item?: any) {
    switch (action) {
      case 'delete':
        this.removeItem(item);
        break;
      default:
        break;
    }
  }
}
