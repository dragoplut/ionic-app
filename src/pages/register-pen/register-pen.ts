import { Component, NgZone } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { AlertController } from 'ionic-angular';

import {
  ANGLE_IMG,
  DEVICE_PANEL_IMG,
  DPW_LOGO_TRANSPARENT,
  CHAR_ELEM
} from '../../app/constants';
import { HomeMenu, MyPenComponent, UpdatePenComponent } from '../';
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
  public transferInfo: any = {};
  public usageData: any = {};
  public dpDevice: any = { name: '', firmwareBufferLength: 0, firmwareUpdated: false };
  public firmwareVersion: any = '';
  public firmwareUpdateAvailable: boolean = false;
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

  // Debug log data
  public logData: any[] = [];

  public updatePercent: number = 0;
  public timeNowSeconds: number = moment().diff(moment().year(2017).startOf('year'), 'seconds');
  public dummyWhiteBlackList: any[] = [];
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
    private alertCtrl: AlertController,
    private zone: NgZone )
   {}

  public ionViewDidLoad() {
    this.platform.ready().then(() => {
      this.updateUserInfo();
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
      } else {
        this.startScanning();
      }
      setTimeout(() => {
        clearInterval(this.jwtCheckIntervalPermanent);
      }, 30000);
    });
  }

  public startScanning(existingDevice?: any) {
    this.transferInfo = {};
    this.showButton = '';
    setTimeout(() => this.initConnectionChecker(), 300);
    this.logEvent('Info', 'startScanning...', '');

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
        for (const prop in device) {
          if (prop) {
            this.dpDevice[prop] = device[prop];
          }
        }
        // this.dpDevice = device;
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
    this.logEvent('Error', this.errorData, '');
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

  public readFromDevice(address: any, serviceUUID: any, characteristicUUID: any, type: string, callback?: any) {
    console.log('readFromDevice: ', address, serviceUUID, characteristicUUID, type);
    this._ble.read(
      address,
      { serviceUUID, characteristicUUID },
      type,
      (resp: any) => {
        // console.log('this._ble.read resp: ', resp);
        if (callback) {
          callback(resp);
        } else {
          this.success(resp);
        }
      },
      this.fail
    );
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
      this.logEvent('Info', 'Start Sync', '');
      this.updateDeviceSerialNumber(this.dpDevice, (device: any) => {
        let pen = {
          name: device.serialNumber,
          clinicId: this.dependencies.clinic.id,
          serialNumber: device.serialNumber
        };
        // alert(JSON.stringify(pen));
        this.startErrTimeout(60);
        this.logEvent('Info', 'Start Pen Register', JSON.stringify(pen, null, 2));
        this._pen.registerPen(pen).subscribe(
          (resp: any) => {
            if (resp) {
              this.logEvent('Success', 'Pen Registered', '');
              this.doPenUpdate();
            } else {
              this.showButton = 'done';
              this.errorDescription = 'Error. This pen is already registered to other clinic!';
              this.logEvent('Error', 'This pen is already registered to other clinic!', '');
            }
          },
          (err: any) => alert(err)
        );
      });
    } else {
      this.logEvent('Error', 'No clinic provided for pen!', '');
      alert('Error. No clinic provided for pen!');
    }
  }

  public doPenUpdate() {
    this.logEvent('Info', 'Start Pen Update', this.dpDevice.serialNumber);

    this.requestDeviceSettings(this.dpDevice,(resp: any) => {
      // console.log('requestDeviceSettings resp: ', resp);

      if (resp && resp.length) {
        if (resp.length < 20) {
          const settingsWithDummyMagicNumber: any[] = [1,2,3,4].concat(resp);
          this.dpDevice.deviceSettingsEncrypted = _.clone(settingsWithDummyMagicNumber);
        } else {
          this.dpDevice.deviceSettingsEncrypted = _.clone(resp);
        }
      }

      this.logEvent('Success', 'Device Settings', JSON.stringify(resp, null, 2));
      /** Update device settings if exist **/
      if (resp && resp.userId) {
        this.dummySettings[0] = resp.userId;
        this.dummySettings[1] = resp.currentDateTime;
        this.dummySettings[2] = resp.warmDateTime;
        this.dummySettings[3] = resp.forceDateTime;
      }

      /** saveSyncListData with encryption **/
      const keyInfoArr: number[] = [];
      this.dpDevice.keyInfo.forEach((n: number) => {
        keyInfoArr.push(n);
      });
      const syncData: any = {
        serialNumber: '' + this.dpDevice.serialNumber,
        penUsageLists: [],
        penErrorLists: [],
        keyInfo: keyInfoArr
      };

      this.logEvent('Info', 'read Usage List from device', '[1,3,0]');
      /** Read "Usage List" **/
      this._pen.writeWithResponse(
        this.dpDevice.mac || this.dpDevice.id,
        { serviceUUID: 'a8a91000-38e9-4fbe-83f3-d82aae6ff68e', characteristicUUID: 'a8a91003-38e9-4fbe-83f3-d82aae6ff68e', type: 'fileRequest' },
        [CHAR_ELEM.read.file.usage_list,CHAR_ELEM.read.action.read,0],
        (resp: any) => {

          this.zone.run(() => this.updatePercent = 25);
          syncData.penUsageLists = resp.rawResult;
          this.logEvent('Success', 'Usage List', JSON.stringify(syncData.penUsageLists, null, 2));

          this.logEvent('Info', 'read Error List from device', '[2,3,0]');
          /** Read "Error List" **/
          this._pen.writeWithResponse(
            this.dpDevice.mac || this.dpDevice.id,
            { serviceUUID: 'a8a91000-38e9-4fbe-83f3-d82aae6ff68e', characteristicUUID: 'a8a91003-38e9-4fbe-83f3-d82aae6ff68e', type: 'fileRequest' },
            [CHAR_ELEM.read.file.error_list,CHAR_ELEM.read.action.read,0],
            (resp: any) => {

              this.zone.run(() => this.updatePercent = 30);
              syncData.penErrorLists = resp.rawResult;
              this.logEvent('Success', 'Error List', JSON.stringify(syncData.penErrorLists, null, 2));

              this.logEvent('Info', 'Send Usage Lists and Error Lists pen logs to server', JSON.stringify(syncData, null, 2));
              /**
               * Send Usage Lists and Error Lists pen logs to server
               */
              this._pen.saveSyncData(syncData).subscribe(
                (success: any) => this.logEvent('Success', 'save Sync List Data success: ', JSON.stringify(success, null, 2)),
                this.fail
              );

              this.usageData = _.clone(resp.result);
              let cartridgeIds: any[] = resp.result.map((item: any) => item.catridgeId);
              cartridgeIds = _.sortBy(_.uniq(cartridgeIds));

              this.logEvent('Info', 'send Usage List cartridge ids to server and request Blacklist', JSON.stringify(cartridgeIds, null, 2));
              /** Send "Cartridge" id's to server **/
              this.doUpdateApiWhiteBlackList(cartridgeIds, (data: any) => {
                this.zone.run(() => this.updatePercent = 35);
                this.logEvent('Success', 'Blacklist received', JSON.stringify(data, null, 2));

                this.logEvent('Info', 'as all data from Pen has been read, start Firmware version check', this.firmwareVersion);

                this.checkFirmwareUpdate(data, (done: any) => {
                  this.zone.run(() => this.updatePercent = 40);
                  if (done && done.percent === 100 && !done.errorMessage) {
                    this.dpDevice.firmwareUpdated = true;
                    this.firmwareUpdateAvailable = false;
                    this.zone.run(() => this.updatePercent = 0);
                  } else {
                    this.doUpdateBlackListAndSettings(data);
                  }
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
    // this._pen.updateWhiteBlacklistEncrypted(data).subscribe(
    //   (resp: any) => {
    //     console.log('doUpdateApiWhiteBlackList resp: ', JSON.stringify(resp));
    //   },
    //   (err: any) => {
    //     console.log('doUpdateApiWhiteBlackList err: ', JSON.stringify(err));
    //   }
    //   );
    this._pen.updateWhiteBlacklistEncrypted(data, this.dpDevice.keyInfo).subscribe(callback, this.fail);
    // this._pen.updateWhiteBlacklist(data).subscribe(callback, this.fail);
  }

  public checkFirmwareUpdate(data: any[], callback: any) {
    // this._pen.updateWhiteBlacklist(data).subscribe(callback, this.fail);
    this.isNewFirmwareAvailable((updateFirmware: boolean) => {
      if (updateFirmware) {
        this.requestFirmwareUpgrade(this.dpDevice, data, callback);
      } else {
        this.logEvent('Info', 'Firmware update NOT required.', '');
        callback(data);
      }
    });
  }

  public doUpdateBlackListAndSettings(data: any[]) {
    this.zone.run(() => this.updatePercent = 45);
    this.dpDevice.blackListEncrypted = _.clone(data);
    let device: any = _.clone(this.dpDevice);
    this.errorDescription = device && device.id ? '' : 'Communication to the pen error';

    device.dummyWhiteBlackList = data;
    device.settings = this.dummySettings;
    device.deviceSettingsEncrypted = this.dpDevice.deviceSettingsEncrypted;

    const encryptedData: any = this._util.getBufferChunksOf(this.dpDevice.deviceSettingsEncrypted);

    device.dataBuffer = encryptedData.buffer;
    device.dataBufferLength = encryptedData.buffer.length;
    device.dataBytesLength = encryptedData.bytesLength;

    /** Write new "Black List" to BLE device **/
    this.updateDeviceBlacklist(
      device,
      (resp: any) => {
        this.zone.run(() => this.updatePercent = 80);
        this.logEvent('Success', 'Device Black List updated', JSON.stringify(resp, null, 2));

        /** Write new "Settings" to BLE device **/
        this.updateDeviceSettings(
          device,
          (done: any) => {
            this.zone.run(() => this.updatePercent = 100);
            this.logEvent('Success', 'Device Settings updated', JSON.stringify(done, null, 2));
            this.deviceUpdated = true;
            clearInterval(this.errTimeout);
            this._ble.isConnected(this.dpDevice, (isConnected: any) => {
              if (isConnected) {
                this._ble.disconnect(this.dpDevice, (done: any) => {
                  this.logEvent('Success', 'Disconnect: ', done);
                  this._ble.isConnected(
                    this.dpDevice,
                    (connected: any) => {
                      this.logEvent('Err', 'Check if still connected: ', connected);
                    },
                    (notConnected: any) => {
                      this.logEvent('Success', 'Check if still connected: ', notConnected);
                      this.logEvent('Success', 'Sync Done!', '----------------------------------------------------');
                    },
                  );
                }, (err: any) => {
                  console.log('this.ble.disconnect err: ', err);
                });
              }
            }, (err: any) => {
              console.log('this._ble.isConnected err: ', err);
            })
          },
          (errDescription: any) => this.errorData = errDescription
        );
      },
      (errDescription: string) => this.errorData = errDescription
    )

  }

  public updateDeviceSettings(device: any, callback: any, fail: any) {
    this.logEvent('Info', 'start Device Settings update', JSON.stringify([CHAR_ELEM.read.file.settings,CHAR_ELEM.read.action.write,16], null, 2));
    this._pen.writeWithResponse(
      device.mac || device.id,
      { serviceUUID: 'a8a91000-38e9-4fbe-83f3-d82aae6ff68e', characteristicUUID: 'a8a91003-38e9-4fbe-83f3-d82aae6ff68e', type: 'fileWrite', device },
      [CHAR_ELEM.read.file.settings,CHAR_ELEM.read.action.write,16],
      callback,
      fail
    );
  }

  public updateDeviceBlacklist(device: any, callback: any, fail: any) {
    this.logEvent('Info', 'start Device Blacklist update', JSON.stringify([CHAR_ELEM.read.file.black_list,CHAR_ELEM.read.action.write,0], null, 2));
    this._pen.writeWithResponse(
      device.mac || device.id,
      { serviceUUID: 'a8a91000-38e9-4fbe-83f3-d82aae6ff68e', characteristicUUID: 'a8a91003-38e9-4fbe-83f3-d82aae6ff68e', type: 'fileWrite', device },
      [CHAR_ELEM.read.file.black_list,CHAR_ELEM.read.action.write,0],
      callback,
      fail
    );
  }

  public updateFirmware(device: any, callback: any, fail: any) {
    this.logEvent('Info', 'start Device Firmware update', JSON.stringify([CHAR_ELEM.read.file.firmware_image,CHAR_ELEM.read.action.write,device.dataBytesLength], null, 2));
    // console.log('updateFirmware writeWithResponse: ', JSON.stringify([CHAR_ELEM.read.file.firmware_image,CHAR_ELEM.read.action.write,device.firmwareBuffer.byteLength], null, 2))
    this._pen.writeWithResponse(
      device.mac || device.id,
      { serviceUUID: 'a8a91000-38e9-4fbe-83f3-d82aae6ff68e', characteristicUUID: 'a8a91003-38e9-4fbe-83f3-d82aae6ff68e', type: 'fileWrite', device },
      [CHAR_ELEM.read.file.firmware_image,CHAR_ELEM.read.action.write,device.dataBytesLength],
      callback,
      fail,
      (progressInfo: any) => {
        // console.log(progressInfo);
        this.zone.run(() => {
          this.transferInfo = progressInfo;
          if (this.transferInfo && this.transferInfo.errorMessage && callback) {
            console.log('transferInfo Error: ', this.transferInfo.errorMessage);
            this.logEvent('Error', 'Firmware upgrade error: ', this.transferInfo.errorMessage);
            // setTimeout(() => {
            //   this.zone.run(() => this.firmwareUpdateAvailable = false);
            // }, 10000);
            // callback();
          } else if (this.transferInfo && this.transferInfo.percent >= 100 && callback) {
            if (this.transferInfo.packageIdx >= this.transferInfo.packagesTotal - 1) {
              console.log('transferInfo: Firmware Image transfer success! ', this.transferInfo);
              this.logEvent('Success', 'Firmware Image transfer success!', '');
              callback(this.transferInfo);
            }
            // setTimeout(() => {
            //   this.zone.run(() => this.firmwareUpdateAvailable = false);
            // }, 5000);
            // callback();
          }
        });
      }
    );
  }

  public requestDeviceSettings(device: any, callback: any, fail: any) {
    this.logEvent('Info', 'Request Device Settings from API for', this.dpDevice.serialNumber);
    this._pen.getSettingsEncrypted(this.dpDevice.serialNumber || this.dpDevice.name, this.dpDevice.keyInfo)
      .subscribe(callback, fail);
  }

  public goPenUpdate() {
    this.openPage(UpdatePenComponent);
  }

  public openPage(page) {
    this.navCtrl.push(page, { dependencies: this.dependencies });
  }

  public doDone() {
    clearInterval(this.jwtCheckIntervalPermanent);
    this._ble.stopScan();
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
      this._ble.connect(this.dpDevice, callback, (err: any) => {
        console.log('this._ble.connect err: ', err);
      });
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

    this.readKeyInfo(this.dpDevice, (resp: any) => {
      this.dependencies.newPen ? this.goNext() : this.doPenUpdate();
    })
    // this.dependencies.newPen ? this.goNext() : this.doPenUpdate();
  }

  public readKeyInfo(device: any, callback: any, error?: any) {
    this.readFromDevice(
      device.mac,
      'a8a91000-38e9-4fbe-83f3-d82aae6ff68e',
      'a8a91007-38e9-4fbe-83f3-d82aae6ff68e',
      'uint8',
      (done: any) => {
        console.log('readFromDevice Key Info done: ', done);
        this.dpDevice.keyInfo = done;
        if (callback) {
          callback(done);
        }
      });
  }

  public initConnectionChecker(callback?: any) {
    let jwtCheckInterval: any = setInterval(() => {
      this._ble.isConnected(this.dpDevice, () => {
        this.dpDevice.paired = true;
        this.logEvent('Success', 'device paired', JSON.stringify(this.dpDevice.paired, null, 2));
        clearInterval(jwtCheckInterval);
        if (callback) {
          callback();
        }
      }, (err: any) => {
        console.log('this._ble.isConnected err: ', err);
      });
    }, 1000);
  }

  public isConnected(device: any) {
    this._ble.isConnected(device, (resp: any) => {
      this.dpDevice.paired = true;
    }, this.fail);
  }

  public addBlackWhiteList(dummyBlackWhiteList: any[]) {
    this._pen.addTemporaryWhitelist(dummyBlackWhiteList).subscribe(
      (resp: any) => {
        this.updateBlackWhiteList();
      },
      (err: any) => this.fail(err)
    );
  }

  public updateBlackWhiteList() {
    this._pen.getTemporaryWhitelist().subscribe(
      (resp: any) => {
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
        this.logEvent('Info', 'getAccountInfo success');
        /** Firmware version check and firmware update. Postponed functionality **/
        // this.isNewFirmwareAvailable();
        // this.getLastFirmwareVersion();
      },
      (err: any) => this.fail(err)
    );
  }

  public updateDeviceSerialNumber(dpDevice: any, callback?: any) {
    this.logEvent('Info', 'Start read device serial number for address', dpDevice.mac || dpDevice.id);
    this._ble.read(
      dpDevice.mac || dpDevice.id,
      { serviceUUID: '180a', characteristicUUID: '2a25' },
      'string',
      (resp: any) => {
        if (resp) {
          this.logEvent('Info', 'device serial number', resp);
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
    this.logEvent('Info', 'read Pen Firmware version for device address', this.dpDevice.mac || this.dpDevice.id);
    this._ble.read(
      this.dpDevice.mac || this.dpDevice.id,
      { serviceUUID: '180a', characteristicUUID: '2a26' },
      'string',
      (resp: any) => {
        if (resp && resp.length) {
          this.logEvent('Success', 'current Firmware version', resp);
          this.firmwareVersion = resp;
          this.logEvent('Info', 'start check if new Firmware is available', '');
          this._firmware.isNewVersionAvailable(this.firmwareVersion + '.ota').subscribe(
            (resp: any) => callback(resp),
            (err: any) => this.fail(err)
          );
        } else {
          callback(false);
        }
      },
      this.fail);
  }

  public getLastFirmwareVersion(data: any, callback: any) {
    this._firmware.getLastVersionFirmware(this.dpDevice.keyInfo).subscribe(
      (resp: any) => {
        console.log('getLastFirmwareVersion: ', resp);
        if (resp && resp.content && resp.version !== this.firmwareVersion + '.ota' && !this.dpDevice.firmwareUpdated) {
          // this.firmwareUpdateAvailable = false; // TODO: SHOULD BE REMOVED!
          this.firmwareUpdateAvailable = true; // TODO: UNCOMMENT TO MAKE FW UPDATE WORK!!!!!!

          this.logEvent('Info', 'new Firmware is available! Request firmware image.', '');
          // this.logEvent('Info', 'start download Firmware image by url', resp.downloadLink);

          const firmwareData: any = this._util.getBufferChunksOf(resp.content);
          // const firmwareData: any = this._util.getFirmwareHexBuffer(firmwareHexStr);
          this.logEvent('Success', 'Firmware image received and prepared for transfer to device!', '');

          if (firmwareData.buffer && firmwareData.buffer.length) {
            this.firmwareBuffer = _.clone(firmwareData.buffer);
            this.dpDevice.dataBuffer = this.firmwareBuffer;
            this.dpDevice.firmwareBufferLength = this.firmwareBuffer.length;
            this.dpDevice.dataBytesLength = firmwareData.bytesLength;

            this.updateFirmware(
              this.dpDevice,
              (done: any) => {
                callback(done);
              },
              (error: any) => {
                this.logEvent('Info', 'Firmware image transfer ERROR: ', JSON.stringify(error, null, 2));
                alert('Firmware image transfer ERROR: ' + JSON.stringify(error));
              }
            );
          } else {
            console.log('dataBuffer is not an array!');
          }
        } else {
          this.logEvent('Info', 'Firmware update NOT required.', '');
          callback(data);
        }
      },
      (err: any) => this.fail(err)
    );
  }

  public requestFirmwareUpgrade(item: any, data?: any, callback?: any) {
    const options: any = {
      title: 'Confirm',
      message: `Firmware upgrade is available. Do you want to download and upgrade now?`
    };
    this.showConfirm(options, 'upgradeFirmware', item, data, callback);
  }

  public showConfirm(options: any, action: string, item?: any, data?: any, callback?: any) {
    let alert: any = this.alertCtrl.create({
      title: options.title,
      message: options.message,
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
            this.doCanceled(action, item, data, callback);
          }
        },
        {
          text: 'Yes',
          handler: () => {
            this.doConfirmed(action, item, data, callback);
          }
        }
      ]
    });
    alert.present();
  }

  public doConfirmed(action: string, item?: any, data?: any, callback?: any) {
    switch (action) {
      case 'upgradeFirmware':
        this.getLastFirmwareVersion(data, callback);
        break;
      default:
        break;
    }
  }

  public doCanceled(action: string, item?: any, data?: any, callback?: any) {
    switch (action) {
      case 'upgradeFirmware':
        callback(data);
        break;
      default:
        break;
    }
  }

  private logEvent(logType: string, logDescription: string, logData?: any) {
    const log: string = `${(new Date()).toISOString()} ${logType}: ${logDescription} ${logData || ''}`;
    this.logData.push(log);
  }

  private startErrTimeout(sec: number) {
    this.errTimeout = setTimeout(() => {
      this.errorDescription = 'Communication to the pen error';
      this.zone.run(() => this.updatePercent = 0);
      this.logEvent('Error', 'Communication to the pen error by timeout', '');
    }, sec * 1000)
  }
}
