import { Injectable } from '@angular/core';

/** Bluetooth **/
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { BLE } from '@ionic-native/ble';

// noinspection TypeScriptCheckImport
// import * as _ from 'lodash';

@Injectable()
export class BleService {

  constructor(
    private ble: BLE,
    private bluetoothSerial: BluetoothSerial
  ) {}

  public enable() {
    this.bluetoothSerial.enable();
    this.ble.enable();
  }

  public discoverableSec(sec: number) {
    this.bluetoothSerial.setDiscoverable(sec);
  }
  
  public scan(onSuccess: any, onErr: any) {
    /** Stop previous scan if it was active **/
    this.ble.stopScan();
    // this.ble.stopScan().then(
    //   (done: any) => {},
    //   (err: any) => onErr(err)
    // );

    let dpDevice: any = {};
    let pairedDevices: any = [];
    let unpairedDevices: any = [];

    // this.discoverPaired(
    //   (paired: any) => {
    //     alert('this.discoverPaired done: ' + JSON.stringify(paired));
    //     if (paired) {
    //       pairedDevices = paired.pairedDevices ? paired.pairedDevices : pairedDevices;
    //       dpDevice = paired.dpDevice ? paired.dpDevice : dpDevice;
    //       const result = { dpDevice, pairedDevices, unpairedDevices };
    //       onSuccess(result);
    //     }
    //   },
    //   (err: any) => onErr(err)
    // );

    // this.discoverUnpaired(
    //   (unpaired: any) => {
    //     alert('this.discoverUnpaired done: ' + JSON.stringify(unpaired));
    //     if (unpaired) {
    //       unpairedDevices = unpaired.unpairedDevices ? unpaired.unpairedDevices : unpairedDevices;
    //       dpDevice = unpaired.dpDevice ? unpaired.dpDevice : dpDevice;
    //     }
    //     onSuccess({ dpDevice, pairedDevices, unpairedDevices });
    //   },
    //   (err: any) => onErr(err)
    // );

    this.ble.scan([], 30).subscribe((device: any) => {
      unpairedDevices.push(device);
      if (device.name &&
          device.name.length &&
          (device.name.toLowerCase().indexOf('dp4') !== -1 ||
           device.name.indexOf('derma') !== -1)) {
        for (let item in device) {
          dpDevice[item] = device[item];
        }
        dpDevice.paired = false;
        const result = { dpDevice, pairedDevices, unpairedDevices };
        onSuccess(result);
        this.ble.stopScan();
      }
    }, onErr);

  }

  public stopScan(onSuccess?: any, onErr?: any) {
    this.ble.stopScan().then(onSuccess, onErr);
  }

  public discoverUnpaired(onSuccess: any, onErr: any) {
    let dpDevice: any = null;
    let unpairedDevices: any = null;

    this.bluetoothSerial.discoverUnpaired().then(
      (success: any) => {
        unpairedDevices = success;
        for (let e = 0; e < success.length; e++) {
          let element = success[e];
          if (element.class === 7936 && (element.name.toLowerCase().indexOf('dp4') !== -1 || element.name.indexOf('derma') !== -1)) {
            for (let item in element) {
              dpDevice[item] = element[item];
            }
            dpDevice.paired = false;
            break;
          }
        }
        onSuccess({ dpDevice, unpairedDevices });
      },
      (err: any) => onErr(err));
  }

  public discoverPaired(onSuccess: any, onErr: any) {
    let dpDevice: any = null;
    let pairedDevices: any = null;

    this.bluetoothSerial.list().then(
      (success: any) => {
        pairedDevices = success;
        for (let e = 0; e < success.length; e++) {
          let element = success[e];
          if (element.class === 7936 && (element.name.toLowerCase().indexOf('dp4') !== -1 || element.name.toLowerCase().indexOf('derma') !== -1)) {
            for (let item in element) {
              dpDevice[item] = element[item];
            }
            dpDevice.paired = true;
            onSuccess({ dpDevice, pairedDevices });
            break;
          }
        }
      },
      (err: any) => onErr(err));
  }

  public connect(device: any, onSuccess: any, onErr: any) {
    // let makeConnection = () => this.ble.connect(device.id).subscribe(onSuccess, onErr);
    // this.ble.scan([], 5).subscribe(makeConnection, onErr);
    this.ble.connect(device.id).subscribe(onSuccess, onErr);
  }
  
  public disconnect(device: any, onSuccess: any, onErr: any) {
    let disconnect = () => this.ble.disconnect(device.id || device.address)
      .then(onSuccess, onErr);
    this.ble.scan([], 5).subscribe(disconnect, onErr);
  }

  public isConnected(device: any, onSuccess: any, onErr: any) {
    // let isConnected = () => this.ble.isConnected(device.id).then(onSuccess, onErr);
    // this.ble.scan([], 5).subscribe(isConnected, onErr);
    this.ble.isConnected(device.id).then(onSuccess, onErr);
  }

  public read(address: any, uuid: any, onSuccess: any, onErr: any) {
    let read = () => {
      this.ble.read(address, uuid.serviceUUID, uuid.characteristicUUID)
        .then(onSuccess, onErr);
    };
    this.ble.scan([], 5).subscribe(read, onErr);
  }

  public write(address: any, uuid: any, rawData: any, onSuccess: any, onErr: any) {
    const data = new Uint8Array(1);
    data[0] = rawData;
    let write = () => {
      this.ble.write(address, uuid.serviceUUID, uuid.characteristicUUID, data.buffer)
        .then(onSuccess, onErr);
    };
    this.ble.scan([], 5).subscribe(write, onErr);

  }
}
