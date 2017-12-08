import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  GoogleMapOptions,
  LatLng,
  MarkerOptions
} from '@ionic-native/google-maps';
import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { ApiService, ClinicService, PermissionService } from '../../services/index';
import {
  DEFAULT_ERROR_MESSAGE,
  DPW_LOGO_TRANSPARENT,
  EMAIL_REGEXP,
  US_CITY_NAMES
} from '../../app/constants';
import { MyClinicComponent, RegisterClinicContactsComponent } from '../index';
import { Nav, NavController, NavParams } from 'ionic-angular';
// noinspection TypeScriptCheckImport
import * as _ from 'lodash';

@Component({
  selector: 'register-clinic-address',
  templateUrl: `./register-clinic-address.html`
})
export class RegisterClinicAddressComponent implements OnInit {
  @ViewChild(Nav) nav: Nav;
  @ViewChild('map') mapElement: ElementRef;

  public map: GoogleMap;
  public lat:any;
  public lang:any;

  public usCityNames: any[] = US_CITY_NAMES;
  public countriesList: any[] = ['United States','Ukraine'];
  public statesList: any[] = ['California'];

  public account: any = { location: {} };
  public logoTransparent: string = DPW_LOGO_TRANSPARENT;
  public loading: boolean = false;
  public errorMessage: any = '';
  public dependencies: any = {};

  public emailRegExp: any = EMAIL_REGEXP;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public _api: ApiService,
    public _clinic: ClinicService,
    public _permission: PermissionService
  ) {}

  public ionViewDidLoad() {
    this.dependencies = this.navParams.get('dependencies') || {};
    const acc: any = this.navParams.get('account');
    this.account = acc ? acc : {};
    if (!this.account) {
      this.account = { location: {} };
    } else if (!this.account.location) {
      this.account.location = {};
    }
    this.loadMap();
    console.log('this.dependencies: ', this.dependencies);
  }

  public loadMap() {

    let mapOptions: GoogleMapOptions = {
      controls: {
        compass: true,
        myLocationButton: false,
        indoorPicker: true,
        zoom: false
      },
      gestures: {
        scroll: true,
        tilt: true,
        rotate: true,
        zoom: true
      },
      camera: {
        target: {
          lat: 43.0741904,
          lng: -89.3809802
        },
        tilt: 30,
        zoom: 10,
        bearing: 50
      }
    };
    this.map = GoogleMaps.create(this.mapElement.nativeElement, mapOptions);
    this.map.one(GoogleMapsEvent.MAP_READY)
      .then(() => {
        this.map.addMarker({
            title: 'Ionic',
            icon: 'blue',
            animation: 'DROP',
            position: {
              lat: 43.0741904,
              lng: -89.3809802
            }
          })
          .then(marker => {
            marker.on(GoogleMapsEvent.MARKER_CLICK)
              .subscribe(() => {

              });
          });

      });
  }

  public centerMap(item: any) {

    // create LatLng object
    let ionic: LatLng = new LatLng(item.geometry.location.lat,item.geometry.location.lng);

    // create CameraPosition
    let position: any = {
      target: ionic,
      zoom: 18,
      tilt: 30
    };

    // create new marker
    let markerOptions: MarkerOptions = {
      position: ionic,
      icon: 'red',
      animation: 'DROP',
      title: item.name
    };

    this.map.one(GoogleMapsEvent.MAP_READY)
      .then(() => {
          // Now you can add elements to the map like the marker
          this.map.animateCamera(position);
          this.map.addMarker(markerOptions);
        }
      );
  }

  public detail(address: any) {
    address.address_components.forEach((el: any) => {
      switch (el.types[0]) {
        case 'country':
          this.countriesList.push(el.long_name);
          this.countriesList = _.uniq(this.countriesList);
          this.account.location.country = el.long_name;
          break;
        case 'administrative_area_level_1':
          this.statesList.push(el.long_name);
          this.statesList = _.uniq(this.statesList);
          this.account.location.state = el.short_name;
          break;
        case 'locality':
          this.usCityNames.push(el.long_name);
          this.usCityNames = _.uniq(this.usCityNames);
          this.account.location.city = el.short_name;
          break;
        case 'postal_code':
          this.account.location.zip = el.long_name;
          break;
        case 'street_number':
        case 'route':
          this.account.location.address = this.account.location.address ?
            this.account.location.address + el.long_name + ' ' :
            el.long_name + ' ';
          break;
      }
    });
    this.account.location.latitude = address.geometry.location.lat;
    this.account.location.longtitude = address.geometry.location.lng;
    this.centerMap(address);
    alert(JSON.stringify(address));
  }

  public ngOnInit() {
    this._api.setHeaders({});
  }

  public showErrorMessage(message?: string) {
    this.errorMessage = message ? message : DEFAULT_ERROR_MESSAGE;
  }

  public clearError() {
    this.errorMessage = '';
  }

  public back() {
    this.openPage(MyClinicComponent);
  }

  public next() {
    console.log('nex: ', this.account);
    this.openPage(RegisterClinicContactsComponent);
  }

  public openPage(page) {
    this.navCtrl.push(page, { account: this.account, dependencies: this.dependencies });
  }
}
