import {
  GoogleMap,
} from '@ionic-native/google-maps';
import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import {
  AuthService,
  ApiService,
  ClinicService,
  GoogleService,
  PermissionService,
  UtilService
} from '../../services/index';
import {
  ANGLE_IMG,
  DEFAULT_ERROR_MESSAGE,
  DPW_LOGO_TRANSPARENT,
  EMAIL_REGEXP,
  PAGES_LIST
} from '../../app/constants';
import { T_LOCATION_PARAMS } from '../../app/types';
import { CreateAccountAddressComponent, SigninComponent, HomeMenu } from '../index';
import {Nav, NavController, NavParams, Platform} from 'ionic-angular';
// noinspection TypeScriptCheckImport
import * as _ from 'lodash';

declare let google: any;

@Component({
  selector: 'create-account-clinic',
  templateUrl: `./create-account-clinic.html`
})
export class CreateAccountClinicComponent implements OnInit {
  @ViewChild(Nav) nav: Nav;
  @ViewChild('map2') mapElement: ElementRef;

  public map: GoogleMap;
  public markers: any[] = [];
  public lat:any;
  public lang:any;

  public countryNamesArr: any[] = ['United States','Ukraine'];
  public stateNamesArr: any[] = ['California'];
  public cityNamesArr: any[] = [];

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
    public _google: GoogleService,
    public _permission: PermissionService,
    public _util: UtilService
  ) {}

  public ionViewDidLoad() {
    this.account = this.navParams.get('account');
    if (!this.account.clinic) {
      this.account.clinic = { location: {} };
    }
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      this.showMap({});
    });
    this.onChangeValidate('update');
  }

  public ngOnInit() {
    this._api.setHeaders({});
  }

  public showMap(acc: any) {
    let mapOptions = {
      center: new google.maps.LatLng(
        acc && acc.location && acc.location.latitude ?
          acc.location.latitude : 43.0741904,
        acc && acc.location && acc.location.longitude ?
          acc.location.longitude : -89.3809802),
      zoom: 12,
      minZoom: 3,
      maxZoom: 17,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      panControl: false,
      fullscreenControl: false,
      mapTypeControl: false,
      streetViewControl: false,
      clickableIcons: false
    };
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

    this.markers[0] = new google.maps.Marker({
      position: new google.maps.LatLng(
        acc && acc.location && acc.location.latitude ?
          acc.location.latitude : 43.0741904,
        acc && acc.location && acc.location.longitude ?
          acc.location.longitude : -89.3809802),
      map: this.map,
      animation: 'DROP',
      title: acc && acc.location ? acc.location.address : 'Marker'
    });
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

  public onChangeValidate(target?: string) {
    /** Clear child items if parent changed **/
    switch (target) {
      case 'country':
        this.account.clinic.location.state = '';
        this.account.clinic.location.city = '';
        this.stateNamesArr = [];
        this.cityNamesArr = [];
        break;
      case 'state':
        this.account.clinic.location.city = '';
        this.cityNamesArr = [];
        break;
      default:
        break;
    }

    if (target && target !== 'city') {
      /** Prepare location params before request update **/
      const params: T_LOCATION_PARAMS = {
        countryName: this.account.clinic.location.country || '',
        stateName: this.account.clinic.location.state || '',
      };
      this.updateLocationParams(params);
    }

    if (target && target !== 'update') {
      const searchAddress: string =
        this.account.clinic.location.country + ' ' +
        this.account.clinic.location.state + ' ' +
        this.account.clinic.location.city;
      this.predictLatLng(searchAddress);
    }

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
          this.countryNamesArr.push(el.long_name);
          this.countryNamesArr = _.uniq(this.countryNamesArr);
          this.account.clinic.location.country = el.long_name;
          break;
        case 'administrative_area_level_1':
          this.stateNamesArr.push(el.long_name);
          this.stateNamesArr = _.uniq(this.stateNamesArr);
          this.account.clinic.location.state = el.long_name;
          break;
        case 'locality':
          this.cityNamesArr.push(el.long_name);
          this.cityNamesArr = _.uniq(this.cityNamesArr);
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
      // this.centerMap(address);
      this.onChangeValidate('update');
      this.showMap(this.account.clinic);
    });
    // alert(JSON.stringify(address));
  }

  public goBack() {
    this.openPage(CreateAccountAddressComponent);
  }

  public next() {
    const valid: boolean = this.account &&
        this.account.clinic &&
        this.account.clinic.name &&
        this.account.clinic.location &&
        this.account.clinic.location.country;
    if (valid) {
      this.account.clinic.phoneNumber = '+0';
      this.account.clinic.contactPerson = this.account.firstName + ' ' + this.account.lastName;
      this.account.clinic.webSiteUrl = '';
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

  /**
   * Request "Countries/States/Cities" by params
   * update "address" drop-downs with received items
   * @param {T_LOCATION_PARAMS} params
   * @param callback
   */
  public updateLocationParams(params: T_LOCATION_PARAMS, callback?: any) {
    this.loading = true;
    this._util.getLocation(params).subscribe(
      (resp: any) => {
        this.loading = false;
        /** TODO: change "counties" to "countries" after API fix typo **/
        if (resp && resp.counties && resp.counties.length) {
          this.countryNamesArr = resp.counties.map((item: any) => item.name);
          this.stateNamesArr = resp.states.map((item: any) => item.name);
          this.cityNamesArr = resp.cities.map((item: any) => item.name);
        }
        if (callback) { callback(); }
      },
      (err: any) => {
        this.loading = false;
        if (callback) { callback(); }
        alert(JSON.stringify(err));
      }
    );
  }

  public predictLatLng(input: string) {
    if (input && input.length) {
      this._google.predictAddress(input).subscribe(
        (item: any) => {
          this._google.predictLatLng(item).subscribe(
            (resp: any) => {
              if (resp && resp.lat) {
                this.account.clinic.location.latitude = resp.lat;
                this.account.clinic.location.longitude = resp.lng;
                if (resp.postal_code && resp.postal_code.length) {
                  this.account.clinic.location.zip = resp.postal_code;
                }
                this.showMap(this.account.clinic);
              }
            },
            (err: any) => console.log(err)
          );
        },
        (err: any) => console.log(err)
      );
    }
  }

  public openPage(page) {
    this.navCtrl.push(page, { account: this.account });
  }
}
