import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
// noinspection TypeScriptCheckImport
import * as _ from 'lodash';

import {
  ANGLE_IMG,
  DPW_LOGO_TRANSPARENT
} from '../../app/constants';
import {
  EditClinicComponent,
  HomeMenu,
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

  public clinicList: any[] = [
    { clinicName: 'Clinic X', address: '23 Sunrise Ave' },
    { clinicName: 'Clinic Y', address: '23 Redmond Ave' },
    { clinicName: 'Clinic Z', address: '23 Redmond Ave' },
    { clinicName: 'Clinic XY', address: '23 Redmond Ave' },
    { clinicName: 'Clinic XYZ', address: '23 Redmond Ave' },
  ];
  public clinicListFiltered: any[] = _.clone(this.clinicList);

  constructor(public navCtrl: NavController) {
    this.clinicListFiltered = this.searchByString(this.searchInput, this.clinicList);
  }

  public onInput(event) {
    console.log('onInput event: ', event);
    // this.searchInput = event.data;
    this.clinicListFiltered = this.searchByString(this.searchInput, this.clinicList);
  }

  public onCancel(event) {
    console.log('onCancel event: ', event);
    this.searchInput = '';
    this.clinicListFiltered = this.searchByString(this.searchInput, this.clinicList);
  }

  public itemSelected(clinic) {
    console.log('itemSelected clinic: ', clinic);
    this.navCtrl.push(EditClinicComponent, { clinic })
  }

  public goBack() {
    this.openPage(HomeMenu);
  }

  public goToNewClinic() {
    this.openPage(RegisterClinicAddressComponent);
  }

  public openPage(page) {
    this.navCtrl.push(page);
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

}
