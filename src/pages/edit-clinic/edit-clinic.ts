import {
  GoogleMap,
} from '@ionic-native/google-maps';
import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { ApiService, ClinicService, GoogleService, PermissionService, UtilService } from '../../services/index';
import {
  DEFAULT_ERROR_MESSAGE,
  DPW_LOGO_TRANSPARENT,
  EMAIL_REGEXP
} from '../../app/constants';
import { T_LOCATION_PARAMS } from '../../app/types';
import { MyClinicComponent } from '../index';
import {Nav, NavController, NavParams, Platform} from 'ionic-angular';
// noinspection TypeScriptCheckImport
// import * as _ from 'lodash';

declare let google: any;

@Component({
  selector: 'edit-clinic',
  templateUrl: `./edit-clinic.html`
})
export class EditClinicComponent implements OnInit {
  @ViewChild(Nav) nav: Nav;
  @ViewChild('map1') mapElement: ElementRef;

  public map: GoogleMap;
  public markers: any[] = [];
  public lat:any;
  public lang:any;

  public countryNamesArr: any[] = [];
  public stateNamesArr: any[] = [];
  public cityNamesArr: any[] = [];

  public account: any = { location: {} };
  public logoTransparent: string = DPW_LOGO_TRANSPARENT;
  public loading: boolean = false;
  public formValid: boolean = false;
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
    public platform: Platform,
    public _api: ApiService,
    public _clinic: ClinicService,
    public _google: GoogleService,
    public _permission: PermissionService,
    public _util: UtilService
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

  public detail(address: any) {
    let street: string = '';
    let route: string = '';
    address.address_components.forEach((el: any) => {
      switch (el.types[0]) {
        case 'country':
          // this.countryNamesArr.push(el.long_name);
          // this.countryNamesArr = _.uniq(this.countryNamesArr);
          this.account.location.country = el.long_name;
          break;
        case 'administrative_area_level_1':
          // this.stateNamesArr.push(el.long_name);
          // this.stateNamesArr = _.uniq(this.stateNamesArr);
          this.account.location.state = el.long_name;
          break;
        case 'locality':
          // this.cityNamesArr.push(el.long_name);
          // this.cityNamesArr = _.uniq(this.cityNamesArr);
          this.account.location.city = el.short_name;
          break;
        case 'postal_code':
          this.account.location.zip = el.long_name;
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
      this.account.location.address = (street + ' ' + route).trim();
    }
    if (address.geometry && address.geometry.location && address.geometry.location.lat) {
      this.account.location.latitude = address.geometry.location.lat;
      this.account.location.longitude = address.geometry.location.lng;
    }
    // this.centerMap(address);
    this.onChangeValidate('update');
    // this.loadMap(this.account);
    this.showMap(this.account);
  }

  public validate(clinic: any) {
    return clinic &&
        clinic.name &&
        clinic.location;
  }

  public onChangeValidate(target?: string) {
    /** Clear child items if parent changed **/
    switch (target) {
      case 'country':
        this.account.location.state = '';
        this.account.location.city = '';
        this.stateNamesArr = [];
        this.cityNamesArr = [];
        break;
      case 'state':
        this.account.location.city = '';
        this.cityNamesArr = [];
        break;
      default:
        break;
    }

    if (target && target !== 'city') {
      /** Prepare location params before request update **/
      const params: T_LOCATION_PARAMS = {
        countryName: this.account.location.country || '',
        stateName: this.account.location.state || '',
      };
      this.updateLocationParams(params);
    }

    if (target && target !== 'update') {
      const searchAddress: string =
        this.account.location.country + ' ' +
        this.account.location.state + ' ' +
        this.account.location.city;
      this.predictLatLng(searchAddress);
    }

    let isValid = true;
    if (!this.account.location ||
      !this.account.name ||
      !this.account.phoneNumber ||
      !this.account.contactPerson ||
      !this.account.location.address ||
      !this.account.location.address.length ||
      !this.account.location.country ||
      !this.account.location.country.length ||
      !this.account.location.state ||
      !this.account.location.state.length ||
      !this.account.location.zip ||
      !this.account.location.zip.length ||
      !this.account.location.city ||
      !this.account.location.city.length) {
      isValid = false;
    }
    this.formValid = isValid;
  }

  public ngOnInit() {
    this._api.setHeaders({});
  }

  public getClinic(id: number | string) {
    this._clinic.getClinicById(id).subscribe(
      (resp: any) => {
        // this.updateSelectOptions(resp.location);
        this.account = resp;
        this.platform.ready().then(() => {
          // Okay, so the platform is ready and our plugins are available.
          // this.loadMap(this.account);
          this.onChangeValidate('update');
          this.showMap(this.account);
        });
      },
      (err: any) => {
        console.log('err: ', err);
      }
    );
  }

  // public updateSelectOptions(location: any) {
  //   if (location && location.country) {
  //     // cityNamesArr, countryNamesArr, stateNamesArr
  //     // this.countryNamesArr.push(location.country);
  //     // this.countryNamesArr = _.uniq(this.countryNamesArr);
  //     // this.stateNamesArr.push(location.state);
  //     // this.stateNamesArr = _.uniq(this.stateNamesArr);
  //     // this.cityNamesArr.push(location.city);
  //     // this.cityNamesArr = _.uniq(this.cityNamesArr);
  //   }
  // }

  public showErrorMessage(message?: string) {
    this.errorMessage = message ? message : DEFAULT_ERROR_MESSAGE;
  }

  public clearError() {
    this.errorMessage = '';
  }

  public goBack() {
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

  // /**
  //  * Request initial countries list for drop-downs
  //  * execute callback if provided
  //  * @param callback
  //  */
  // public initDropDowns(callback?: any) {
  //   /** Get initial/default location items **/
  //   const params: T_LOCATION_PARAMS = {
  //     countryName: '',
  //     stateName: ''
  //   };
  //   this.updateLocationParams(params, callback);
  // }

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
                this.account.location.latitude = resp.lat;
                this.account.location.longitude = resp.lng;
                if (resp.postal_code && resp.postal_code.length) {
                  this.account.location.zip = resp.postal_code;
                }
                this.showMap(this.account);
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
