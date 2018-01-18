import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { AlertController } from 'ionic-angular';

import {
  ANGLE_IMG,
  DEVICE_PANEL_IMG,
  DPW_LOGO_TRANSPARENT
} from '../../app/constants';
import { HomeMenu, MyPenComponent, UpdatePenComponent } from '../index';
import { AccountService, BleService, PenService } from '../../services';

import * as moment from 'moment';
// noinspection TypeScriptCheckImport
import * as _ from 'lodash';

@Component({
  selector: 'register-pen',
  templateUrl: 'register-pen.html'
})
export class RegisterPenComponent {

  public logoTransparent: string = DPW_LOGO_TRANSPARENT;
  public angleImg: string = ANGLE_IMG;
  public devicePanelImg: string = DEVICE_PANEL_IMG;

  public userInfo: any = {};
  public usageData: any = {};
  public dpDevice: any = { name: '' };
  public errorData: any = '';
  public successData: any = '';
  public pairingDevice: any = 'No data yet!';
  public errorDescription: any = '';
  public rawData: any = [];

  public deviceVolume: number = 3;
  public deviceReadVolume: number = 0;

  public unpairedDevices: any[] = [];
  public pairedDevices: any[] = [];
  public gettingDevices: boolean = false;
  public deviceUpdated: boolean = false;

  public dependencies: any = {};

  public updatePercent: number = 0;
  public timeNowSeconds: number = moment().diff(moment().year(2017).startOf('year'), 'seconds');
  public dummyWhiteBlackList: any[] = [0,0,1,1,2,3,4,6,7,300];
  public dummySettings: any[] = [
    123456,
    this.timeNowSeconds,
    this.timeNowSeconds + (24 * 60 * 60),
    this.timeNowSeconds + (7 * 24 * 60 * 60)
  ];

  public jwtCheckIntervalPermanent: any = setInterval(() => {
    this._ble.isConnected(this.dpDevice, () => this.dpDevice.paired = true, () => this.dpDevice.paired = false);
  }, 1000);

