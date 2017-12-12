import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { AlertController } from 'ionic-angular';
import { BLE } from '@ionic-native/ble';

import {
  ANGLE_IMG,
  DEVICE_PANEL_IMG,
  DPW_LOGO_TRANSPARENT
} from '../../app/constants';
import { HomeMenu, MyPenComponent } from '../index';
import { PenService } from '../../services/index';

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
  public pairingDeviceAddress: string = '';

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
    private ble: BLE,
    private bluetoothSerial: BluetoothSerial,
    private alertCtrl: AlertController
  ) {
    bluetoothSerial.enable();
    ble.enable();
  }

  public ionViewDidLoad() {
    this.dependencies = this.navParams.get('dependencies') || {};
    this.dpDevice = { name: '' };
    if (this.dependencies && this.dependencies.pen) {
      this.dpDevice.name = this.dependencies.pen.serialNumber;
    }
    this.startScanning();
  }

  public startScanning() {
    this.dpDevice = { name: '' };
    this.pairedDevices = [];
    this.unpairedDevices = [];
    this.gettingDevices = true;

    this.bluetoothSerial.setDiscoverable(60);

    this.ble.stopScan();

    //this.ble.startScan([]).subscribe(function(device) {
    //  this.unpairedDevices.push(device);
    //  this.success(this.unpairedDevices);
    //}, this.fail);
    //
    //setTimeout(this.ble.stopScan,
    //  5000,
    //  function() { alert("Scan complete"); },
    //  function() { alert("stopScan failed"); }
    //);

    //return new Promise((resolve, reject) => {
    //  this.ble.startScanWithOptions([], { reportDuplicates: false }).subscribe((discoveredDevice: any) => {
    //    this.unpairedDevices.push(discoveredDevice);
    //    this.success(this.unpairedDevices);
    //  }, (error: any) => {
    //    this.fail(error);
    //  });
    //
    //  setTimeout(() => {
    //    this.ble.stopScan();
    //    resolve(this.unpairedDevices);
    //  }, 5000);
    //});

    this.ble.scan([], 5).subscribe(() => {
      this.bluetoothSerial.discoverUnpaired().then(
        (success: any) => {
          this.unpairedDevices = success;
          for (var e = 0; e < success.length; e++) {
            let element = success[e];
            if (this.gettingDevices && element.class === 7936 && (element.name.toLowerCase().indexOf('dp4') !== -1 || element.name.indexOf('derma') !== -1)) {
              for (let item in element) {
                this.dpDevice[item] = element[item];
              }
              this.dpDevice.paired = false;
              this.selectDevice(element.id, element);
              this.gettingDevices = false;
              break;
            }
          }
        },
        (err: any) => {
          console.log(err);
        });

      this.bluetoothSerial.list().then(
        (success: any) => {
          this.pairedDevices = success;
          success.forEach((element: any) => {
            // alert(element.name);
            if (element.class === 7936 && (element.name.indexOf('D') !== -1 || element.name.indexOf('Derma') !== -1)) {
              for (let item in element) {
                this.dpDevice[item] = element[item];
              }
            }
          });
        },
        (err: any) => {
          console.log('err: err');
        });
    }, this.onScanError);


    //this.ble.scan([], 5).subscribe(this.onScanDiscoverDevice, this.onScanError);
  }

  public onScanDiscoverDevice(success: any) {
    this.pairedDevices = success;
  }

  public onScanError(err: any) {
    this.fail(err);
  }

  public connected = (data: any) => {
    this.ble.scan([], 2).subscribe(() => {
      this.successData = JSON.stringify(data);
      this.errorData = '';
      this.dpDevice = data;
      this.dpDevice.paired = true;
    }, () => {});
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
            this.pairingDeviceAddress = address;
            let makeConnection = () => {
              this.ble.connect(address).subscribe(this.connected, this.fail);
            };
            this.ble.scan([], 5).subscribe(makeConnection, this.onScanError);
            setTimeout(() => this.ble.scan([], 5), 2000);
          }
        }
      ]
    });
    alert.present();

  }

  public disconnect() {
    let alert = this.alertCtrl.create({
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
            let makeDisconnection = () => this.ble.disconnect(this.dpDevice.id || this.dpDevice.address)
              .then(this.disconnected, this.fail);
            this.ble.scan([], 5).subscribe(makeDisconnection, this.onScanError);
            this.ble.disconnect(this.dpDevice.id || this.dpDevice.address).then(this.success, this.fail);
          }
        }
      ]
    });
    alert.present();
  }

  public readFromDevice(address, serviceUUID, characteristicUUID) {
    let makeRead = () => {
      this.ble.read(address, serviceUUID, characteristicUUID).then(
        (success: any) => {
          this.deviceReadVolume = success;
          this.success(success);
        }, this.fail);
    };
    this.ble.scan([], 5).subscribe(makeRead, this.fail);
  }

  public writeToDevice(address, serviceUUID, characteristicUUID, rawData) {
    //const dataBase64: string = btoa('' + rawData);
    const data = new Uint8Array(1);
    data[0] = rawData;
    let makeWrite = () => {
      this.ble.write(address, serviceUUID, characteristicUUID, data.buffer)
        .then(this.success,this.fail);
    };
    this.ble.scan([], 5).subscribe(makeWrite, this.fail);
  }

  public goBack() {
    this.ble.disconnect(this.dpDevice.id || this.dpDevice.address);
    this.bluetoothSerial.disconnect();
    this.openPage(HomeMenu);
  }

  public goNext() {
    if (this.dependencies.clinic && this.dependencies.newPen) {
      let pen = {
        clinicId: this.dependencies.clinic.id,
        serialNumber: this.dpDevice.id
      };
      this._pen.registerPen(pen).subscribe(
        (resp: any) => {
          this.openPage(MyPenComponent);
        },
        (err: any) => {
          alert(err);
        }
      );
    } else {
      alert('Error. No clinic provided for pen!');
    }
  }

  public openPage(page) {
    this.navCtrl.push(page, { dependencies: this.dependencies });
  }
}
