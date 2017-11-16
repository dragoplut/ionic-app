import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { AlertController } from 'ionic-angular';
import { BLE } from '@ionic-native/ble';

import {
  ANGLE_IMG,
  DEVICE_PANEL_IMG,
  DPW_LOGO_TRANSPARENT
} from '../../app/constants';
import { HomeMenu } from '../index';

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

  constructor(
    public navCtrl: NavController,
    private ble: BLE,
    private bluetoothSerial: BluetoothSerial,
    private alertCtrl: AlertController
  ) {
    bluetoothSerial.enable();
    ble.enable();
  }

  public ionViewDidLoad() {
    this.dpDevice = { name: '' };
    this.startScanning();
  }

  public startScanning() {
    this.dpDevice = { name: '' };
    this.pairedDevices = [];
    this.unpairedDevices = [];
    this.gettingDevices = true;

    //this.ble.startScan([]).then(function(device) {
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

    this.bluetoothSerial.discoverUnpaired().then(
      (success: any) => {
        this.unpairedDevices = success;
        this.gettingDevices = false;
        success.forEach(element => {
          // alert(element.name);
          if (element.class === 7936 && (element.name.indexOf('DP4') !== -1 || element.name.indexOf('Derma') !== -1)) {
            this.dpDevice = element;
            this.dpDevice.paired = false;
          }
        });
      },
      (err: any) => {
        console.log(err);
      });

    this.bluetoothSerial.list().then(
      (success: any) => {
        this.pairedDevices = success;
        success.forEach(element => {
          // alert(element.name);
          if (element.class === 7936 && (element.name.indexOf('DP4') !== -1 || element.name.indexOf('Derma') !== -1)) {
            this.dpDevice = element;
            this.dpDevice.paired = true;
          }
        });
      },
      (err: any) => {
        console.log('err: err');
      });

    //this.ble.scan([], 5).subscribe(this.onScanDiscoverDevice, this.onScanError);
  }

  public onScanDiscoverDevice(success: any) {
    this.pairedDevices = success;
  }

  public onScanError(err: any) {
    this.fail(err);
  }

  public connected = (data: any) => {
    this.successData = JSON.stringify(data);
    this.errorData = '';
    this.dpDevice = data;
    this.dpDevice.paired = true;
  };

  public disconnected = (data: any) => {
    this.successData = JSON.stringify(data);
    this.errorData = '';
    this.dpDevice.paired = false;
  };

  public success = (data: any) => {
    this.successData = JSON.stringify(data);
    this.errorData = '';
    alert('success: ' + this.successData);
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
            let makeDisconnection = () => this.ble.disconnect(this.dpDevice.id || this.dpDevice.address);
            this.ble.scan([], 5).subscribe(makeDisconnection, this.onScanError);
            //this.ble.disconnect(this.dpDevice.id || this.dpDevice.address).then(this.success, this.fail);
            setTimeout(() => this.startScanning(), 1000);
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
      this.ble.write(address, serviceUUID, characteristicUUID, data.buffer).then(this.success,this.fail);
    };
    this.ble.scan([], 5).subscribe(makeWrite, this.fail);
  }

  public goBack() {
    this.openPage(HomeMenu);
  }

  public goNext() {
    this.openPage(HomeMenu);
  }

  public openPage(page) {
    this.navCtrl.push(page);
  }
}
