import { Component } from '@angular/core';
import { AlertController, ActionSheetController, NavController, NavParams } from 'ionic-angular';
// noinspection TypeScriptCheckImport
// import * as _ from 'lodash';

import { PenService } from '../../services';
import {
  ANGLE_IMG,
  DPW_LOGO_TRANSPARENT,
  ENV
} from '../../app/constants';
import {
  HomeMenu,
  // UpdatePenComponent,
  RegisterPenComponent,
  RegisterPenToClinicComponent
} from '../index';

@Component({
  selector: 'my-pen',
  templateUrl: 'my-pen.html'
})
export class MyPenComponent {

  public logoTransparent: string = DPW_LOGO_TRANSPARENT;
  public angleImg: string = ANGLE_IMG;

  public searchInput: string = '';

  public penList: any[] = [];
  public penListFiltered: any[] = [];

  public dependencies: any = {};
  public isDev: boolean = ENV === 'dev';

  constructor(
    public _pen: PenService,
    public navCtrl: NavController,
    public navParams: NavParams,
    public actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController
  ) {
    this.penListFiltered = this.searchByString(this.searchInput, this.penList);
  }

  public ionViewDidLoad() {
    this.dependencies = this.navParams.get('dependencies') || {};
    this.getPens();
  }

  public onInput(event) {
    if (event.target.value) {
      this.getPensSearch(event.target.value);
    } else {
      this.getPens();
    }
  }

  public onCancel() {
    this.searchInput = '';
    this.getPens();
  }

  public itemSelected(pen) {
    this.dependencies.newPen = false;
    this.dependencies.pen = pen;
    this.navCtrl.push(RegisterPenComponent, { pen, dependencies: this.dependencies });
  }

  public goBack() {
    this.openPage(HomeMenu);
    // this.navCtrl.pop();
  }

  public goToNewPen() {
    this.dependencies.newPen = true;
    this.openPage(RegisterPenToClinicComponent);
  }

  public openPage(page) {
    this.navCtrl.push(page, { dependencies: this.dependencies });
  }

  public requestRemove(item: any) {
    const options: any = {
      title: 'Confirm',
      message: `Do you really want to remove Pen ${item.serialNumber}?`
    };
    this.showConfirm(options, 'delete', item);
  }

  public getPens() {
    this._pen.getPens().subscribe(
      (resp: any) => {
        console.log('resp: ', resp);
        this.penListFiltered = resp;
      },
      (err: any) => {
        console.log('err: ', err);
      }
    );
  }

  public removeItem(item: any) {
    this._pen.deletePen(item.id).subscribe(
      (resp: any) => {
        this.getPens();
      },
      (resp: any) => {
        console.log(JSON.stringify(resp));
      }
    );
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

  public getPensSearch(searchValue: string) {
    this._pen.getPenSearch(searchValue).subscribe(
      (resp: any) => {
        console.log('resp: ', resp);
        this.penListFiltered = resp;
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
        'penName',
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
