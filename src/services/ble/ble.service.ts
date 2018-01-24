import { Injectable } from '@angular/core';

/** Bluetooth **/
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { BLE } from '@ionic-native/ble';

// noinspection TypeScriptCheckImport
import * as _ from 'lodash';

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
  
  public scan(existingDevice: any, onSuccess: any, onErr: any) {
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
           device.name.toLowerCase().indexOf('derma') !== -1)) {

        if (existingDevice && (existingDevice.serialNumber || existingDevice.name)) {
          this.connect(device, (done: any) => {
            // alert('connected to: ' + JSON.stringify(device, null, 2));
            this.read(
              device.id,
              { serviceUUID: '180a', characteristicUUID: '2a25' },
              'string',
              (resp: any) => {
                // alert('scan --> read --> existingDevice --> resp: ' + resp + ' existingDevice: ' + JSON.stringify(existingDevice, null, 2));
                if (resp && (resp === existingDevice.serialNumber || resp === existingDevice.name || resp === existingDevice.id)) {
                  for (let item in device) {
                    dpDevice[item] = _.clone(device[item]);
                  }
                  dpDevice.id = resp;
                  dpDevice.mac = device.id;
                  dpDevice.serialNumber = resp;
                  dpDevice.paired = false;
                  const result = { dpDevice, pairedDevices, unpairedDevices };
                  onSuccess(result);
                  this.stopScan();
                } else {
                  this.isConnected(device, (isConnected: any) => {
                    // alert('isConnected: ' + JSON.stringify(isConnected, null, 2));
                    if (isConnected) {
                      this.disconnect(device, () => {
                        // alert('disconnected from device: ' + JSON.stringify(device, null, 2));
                      }, false);
                    }
                  }, false);
                }
              },
              false)
          }, false);

        } else {
          this.connect(device, (done: any) => {
            // alert('connected to: ' + JSON.stringify(device, null, 2));
            this.read(
              device.id,
              { serviceUUID: '180a', characteristicUUID: '2a25' },
              'string',
              (resp: any) => {
                for (let item in device) {
                  dpDevice[item] = _.clone(device[item]);
                }
                dpDevice.id = resp;
                dpDevice.mac = device.id;
                dpDevice.serialNumber = resp;
                dpDevice.paired = false;
                const result = { dpDevice, pairedDevices, unpairedDevices };
                onSuccess(result);
                this.stopScan();
              },
              false)
          }, false);
        }

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
    this.ble.connect(device.mac || device.id).subscribe(onSuccess, onErr);
  }
  
  public disconnect(device: any, onSuccess: any, onErr: any) {
    let disconnect = () => this.ble.disconnect(device.mac || device.id || device.address)
      .then(onSuccess, onErr);
    this.ble.scan([], 5).subscribe(disconnect, onErr);
  }

  public isConnected(device: any, onSuccess: any, onErr: any) {
    this.ble.isConnected(device.mac || device.id).then(onSuccess, onErr);
  }

  public read(address: any, uuid: any, type: string, onSuccess: any, onErr: any) {
    this.ble.read(address, uuid.serviceUUID, uuid.characteristicUUID)
      .then((resp: any) => onSuccess(this.handleBufferByType(type, resp)), onErr);
  }

  public write(address: any, uuid: any, rawData: any, onSuccess: any, onErr: any) {
    // alert('write ' + JSON.stringify(rawData, null, 2));
    // const data = new Uint8Array( rawData && rawData.length ? rawData.length : 1);
    // if (rawData && rawData.length) {
    //   _.forEach(rawData, (item: any, idx: number) => {
    //     data[idx] = item;
    //   })
    // } else {
    //   data[0] = rawData;
    // }

    let data: any;

    if (uuid.type) {
      data = this.bufferFromArrByType(uuid.type, rawData);
    } else {
      data = new Uint8Array(1);
      data[0] = rawData;
    }

    this.ble.write(address, uuid.serviceUUID, uuid.characteristicUUID, data.buffer)
      .then(onSuccess, onErr);
  }

  public startNotification(address: any, uuid: any, onSuccess: any, onErr: any) {
    // alert('startNotification: ' + uuid.characteristicUUID);
    this.ble.startNotification(address, uuid.serviceUUID, uuid.characteristicUUID)
      .subscribe((buffer: any) => onSuccess(this.arrFromBufferByType(uuid.type, buffer)), onErr);
  }

  public stopNotification(address: any, uuid: any, onSuccess: any, onErr: any) {
    this.ble.stopNotification(address, uuid.serviceUUID, uuid.characteristicUUID)
      .then(onSuccess, onErr);
  }

  private handleBufferByType(type: string, buffer: any) {
    let result: any;
    switch (type) {
      case 'string':
        result = String.fromCharCode.apply(null, new Uint8Array(buffer));
        break;
      case 'unit8':
        result = new Uint8Array(buffer);
        break;
      case 'unit16':
        result = new Uint16Array(buffer);
        break;
      case 'unit32':
        result = new Uint32Array(buffer);
        break;
      default:
        break;
    }
    return result;
  }

  private bufferFromArrByType(type: string, arr: any) {
    let result: any;
    switch (type) {
      case 'fileWrite':
      case 'fileRequest':
        let uint8arr2: any = new Uint8Array(2);
        let uint32arr: any = new Uint32Array(4);
        uint8arr2[0] = arr[0];
        uint8arr2[1] = arr[1];
        uint32arr[3] = arr[2];
        result = this.concatTypedArrays(uint8arr2, uint32arr);
        // alert('bufferFromArrByType result: ' + JSON.stringify(result, null, 2));
        break;
      case 'writeBuffer':
        let uint16arr: any = new Uint16Array(1);
        let uint32arr2: any = new Uint32Array(4);
        uint16arr[0] = arr[0];
        uint32arr2[0] = arr[1];
        uint32arr2[0] = arr[2];
        uint32arr2[0] = arr[3];
        uint32arr2[0] = arr[4];
        result = this.concatTypedArrays(uint16arr, uint32arr2);
        // alert('result: ' + JSON.stringify(result, null, 2));
        break;
      case 'fileWriteBuffer':
        result = new Uint8Array(arr);
        // let uint8x2arrBuffer: any = new Uint8Array(2);
        // let uint8x18arrBuffer: any = new Uint8Array(18);
        // uint8x2arrBuffer[0] = arr[0];
        // uint8x2arrBuffer[1] = arr[1];
        // for (let i = 2; i < arr.length; i++) {
        //   uint8x18arrBuffer[i-2] = arr[i];
        // }
        // result = this.concatTypedArrays(uint8x2arrBuffer, uint8x2arrBuffer);
        // alert('result: ' + JSON.stringify(result, null, 2));
        break;
      default:
        break;
    }
    return result;
  }

  private arrFromBufferByType(type: string, buffer: any) {
    // alert('startNotification arrFromBufferByType ' + type + ': ' + JSON.stringify(new Uint8Array(buffer)));
    let result: any;
    switch (type) {
      case 'fileRequest':
      case 'fileResponse':
        // result = new ArrayBuffer(20);
        result = {
          idx: new Uint8Array(buffer, 0, 2),
          data: new Uint8Array(buffer, 2, 18)
        };
        // alert('arrFromBufferByType fileRequest result: ' + JSON.stringify(result, null, 2));
        break;
      case 'fileWrite':
        // result = new ArrayBuffer(20);
        result = {
          data: new Uint8Array(buffer)
        };
        // alert('arrFromBufferByType fileWrite result: ' + JSON.stringify(result, null, 2));
        break;
      default:
        const bufferUint: any = new Uint8Array(buffer);
        // alert('arrFromBufferByType default bufferUint: ' + JSON.stringify(bufferUint, null, 2));
        if (buffer && buffer.length === 20) {
          result = {
            idx: new Uint8Array(buffer, 0, 2),
            data: new Uint8Array(buffer, 2, 18)
          };
        } else {
          result = {
            data: bufferUint
          };
        }
        break;
    }
    return result;
  }

  private concatTypedArrays(a: any, b: any) { // a, b TypedArray of same type
    let c = new (a.constructor)(a.length + b.length);
    c.set(a, 0);
    c.set(b, a.length);
    return c;
  }
}
