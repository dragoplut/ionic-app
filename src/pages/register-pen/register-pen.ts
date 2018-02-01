import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { AlertController } from 'ionic-angular';

import {
  ANGLE_IMG,
  DEVICE_PANEL_IMG,
  DPW_LOGO_TRANSPARENT,
  CHAR_ELEM
} from '../../app/constants';
import { HomeMenu, MyPenComponent, UpdatePenComponent } from '../index';
import { ApiService, AccountService, BleService, FirmwareService, PenService, UtilService } from '../../services';

// import hexToArrayBuffer from 'hex-to-array-buffer';
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

  public firmwareBlob: any;

  public userInfo: any = {};
  public usageData: any = {};
  public dpDevice: any = { name: '' };
  public firmwareVersion: any = '0.1.3';
  public errorData: any = '';
  public successData: any = '';
  public pairingDevice: any = 'No data yet!';
  public errorDescription: any = '';
  public rawData: any = [];
  public firmwareBuffer: any = [];

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

  public showButton: string = '';
  public errTimeout: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public platform: Platform,
    public _api: ApiService,
    public _account: AccountService,
    public _firmware: FirmwareService,
    public _pen: PenService,
    public _ble: BleService,
    public _util: UtilService,
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
      this.showButton = '';
      if (this.dependencies && this.dependencies.pen && !this.dependencies.clinic) {
        if (this.dpDevice) {
          this.dpDevice.name = this.dependencies.pen.name;
          this.dpDevice.id = this.dependencies.pen.serialNumber;
          this.dpDevice.serialNumber = this.dependencies.pen.serialNumber;
        } else {
          this.dpDevice = {
            id: this.dependencies.pen.serialNumber,
            name: this.dependencies.pen.name,
            serialNumber: this.dependencies.pen.serialNumber
          };
        }
        this.startScanning(this.dpDevice);
        // this._ble.isConnected(
        //   this.dpDevice,
        //   (resp: any) => {
        //     if (resp) {
        //       this.dpDevice.paired = true;
        //     } else {
        //       setTimeout(() => this.initConnectionChecker(), 300);
        //       this._ble.scan(this.dpDevice || {}, (resp: any) => {
        //         if (resp && resp.dpDevice) {
        //           this._ble.connect(resp.dpDevice, this.connected, false);
        //         }
        //       }, this._ble.stopScan);
        //     }
        //   },
        //   () => {
        //   });
      } else {
        this.startScanning();
      }
      setTimeout(() => {
        clearInterval(this.jwtCheckIntervalPermanent);
      }, 30000);
    });
  }

  public startScanning(existingDevice?: any) {
    this.showButton = '';
    setTimeout(() => this.initConnectionChecker(), 300);

    // this.gettingDevices = true;
    this._ble.stopScan();
    this._ble.scan(existingDevice || {}, (resp: any) => this.scanSuccess(resp), this.fail);
  }

  public onScanError(err: any) {
    this.fail(err);
  }

  public connected = (device: any) => {
    this.successData = JSON.stringify(device);
    this.errorData = '';
    if (device) {
      if (this.dependencies.newPen) {
        this.dpDevice = device;
      } else {
        this.dpDevice.id = device.id;
      }
    }
    this._ble.isConnected(
      device,
      (resp: any) => {
        this.dpDevice.paired = !!resp;
      }, (err: any) => false);
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

  public writeToDevice(address: any, serviceUUID: any, characteristicUUID: any, rawData: any, callback: any) {
    this._ble.write(address, { serviceUUID, characteristicUUID }, rawData, callback, this.fail);
  }

  public goBack() {
    // this._ble.disconnect(this.dpDevice, true, true);
    this.openPage(HomeMenu);
    // this.navCtrl.pop();
  }

  public goNext() {
    if (this.dependencies.clinic && this.dependencies.newPen) {
      this.updateDeviceSerialNumber(this.dpDevice, (device: any) => {
        let pen = {
          name: device.serialNumber,
          clinicId: this.dependencies.clinic.id,
          serialNumber: device.serialNumber
        };
        // alert(JSON.stringify(pen));
        this.startErrTimeout(60);
        this._pen.registerPen(pen).subscribe(
          (resp: any) => {
            if (resp) {
              this.doPenUpdate();
            } else {
              this.showButton = 'done';
              this.errorDescription = 'Error. This pen is already registered to other clinic!';
            }
          },
          (err: any) => alert(err)
        );
      });
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

      /** saveSyncListData **/
      const syncListData: any = {
        serialNumber: this.dpDevice.serialNumber,
        penUsageLists: [],
        penErrorLists: []
      };

      /** Read "Usage List" **/
      this._pen.writeWithResponse(
        this.dpDevice.mac || this.dpDevice.id,
        { serviceUUID: 'a8a91000-38e9-4fbe-83f3-d82aae6ff68e', characteristicUUID: 'a8a91003-38e9-4fbe-83f3-d82aae6ff68e', type: 'fileRequest' },
        [1,3,0],
        (resp: any) => {

          this.updatePercent = 25;
          syncListData.penUsageLists = resp.result;

          /** Read "Error List" **/
          this._pen.writeWithResponse(
            this.dpDevice.mac || this.dpDevice.id,
            { serviceUUID: 'a8a91000-38e9-4fbe-83f3-d82aae6ff68e', characteristicUUID: 'a8a91003-38e9-4fbe-83f3-d82aae6ff68e', type: 'fileRequest' },
            [2,3,0],
            (resp: any) => {

              this.updatePercent = 30;
              syncListData.penErrorLists = resp.result;

              /**
               * Send Usage Lists and Error Lists pen logs to server
               */
              this._pen.saveSyncListData(syncListData).subscribe(
                (success: any) => console.log('saveSyncListData success: ', success),
                this.fail
              );

              this.usageData = _.clone(resp.result);
              let cartridgeIds: any[] = resp.result.map((item: any) => item.catridgeId);
              cartridgeIds = _.sortBy(_.uniq(cartridgeIds));
              /** Send "Cartridge" id's to server **/
              this.doUpdateApiWhiteBlackList(cartridgeIds, (data: any) => {
                this.updatePercent = 35;
                this.checkFirmwareUpdate(data, (done: any) => {
                  this.updatePercent = 40;
                  this.doUpdateBlackListAndSettings(data);
                });
                // this.doUpdateBlackListAndSettings(data);
              });
            },
            this.fail
          );
        },
        this.fail
      );
    }, this.fail);
  };

  public doUpdateApiWhiteBlackList(data: any[], callback: any) {
    this._pen.updateWhiteBlacklist(data).subscribe(callback, this.fail);
  }

  public checkFirmwareUpdate(data: any[], callback: any) {
    // this._pen.updateWhiteBlacklist(data).subscribe(callback, this.fail);
    this.isNewFirmwareAvailable((updateFirmware: boolean) => {
      if (updateFirmware) {
        this.getLastFirmwareVersion(data, callback);
      } else {
        callback(data);
      }
    });
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
        this.updatePercent = 80;
        // alert('2 doUpdateBlackListAndSettings done' + JSON.stringify(done, null, 2) + ' device: ' + JSON.stringify(device, null, 2));
        /** Write new "Black List" to BLE device **/
        this.updateDeviceBlacklist(
          device,
          (resp: any) => {
            // this.checkFirmwareUpdate([], () => {
            // });
            this.updatePercent = 100;
            setTimeout(() => {
              this.deviceUpdated = true;
              clearInterval(this.errTimeout);
              this._ble.isConnected(this.dpDevice, (isConnected: any) => {
                // console.log('isConnected: ', isConnected);
                if (isConnected) {
                  this._ble.disconnect(this.dpDevice, (done: any) => console.log('disconnect done: ', done), false);
                }
              }, false)
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
      device.mac || device.id,
      { serviceUUID: 'a8a91000-38e9-4fbe-83f3-d82aae6ff68e', characteristicUUID: 'a8a91003-38e9-4fbe-83f3-d82aae6ff68e', type: 'fileWrite', device },
      [CHAR_ELEM.read.file.settings,CHAR_ELEM.read.action.write,16],
      callback,
      fail
    );
  }

  public updateDeviceBlacklist(device: any, callback: any, fail: any) {
    // alert('3 updateDeviceBlacklist device: ' + JSON.stringify(device, null, 2));
    this._pen.writeWithResponse(
      device.mac || device.id,
      { serviceUUID: 'a8a91000-38e9-4fbe-83f3-d82aae6ff68e', characteristicUUID: 'a8a91003-38e9-4fbe-83f3-d82aae6ff68e', type: 'fileWrite', device },
      [CHAR_ELEM.read.file.black_list,CHAR_ELEM.read.action.write,0],
      callback,
      fail
    );
  }

  public requestDeviceSettings(device: any, callback: any, fail: any) {
    // alert('updateDeviceBlacklist device: ' + JSON.stringify(device, null, 2));
    this._pen.getSettings(this.dpDevice.serialNumber || this.dpDevice.name).subscribe(callback, fail);
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
    this.showButton = '';
    /** Retry steps: 1) disconnect; 2) start connection checker; 3) scan; 4) connect; **/
    /** Disconnect if connection was established **/
    this._ble.disconnect(this.dpDevice, this.disconnected, this.fail);
    /** Start connection checker **/
    setTimeout(() => this.initConnectionChecker(callback), 300);
    /** Scan for available "Dermapen" BLE device **/
    this._ble.scan(this.dpDevice || {}, (resp: any) => {
      if (resp && resp.dpDevice && resp.dpDevice.mac) {
        this.dpDevice.mac = resp.dpDevice.mac;
      }
      /** Connect to BLE device and invoke provided function **/
      this._ble.connect(this.dpDevice, true, false);
    }, this._ble.stopScan);
  }

  public scanSuccess(resp: any) {
    this.gettingDevices = false;
    if (resp && resp.dpDevice && resp.dpDevice.id) {
      if (this.dependencies.newPen) {
        this.dpDevice = _.clone(resp.dpDevice);
      } else {
        this.dpDevice.mac = resp.dpDevice.mac || '';
        this.dpDevice.id = resp.dpDevice.id;
      }
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

        /** Firmware version check and firmware update. Postponed functionality **/
        // this.isNewFirmwareAvailable();
        // this.getLastFirmwareVersion();
      },
      (err: any) => this.fail(err)
    );
  }

  public updateDeviceSerialNumber(dpDevice: any, callback?: any) {
    this._ble.read(
      dpDevice.mac || dpDevice.id,
      { serviceUUID: '180a', characteristicUUID: '2a25' },
      'string',
      (resp: any) => {
        if (resp) {
          dpDevice.serialNumber = resp;
          if (callback) {
            callback(dpDevice);
          }
          // const updatedDevice: any = {
          //   serialNumber: this.dpDevice.serialNumber || this.dpDevice.serial || this.dpDevice.id,
          //   name: resp
          // };
          // this._pen.updatePen(updatedDevice).subscribe(
          //   (done: any) => {
          //     if (callback) {
          //       callback();
          //     }
          //   },
          //   (err: any) => {
          //     // this.errorDescription = 'Fail to update Pen record with device serial number.';
          //     if (callback) {
          //       callback();
          //     }
          //   }
          // );
        }
      },
      this.fail)
  }

  /** Firmware version check and firmware update. Postponed functionality **/
  public isNewFirmwareAvailable(callback: any) {
    this._ble.read(
      this.dpDevice.mac || this.dpDevice.id,
      { serviceUUID: '180a', characteristicUUID: '2a26' },
      'string',
      (resp: any) => {
        // console.log('isNewFirmwareAvailable writeToDevice Firmware Revision: ', resp);
        if (resp && resp.length) {
          this.firmwareVersion = resp;
          this._firmware.isNewVersionAvailable(this.firmwareVersion + '.hex').subscribe(
            (resp: any) => {
              // alert('isNewFirmwareAvailable: ' + JSON.stringify(resp));
              callback(resp);
            },
            (err: any) => this.fail(err)
          );
        } else {
          callback(false);
        }
      },
      this.fail);
  }

  public getLastFirmwareVersion(data: any, callback: any) {
    this._firmware.getLastVersionDownloadInfo().subscribe(
      (resp: any) => {
        // alert('getLastFirmwareVersion: ' + JSON.stringify(resp));
        // console.log('getLastFirmwareVersion: ', resp);
        if (resp && resp.downloadLink && resp.version !== this.firmwareVersion + '.hex') {
          // if (resp && resp.downloadLink && resp.version) {
          this._api.getByUrl(resp.downloadLink).subscribe(
            (resp: any) => {
              // console.log('getLastFirmwareVersion this._api.getByUrl resp: ', resp);
              const firmwareHexStr: string = resp._body.replace(/[\s\n:]/g, '');
              // console.log('------------ firmwareHexStr: ', firmwareHexStr);
              const firmwareData: any = this._util.getFirmwareHexBuffer(firmwareHexStr);
              // console.log('------------ firmwareBuffer: ', firmwareBuffer);

              if (firmwareData.buffer && firmwareData.buffer.length) {
                this.firmwareBuffer = _.clone(firmwareData.buffer);
                this.dpDevice.firmwareBuffer = this.firmwareBuffer;
                this._pen.writeWithResponse(
                  this.dpDevice.mac || this.dpDevice.id,
                  { serviceUUID: 'a8a91000-38e9-4fbe-83f3-d82aae6ff68e', characteristicUUID: 'a8a91003-38e9-4fbe-83f3-d82aae6ff68e', type: 'fileWrite', device: this.dpDevice },
                  [CHAR_ELEM.read.file.firmware_image,CHAR_ELEM.read.action.write,firmwareData.bytesLength || 0],
                  (done: any) => {
                    // console.log('writeWithResponse firmwareBuffer done: ', done);
                  },
                  this.fail
                );
              } else {
                // alert('firmwareBuffer is not an array!');
                // console.log('firmwareBuffer is not an array!');
              }
              setTimeout(() => {
                callback(data);
              }, 20000);
            },
            (err: any) => {
              console.log(err);
            }
          );
        } else {
          callback(data);
        }
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
