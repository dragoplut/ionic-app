import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AlertController } from 'ionic-angular';

import {
  ANGLE_IMG,
  DEVICE_PANEL_IMG,
  DPW_LOGO_TRANSPARENT
} from '../../app/constants';
import { HomeMenu, MyPenComponent } from '../index';
import { BleService, PenService } from '../../services';

@Component({
  selector: 'register-pen',
  templateUrl: 'register-pen.html'
})
export class RegisterPenComponent {

  public logoTransparent: string = DPW_LOGO_TRANSPARENT;
  public angleImg: string = ANGLE_IMG;
  public devicePanelImg: string = DEVICE_PANEL_IMG;

  public dpDevice: any = { name: '' };
  public errorData: any = '';
  public successData: any = '';
  public pairingDevice: any = 'No data yet!';

  public deviceVolume: number = 3;
  public deviceReadVolume: number = 0;

  public unpairedDevices: any[] = [];
  public pairedDevices: any[] = [];
  public gettingDevices: boolean = false;

  public dependencies: any = {};

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public _pen: PenService,
    public _ble: BleService,
    private alertCtrl: AlertController
  ) {
    _ble.enable();
  }

  public ionViewDidLoad() {
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
      this.initConnectionChecker();
      this._ble.scan((resp: any) => {
        this._ble.connect(this.dpDevice, this.connected, false);
      }, this._ble.stopScan);
    } else {
      this.startScanning();
    }
    // this._ble.discoverableSec(60);
  }

  public startScanning() {
    this.initConnectionChecker();

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
    this.dpDevice = data;
    this._ble.isConnected(
      this.dpDevice,
      (resp: any) => {
        this.dpDevice.paired = true;
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
    this._ble.read(address, { serviceUUID, characteristicUUID }, this.success, this.fail);
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
        clinicId: this.dependencies.clinic.id,
        serialNumber: this.dpDevice.id
      };
      // alert(JSON.stringify(pen));
      this._pen.registerPen(pen).subscribe(
        (resp: any) => {
            // alert(JSON.stringify(resp));
            this.openPage(MyPenComponent);
          },
        (err: any) => alert(err)
      );
    } else {
      alert('Error. No clinic provided for pen!');
    }
  }

  public openPage(page) {
    this.navCtrl.push(page, { dependencies: this.dependencies });
  }

  public scanSuccess(resp: any) {
    this.gettingDevices = false;
    if (resp && resp.dpDevice && resp.dpDevice.id) {
      this.dpDevice = resp.dpDevice;
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

  public initConnectionChecker() {
    let jwtCheckInterval: any = setInterval(() => {
      this._ble.isConnected(this.dpDevice, () => {
        clearInterval(jwtCheckInterval);
      }, false);
    }, 1000);
  }

  public isConnected(device: any) {
    this._ble.isConnected(device, (resp: any) => {
      alert('isConnected: ' + JSON.stringify(resp));
    }, this.fail);
  }
}
