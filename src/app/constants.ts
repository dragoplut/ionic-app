// tslint:disable-next-line
export const EMAIL_REGEXP: any = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const GOOGLE_MAP_API_URL: string = 'http://maps.google.com/maps/api/js';
export const GOOGLE_API_KEY_ANDROID: string = 'AIzaSyDJYtcVzKXghryIDmQaTBDp5gWYPbTBqfU';
export const GOOGLE_API_KEY_IOS: string = 'AIzaSyCgHpBF5TgClZPji7fl8LRfE98TnPoTWUY';

// 10000 === 10 seconds
// for this.snackBar.open(... ,... , { duration: DURATION_ERROR_SNACKBAR })
export const DURATION_ERROR: number = 10000;
export const DURATION_NOTIFICATION: number = 5000;

export const CHECK: string = 'cmVnZW5AQ2xvdWQhOTE=';

// 30000 === 30 seconds
// for setInterval(... , JWT_CHECK_TIMEOUT)
export const JWT_CHECK_TIMEOUT: number = 30000;

export const TABLE_UPDATE_TIMEOUT: number = 300000; // 300000 === 300 sec. === 5 min.

export const DEFAULT_ERROR_MESSAGE: string = 'Some error occurs.';
export const DEFAULT_SUCCESS_MESSAGE: string = 'Changes saved.';

export const DPW_LOGO_TRANSPARENT: string = 'assets/img/dermapenworld_logo_transparent.png';
export const DPW_PEN_CARD: string = 'assets/img/img_my_pen.png';
export const DPW_CLINIC_CARD: string = 'assets/img/img_my_clinic.png';
export const DEVICE_PANEL_IMG: string = 'assets/img/img_device_panel.png';
export const ANGLE_IMG: string = 'assets/img/angle_icon.png';
export const USER_PROFILE_IMG: string = 'assets/img/user_profile.png';

export const PAGES_LIST = [
  {
    listTitle: 'Users',
    routerLink: ['', 'users'],
    permissionRef: 'user',
    mdIcon: 'group'
  },
  {
    listTitle: 'Firmware',
    routerLink: ['', 'firmware'],
    permissionRef: 'firmware',
    mdIcon: 'none'
  },
  {
    listTitle: 'Reporting',
    routerLink: ['', 'reporting'],
    permissionRef: 'reporting',
    mdIcon: 'none'
  },
  {
    listTitle: 'Distribution',
    routerLink: ['', 'distribution'],
    permissionRef: 'distribution',
    mdIcon: 'none'
  },
  {
    listTitle: 'Whitelist',
    routerLink: ['', 'whitelist'],
    permissionRef: 'whitelist',
    mdIcon: 'none'
  },
  {
    listTitle: 'Returns',
    routerLink: ['', 'returns'],
    permissionRef: 'returns',
    mdIcon: 'none'
  },
  {
    listTitle: 'Customers',
    routerLink: ['', 'customers'],
    permissionRef: 'customers',
    mdIcon: 'none'
  },
];

export const GENDERS = [
  {value: 'male', viewValue: 'Male'},
  {value: 'female', viewValue: 'Female'},
  {value: 'org', viewValue: 'Organization'}
];

export const USER_PROFILE_NEW = {
  id: 'new',
  firstName: '',
  lastName: '',
  description: '',
  password: '',
  picture: '',
  email: '',
  dob: '',
  role: 'user',
  status: 'enabled'
};

export const USER_ROLES = [
  {value: 'admin', viewValue: 'Administrator'},
  {value: 'super', viewValue: 'Super Admin'},
  {value: 'user', viewValue: 'User'}
];

export const USER_CREATE_ROLES = [
  {value: 'admin', viewValue: 'Administrator'},
  {value: 'equipmed', viewValue: 'Equipmed'},
  {value: 'manufacturer', viewValue: 'Manufacturer'},
  {value: 'distributor', viewValue: 'Distributor'}
];

export const USER_STATUSES = [
  {value: 'disabled', viewValue: 'Disabled'},
  {value: 'enabled', viewValue: 'Enabled'}
];

export const USERS_SEARCH_PARAMS = [
  {value: 'firstName', viewValue: 'First name'},
  {value: 'lastName', viewValue: 'Last name'},
  {value: 'email', viewValue: 'Email'},
  {value: 'role', viewValue: 'Role'},
  {value: 'status', viewValue: 'Status'}
];

export const MENU_YES_NO_BOOL = [
  {value: true, viewValue: 'YES'},
  {value: false, viewValue: 'NO'}
];

export const APP_USER = 'app_user';
export const REFRESH_TOKEN = 'refreshToken';
export const JWT_KEY = 'jwtToken';

export const US_CITY_NAMES = [
  "Aberdeen",
  "Abilene",
  "Akron",
  "Albany",
  "Albuquerque",
  "Alexandria",
  "Allentown",
  "Amarillo",
  "Anaheim",
  "Anchorage",
  "Ann Arbor",
  "Antioch",
  "Apple Valley",
  "Appleton",
  "Arlington",
  "Arvada",
  "Asheville",
  "Athens",
  "Atlanta",
  "Atlantic City",
  "Augusta",
  "Aurora",
  "Austin"
];

