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
import { MyClinicComponent } from '../index';
import { Nav, NavController, NavParams } from 'ionic-angular';
// noinspection TypeScriptCheckImport
import * as _ from 'lodash';

@Component({
  selector: 'edit-clinic',
  templateUrl: `./edit-clinic.html`
})
export class EditClinicComponent implements OnInit {
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

  public emailRegExp: any = EMAIL_REGEXP;

  public createAccInputs: any = [
    { modelName: 'phoneNumber', placeholder: 'Phone Number', type: 'text', required: false },
    { modelName: 'contactPerson', placeholder: 'Contact Person', type: 'text', required: false },
    { modelName: 'webSiteUrl', placeholder: 'Website URL', type: 'text', required: false }
  ];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public _api: ApiService,
    public _clinic: ClinicService,
    public _permission: PermissionService
  ) {}

  public ionViewDidLoad() {
    const clinicData: any = this.navParams.get('clinic');
    this.account = clinicData ? clinicData : {};
    if (!this.account) {
      this.account = { location: {} };
    } else if (!this.account.location) {
      this.account.location = {};
    }
    this.getClinic(this.account.id);
    this.loadMap();
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
      }
    });
    this.centerMap(address);
    // alert(JSON.stringify(address));
  }

  public validate(clinic: any) {
    return clinic &&
        clinic.name &&
        clinic.location;
  }

  public ngOnInit() {
    this._api.setHeaders({});
  }

  public getClinic(id: number | string) {
    this._clinic.getClinicById(id).subscribe(
      (resp: any) => {
        this.updateSelectOptions(resp.location);
        this.account = resp;
      },
      (err: any) => {
        console.log('err: ', err);
      }
    );
  }

  public updateSelectOptions(location: any) {
    console.log('1 updateSelectOptions location, this.countriesList', location, this.countriesList);
    if (location && location.country) {
      // usCityNames, countriesList, statesList
      this.countriesList.push(location.country);
      this.countriesList = _.uniq(this.countriesList);
      this.statesList.push(location.state);
      this.statesList = _.uniq(this.statesList);
      this.usCityNames.push(location.city);
      this.usCityNames = _.uniq(this.usCityNames);
    }
    console.log('2 updateSelectOptions location, this.countriesList', location, this.countriesList);
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

  public save() {
    const valid: boolean = this.validate(this.account);
    if (valid) {
      this._clinic.updateClinic(this.account).subscribe(
        (resp: any) => {
          this.openPage(MyClinicComponent);
        },
        (err: any) => {
          console.log('err: ', err);
        }
      );
    }
  }

  public openPage(page) {
    this.navCtrl.push(page, { account: this.account });
  }
}
