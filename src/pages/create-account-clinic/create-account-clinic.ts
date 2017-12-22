import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  GoogleMapOptions,
  LatLng,
  MarkerOptions
} from '@ionic-native/google-maps';
import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import {
  AuthService,
  ApiService,
  ClinicService,
  PermissionService
} from '../../services/index';
import {
  ANGLE_IMG,
  DEFAULT_ERROR_MESSAGE,
  DPW_LOGO_TRANSPARENT,
  EMAIL_REGEXP,
  PAGES_LIST,
  US_CITY_NAMES
} from '../../app/constants';
import { CreateAccountAddressComponent, SigninComponent, HomeMenu } from '../index';
import {Nav, NavController, NavParams, Platform} from 'ionic-angular';
// noinspection TypeScriptCheckImport
import * as _ from 'lodash';

@Component({
  selector: 'create-account-clinic',
  templateUrl: `./create-account-clinic.html`
})
export class CreateAccountClinicComponent implements OnInit {
  @ViewChild(Nav) nav: Nav;
  @ViewChild('map') mapElement: ElementRef;

  public map: GoogleMap;
  public lat:any;
  public lang:any;

  public usCityNames: any[] = US_CITY_NAMES;
  public countriesList: any[] = ['United States','Ukraine'];
  public statesList: any[] = ['California'];

  public account: any = { clinic: { location: {} } };
  public user: any = { email: '', password: '' };
  public logoTransparent: string = DPW_LOGO_TRANSPARENT;
  public loading: boolean = false;
  public formValid: boolean = false;
  public errorMessage: any = '';
  public PAGES_LIST: any = PAGES_LIST;
  public angleImg: string = ANGLE_IMG;

  public emailRegExp: any = EMAIL_REGEXP;

