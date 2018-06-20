import { Component, OnInit } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AccountService, ApiService } from '../../services/';
import {
  ANGLE_IMG,
  DPW_LOGO_TRANSPARENT
} from '../../app/constants';
import { CreateAccountComponent, HomeMenu, SigninComponent } from '../';

@Component({
  selector: 'legals',
  templateUrl: `./legals.html`
})
export class LegalsComponent implements OnInit {

  public user: any = {};
  public legals: any = { terms: false, privacy: false, eula: false };
  public logoTransparent: string = DPW_LOGO_TRANSPARENT;
  public angleImg: string = ANGLE_IMG;
  public pdfPageRendered: boolean = false;
  public formValid: boolean = false;
  public loading: boolean = false;
  public isEula: boolean = false;
  public pdfSrc: any = '';
  public titles: any = {
    eula: 'End User Licence Agreement',
    termsAndPrivacy: 'Terms Of Use & Privacy Policy'
  };

  public options: any = {
    autoresize: true,
    fitToPage: true,
    originalSize: true,
    page: 1,
    renderText: false
  };

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public _account: AccountService,
    public _api: ApiService
  ) {}

  public ngOnInit() {
    console.log('navParams: ', this.navParams.get('isEula'));
    this.isEula = this.navParams.get('isEula');
    this.fetchAgreement();
  }

  public ionViewDidLoad() {
    const acc: any = this.navParams.get('account');
    if (acc) {
      this.user = acc;
    }
  }

  public fetchAgreement() {
    this.loading = true;
    this._account.getAgreementLink().subscribe(
      (resp: any) => {
        this.pdfSrc = resp;
        this.loading = false;
      },
      (err: any) => {
        this.loading = false;
      }
    );
  }

  public goBack() {
    this.openPage(SigninComponent);
  }

  public pageRendered() {
    this.pdfPageRendered = true;
    setTimeout(() => {
      const eulaStartPage: number = 6;
      this.options.page = this.isEula ? eulaStartPage : 1;
      console.log('this.options: ', this.options);
    }, 400);
  }

  public next() {
    if (!this.isEula && this.legals.terms && this.legals.privacy) {
      this.openPage(CreateAccountComponent);
    } else if (this.isEula && this.legals.eula) {
      this._account.agreeAgreement().subscribe(
        () => { this.openPage(HomeMenu); },
        (err: any) => { alert(JSON.stringify(err)); }
      );
    }
  }

  public openPage(page) {
    this.navCtrl.push(page, { account: this.user });
  }
}