  public errTimeout: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public platform: Platform,
    public _account: AccountService,
    public _pen: PenService,
    public _ble: BleService,
    private alertCtrl: AlertController
  ) {}

  public ionViewDidLoad() {
    this.platform.ready().then(() => {
      this.updateUserInfo();
      // const dummyBlackWhiteList: any[] = [0,0,1,1,2,200];
      // this.addBlackWhiteList(dummyBlackWhiteList);
      this.updateBlackWhiteList();
      this._ble.enable();
      this.dependencies = this.navParams.get('dependencies') || {};
      this.dpDevice = { name: '' };
      if (this.dependencies && this.dependencies.pen && !this.dependencies.clinic) {
        if (this.dpDevice) {
          this.dpDevice.name = this.dependencies.pen.serialNumber;
          this.dpDevice.id = this.dependencies.pen.serialNumber;
        } else {
          this.dpDevice = {
            id: this.dependencies.pen.serialNumber,
            name: this.dependencies.pen.serialNumber
          };
        }
        this._ble.isConnected(
          this.dpDevice,
          (resp: any) => {
          this.dpDevice.paired = true;
          },
          () => {
            setTimeout(() => this.initConnectionChecker(), 300);
            this._ble.scan((resp: any) => {
              this._ble.connect(this.dpDevice, this.connected, false);
            }, this._ble.stopScan);
          });
      } else {
        this.startScanning();
      }
    });
  }

  public startScanning() {
    setTimeout(() => this.initConnectionChecker(), 300);

    // this.gettingDevices = true;
    this._ble.stopScan();
    this._ble.scan((resp: any) => this.scanSuccess(resp), this.fail);
  }

  public onScanError(err: any) {
    this.fail(err);
  }

  public connected = (data: any) => {
    this.successData = JSON.stringify(data);
    this.errorData = '';
    if (data) {
      this.dpDevice = data;
    }
    this._ble.isConnected(
      this.dpDevice,
      (resp: any) => {
        this.dpDevice.paired = true;
        // setTimeout(() => {
        //   this.writeToDevice(this.dpDevice, '180a', '2a26', 0);
        // }, 100);
      }, (err: any) => {
        this.dpDevice.paired = false;
      });
  };

  public disconnected = (data: any) => {
    this.successData = JSON.stringify(data);
    this.errorData = '';
    this.dpDevice.paired = false;
    //this.startScanning();
  };

  public success = (data: any) => {
    this.successData = JSON.stringify(data);
    this.errorData = '';
    //alert('success: ' + this.successData);
  };

  public fail = (error: any) => {
    this._ble.stopScan();
    this.gettingDevices = false;
    this.errorData = JSON.stringify(error);
    this.successData = '';
    alert('fail: ' + this.errorData);
  };

  public selectDevice(address: string, device?: any) {
    if (device) {
      this.pairingDevice = JSON.stringify(device);
    }

    let alert: any = this.alertCtrl.create({
      title: 'Connect',
      message: 'Do you want to connect with?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Connect',
          handler: () => {
            this._ble.connect(device, this.connected, this.fail);
          }
        }
      ]
    });
    alert.present();

  }

  public disconnect() {
    let alert: any = this.alertCtrl.create({
      title: 'Disconnect?',
      message: 'Do you want to Disconnect?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Disconnect',
          handler: () => {
            this._ble.disconnect(this.dpDevice, this.disconnected, this.fail);
          }
        }
      ]
    });
    alert.present();
  }

  public readFromDevice(address, serviceUUID, characteristicUUID) {
    this._ble.read(address, { serviceUUID, characteristicUUID }, 'string', this.success, this.fail);
  }

  public writeToDevice(address, serviceUUID, characteristicUUID, rawData) {
    this._ble.write(address, { serviceUUID, characteristicUUID }, rawData, this.success, this.fail);
  }

  public goBack() {
    this._ble.disconnect(this.dpDevice, true, true);
    this.openPage(HomeMenu);
    // this.navCtrl.pop();
  }

  public goNext() {
    if (this.dependencies.clinic && this.dependencies.newPen) {
      let pen = {
        name: this.dpDevice.name || this.dpDevice.id,
        clinicId: this.dependencies.clinic.id,
        serialNumber: this.dpDevice.id
      };
      // alert(JSON.stringify(pen));
      this.startErrTimeout(60);
      this._pen.registerPen(pen).subscribe(
        (resp: any) => {
          if (resp) {
            this.doPenUpdate();
          } else {
            alert('Error. This pen is already registered to other clinic!');
          }
        },
        (err: any) => alert(err)
      );
    } else {
      alert('Error. No clinic provided for pen!');
    }
  }

  public doPenUpdate() {

    this.requestDeviceSettings(this.dpDevice,(resp: any) => {
      /** Update device settings if exist **/
      if (resp && resp.userId) {
        this.dummySettings[0] = resp.userId;
        this.dummySettings[1] = resp.currentDateTime;
        this.dummySettings[2] = resp.warmDateTime;
        this.dummySettings[3] = resp.forceDateTime;
      }
      /** Read "Usage List" **/
      this._pen.writeWithResponse(
        this.dpDevice.id,
        { serviceUUID: 'a8a91000-38e9-4fbe-83f3-d82aae6ff68e', characteristicUUID: 'a8a91003-38e9-4fbe-83f3-d82aae6ff68e', type: 'fileRequest' },
        [1,3,0],
        (resp: any) => {
          this.updatePercent = 30;

          /** saveSyncListData **/
          const syncListData: any = {
            serialNumber: this.dpDevice.id,
            penUsageLists: resp.result,
            penErrorLists: []
          };
          this._pen.saveSyncListData(syncListData);

          this.usageData = _.clone(resp.result);
          let cartridgeIds: any[] = resp.result.map((item: any) => item.catridgeId);
          cartridgeIds = _.sortBy(_.uniq(cartridgeIds));
          /** Send "Cartridge" id's to server **/
          this.doUpdateApiWhiteBlackList(cartridgeIds, (data: any) => this.doUpdateBlackListAndSettings(data));
        },
        this.fail
      );
    }, this.fail);
  };

  public doUpdateApiWhiteBlackList(data: any[], callback: any) {
    this._pen.updateWhiteBlacklist(data).subscribe(callback, this.fail);
  }

  public doUpdateBlackListAndSettings(data: any[]) {
    this.updatePercent = 45;
    let device: any = _.clone(this.dpDevice);
    this.errorDescription = device && device.id ? '' : 'Communication to the pen error';

    device.dummyWhiteBlackList = data;
    device.settings = this.dummySettings;
    /** Write new "Settings" to BLE device **/
    this.updateDeviceSettings(
      device,
      (done: any) => {
        this.updatePercent = 75;
        // alert('2 doUpdateBlackListAndSettings done' + JSON.stringify(done, null, 2) + ' device: ' + JSON.stringify(device, null, 2));
        /** Write new "Black List" to BLE device **/
        this.updateDeviceBlacklist(
          device,
          (resp: any) => {
            this.updatePercent = 100;
            setTimeout(() => {
              this.deviceUpdated = true;
              clearInterval(this.errTimeout);
              // this._ble.disconnect(this.dpDevice, this.disconnected, this.fail);
            }, 100);
          },
          (errDescription: string) => this.errorData = errDescription
        )
      },
      (errDescription: any) => this.errorData = errDescription
    );
  }

  public updateDeviceSettings(device: any, callback: any, fail: any) {
    // alert('4 updateDeviceSettings device: ' + JSON.stringify(device, null, 2));
    this._pen.writeWithResponse(
      device.id,
      { serviceUUID: 'a8a91000-38e9-4fbe-83f3-d82aae6ff68e', characteristicUUID: 'a8a91003-38e9-4fbe-83f3-d82aae6ff68e', type: 'fileWrite', device },
      [5,2,16],
      callback,
      fail
    );
  }

  public updateDeviceBlacklist(device: any, callback: any, fail: any) {
    // alert('3 updateDeviceBlacklist device: ' + JSON.stringify(device, null, 2));
    this._pen.writeWithResponse(
      device.id,
      { serviceUUID: 'a8a91000-38e9-4fbe-83f3-d82aae6ff68e', characteristicUUID: 'a8a91003-38e9-4fbe-83f3-d82aae6ff68e', type: 'fileWrite', device },
      [3,2,0],
      callback,
      fail
    );
  }

  public requestDeviceSettings(device: any, callback: any, fail: any) {
    // alert('3 updateDeviceBlacklist device: ' + JSON.stringify(device, null, 2));
    this._pen.getSettings(device.id).subscribe(callback, fail);
  }

  public goPenUpdate() {
    this.openPage(UpdatePenComponent);
  }

  public openPage(page) {
    this.navCtrl.push(page, { dependencies: this.dependencies });
  }

  public doDone() {
    clearInterval(this.jwtCheckIntervalPermanent);
    this.openPage(MyPenComponent);
  }

  public doRetry(callback: any) {
    /** Retry steps: 1) disconnect; 2) start connection checker; 3) scan; 4) connect; **/
    /** Disconnect if connection was established **/
    this._ble.disconnect(this.dpDevice, this.disconnected, this.fail);
    /** Start connection checker **/
    setTimeout(() => this.initConnectionChecker(callback), 300);
    /** Scan for available "Dermapen" BLE device **/
    this._ble.scan((resp: any) => {
      /** Connect to BLE device and invoke provided function **/
      this._ble.connect(this.dpDevice, true, false);
    }, this._ble.stopScan);
  }

  public scanSuccess(resp: any) {
    this.gettingDevices = false;
    if (resp && resp.dpDevice && resp.dpDevice.id) {
      this.dpDevice = _.clone(resp.dpDevice);
    }
    this.pairedDevices = resp.pairedDevices && resp.pairedDevices.length ?
      resp.pairedDevices : [];
    this.unpairedDevices = resp.unpairedDevices && resp.unpairedDevices.length ?
      resp.unpairedDevices : [];
    if (resp.dpDevice && resp.dpDevice.id && !resp.dpDevice.paired) {
      // this.selectDevice(resp.dpDevice.id, resp.dpDevice);
      this._ble.connect(resp.dpDevice, (done: any) => this.connected(done), this.fail);
    } else if (resp.dpDevice && resp.dpDevice.id && resp.dpDevice.paired) {
      this.isConnected(resp.dpDevice);
    }
  }

  public initConnectionChecker(callback?: any) {
    let jwtCheckInterval: any = setInterval(() => {
      this._ble.isConnected(this.dpDevice, () => {
        this.dpDevice.paired = true;
        clearInterval(jwtCheckInterval);
        if (callback) {
          callback();
        }
      }, false);
    }, 1000);
  }

  public isConnected(device: any) {
    this._ble.isConnected(device, (resp: any) => {
      this.dpDevice.paired = true;
      // alert('isConnected: ' + JSON.stringify(resp));
    }, this.fail);
  }

  public addBlackWhiteList(dummyBlackWhiteList: any[]) {
    this._pen.addTemporaryWhitelist(dummyBlackWhiteList).subscribe(
      (resp: any) => {
        // alert('addWhitelist: ' + JSON.stringify(resp));
        this.updateBlackWhiteList();
      },
      (err: any) => this.fail(err)
    );
  }

  public updateBlackWhiteList() {
    this._pen.getTemporaryWhitelist().subscribe(
      (resp: any) => {
        // alert('getWhitelist: ' + JSON.stringify(resp));
        if (resp && resp.length) {
          this.dummyWhiteBlackList = resp;
        }
      },
      (err: any) => this.fail(err)
    );
  }

  public updateUserInfo() {
    this._account.getAccountInfo().subscribe(
      (resp: any) => {
        this.userInfo = resp;
        this.dummySettings[0] = this.userInfo.accountId;
      },
      (err: any) => this.fail(err)
    );
  }

  private startErrTimeout(sec: number) {
    this.errTimeout = setTimeout(() => {
      this.errorDescription = 'Communication to the pen error';
      this.updatePercent = 0;
    }, sec * 1000)
  }
}