  public createAccInputs: any = [
    { modelName: 'firstName', placeholder: 'First Name', type: 'text', required: false },
    { modelName: 'lastName', placeholder: 'Last Name', type: 'text', required: false },
    { modelName: 'companyName', placeholder: 'Company Name', type: 'text', required: false },
    { modelName: 'email', placeholder: 'Email', type: 'email', required: true },
    { modelName: 'password', placeholder: 'Password', type: 'password', required: true },
    { modelName: 'confirmPassword', placeholder: 'Confirm Password', type: 'password', required: true },
    { modelName: 'phoneNumber', placeholder: 'Phone Number', type: 'text', required: false }
  ];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public platform: Platform,
    public _api: ApiService,
    public _auth: AuthService,
    public _clinic: ClinicService,
    public _permission: PermissionService
  ) {}

  public ionViewDidLoad() {
    this.account = this.navParams.get('account');
    if (!this.account.clinic) {
      this.account.clinic = { location: {} };
    }
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      this.loadMap();
    });
    this.onChangeValidate();
  }

  public ngOnInit() {
    this._api.setHeaders({});
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

    //this.map.one(GoogleMapsEvent.MAP_READY)
    //  .then(() => {
    //    this.map.animateCamera({
    //      target: item.geometry.location,
    //      zoom: 15
    //    });
    //    this.map.addMarker({
    //        title: item.name,
    //        icon: 'red',
    //        animation: 'DROP',
    //        position: {
    //          lat: item.geometry.location.lat,
    //          lng: item.geometry.location.lng
    //        }
    //      })
    //      .then(marker => {
    //        marker.on(GoogleMapsEvent.MARKER_CLICK)
    //          .subscribe(() => {
    //
    //          });
    //      });
    //
    //  });
  }

  public showErrorMessage(message?: string) {
    this.errorMessage = message ? message : DEFAULT_ERROR_MESSAGE;
  }

  public goToReset() {
    console.log('goToReset');
  }

  public clearError() {
    this.errorMessage = '';
  }

  public onChangeValidate() {
    let isValid = true;
    if (!this.account.location ||
      !this.account.clinic.name ||
      !this.account.clinic.location.address ||
      !this.account.clinic.location.address.length ||
      !this.account.clinic.location.country ||
      !this.account.clinic.location.country.length ||
      !this.account.clinic.location.state ||
      !this.account.clinic.location.state.length ||
      !this.account.clinic.location.zip ||
      !this.account.clinic.location.zip.length ||
      !this.account.clinic.location.city ||
      !this.account.clinic.location.city.length) {
      isValid = false;
    }
    this.formValid = isValid;
  }

  public handleSuccess(resp: any) {
    this.loading = false;
    if (this._permission.isAllowedAction('view', 'signin')) {
      for (const page of this.PAGES_LIST) {
        if (this._permission.isAllowedAction('view', page.permissionRef)) {
          this.openPage(SigninComponent);
          break;
        }
      }
    } else {
      // this._auth.signOut();
      const message: string = 'You are not allowed to sign in!';
      this.showErrorMessage(message);
    }
    return resp;
  }

  public authenticate() {
    this.loading = true;
    this._auth.authenticate(this.user)
      .subscribe(
        (resp: any) => this.handleSuccess(resp),
        (err: any) => this.handleErr(err)
      );
  }

  public detail(address: any) {
    if (!this.account.clinic) {
      this.account.clinic = { location: {} };
    } else if (!this.account.clinic.location) {
      this.account.clinic.location = {};
    }
    let street: string = '';
    let route: string = '';
    address.address_components.forEach((el: any) => {
      switch (el.types[0]) {
        case 'country':
          this.countriesList.push(el.long_name);
          this.countriesList = _.uniq(this.countriesList);
          this.account.clinic.location.country = el.long_name;
          break;
        case 'administrative_area_level_1':
          this.statesList.push(el.long_name);
          this.statesList = _.uniq(this.statesList);
          this.account.clinic.location.state = el.short_name;
          break;
        case 'locality':
          this.usCityNames.push(el.long_name);
          this.usCityNames = _.uniq(this.usCityNames);
          this.account.clinic.location.city = el.short_name;
          break;
        case 'postal_code':
          this.account.clinic.location.zip = el.long_name;
          break;
        case 'street_number':
          street = el.long_name;
          break;
        case 'route':
          route = el.long_name;
          break;
      }
    });
    if (street || route) {
      this.account.clinic.location.address = (street + ' ' + route).trim();
    }
    if (address.geometry && address.geometry.location && address.geometry.location.lat) {
      this.account.clinic.location.latitude = address.geometry.location.lat;
      this.account.clinic.location.longitude = address.geometry.location.lng;
    }
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      this.centerMap(address);
    });
    this.onChangeValidate();
    // alert(JSON.stringify(address));
  }

  public back() {
    this.openPage(CreateAccountAddressComponent);
  }

  public next() {
    const valid: boolean = this.account &&
        this.account.clinic &&
        this.account.clinic.name &&
        this.account.clinic.location &&
        this.account.clinic.location.country;
    if (valid) {
      this.account.clinic.phoneNumber = '+0000000';
      this.account.clinic.contactPerson = this.account.firstName + ' ' + this.account.lastName;
      this.account.clinic.webSiteUrl = 'https://';
      this.account.clinic.finderPageEnabled = false;
      this.loading = true;
      this._clinic.createClinic(this.account.clinic).subscribe(
        (resp: any) => {
          this.loading = false;
          console.log('nex: ', this.account.clinic);
          // alert('Clinic created!');
          this.openPage(HomeMenu);
        },
        (err: any) => {
          this.handleErr(err);
        }
      );
    }
  }

  public handleErr(err: any) {
    this.loading = false;
    this.formValid = false;
    const message = err && err._body ?
      JSON.parse(err._body) : { error: { message: DEFAULT_ERROR_MESSAGE } };
    alert(message.error.message);
    return err && err._body ? JSON.parse(err._body) : message;
  }

  public openPage(page) {
    this.navCtrl.push(page, { account: this.account });
  }
}
