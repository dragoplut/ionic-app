import { Component, OnInit, NgZone, ViewChild } from '@angular/core';
import { App, AlertController, NavController, NavParams, Nav, Content } from 'ionic-angular';
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
  @ViewChild(Nav) public nav: Nav;
  @ViewChild(Content) public legalsContent: Content;

  public user: any = {};
  public legals: any = { terms: false, privacy: false, eula: false };
  public shouldAgree: string[] = [];
  public shouldAgreeItems: any[] = [];
  public logoTransparent: string = DPW_LOGO_TRANSPARENT;
  public angleImg: string = ANGLE_IMG;
  public formValid: boolean = false;
  public loading: boolean = false;
  public isEula: boolean = false;
  public createAccount: boolean = false;
  public isAllAgreed: boolean = false;
  public pdfSrc: any = '';
  public pdfPageRendered: boolean = false;

  public options: any = {
    autoresize: true,
    fitToPage: true,
    originalSize: true,
    page: 1,
    renderText: false
  };

  constructor(
    public appCtrl: App,
    public alertCtrl: AlertController,
    public navCtrl: NavController,
    public navParams: NavParams,
    public _account: AccountService,
    public _api: ApiService,
    private zone: NgZone
  ) {}

  public ngOnInit() {
    this.isEula = this.navParams.get('isEula');
    this.shouldAgree = this.navParams.get('shouldAgree') || [];
    this.shouldAgreeItems = this.navParams.get('shouldAgreeItems') || [];
    this.createAccount = this.navParams.get('createAccount');
    if (this.createAccount) {
      this.getNextAgreement(this.shouldAgree[0]);
    } else if (!this.shouldAgreeItems.length) {
      this.checkAgreements();
    }
  }

  public ionViewDidLoad() {
    const acc: any = this.navParams.get('account');
    if (acc) {
      this.user = acc;
    }
  }

  public checkAgreements() {
    this._account.checkAgreements(
      (data: any) => {
        if (data && data.shouldAgree) {
          this.getNextAgreement(data.shouldAgree[0])
        }
      }
    );
  }

  public getNextAgreement(agreementName: string) {
    if (this.shouldAgree && this.shouldAgree.length) {
      this._account.getNextLinks(
        [agreementName],
        (result: any) => {
          this.zone.run(() => {
            this.shouldAgreeItems = result;
            setTimeout(() => {
              const message: string = `Please read, scroll down, and agree to ${result[0].title}`;
              this.agreementReadPrompt(message);
              this.legalsContent.scrollToTop();
            }, 300);
          });
        }
      );
    }
  }

  public goBack() {
    if (this.shouldAgree && this.shouldAgree.length === 1 && this.shouldAgree[0] === 'eula') {
      this.openPage(SigninComponent);
    } else {
      this.navCtrl.pop();
    }
  }

  public pageRendered() {
    this.pdfPageRendered = true;
  }

  public checkIsAllAgreed(items: any) {
    let allAgreed: boolean = true;
    this.shouldAgreeItems.forEach((item: any) => {
      if (!items[item.propName]) {
        allAgreed = false;
      }
    });
    this.isAllAgreed = allAgreed;
  }

  public next() {
    if (this.createAccount && this.isAllAgreed) {
      if (this.shouldAgree && this.shouldAgree.length && this.shouldAgree.length === 1) {
        this.openPage(CreateAccountComponent);
      } else if (this.shouldAgree && this.shouldAgree.length > 1) {
        this.shouldAgree.shift();
        this.isAllAgreed = false;
        this.getNextAgreement(this.shouldAgree[0]);
      }
    } else if (this.isAllAgreed) {
      const toAgree: string[] = this.shouldAgreeItems.reduce((items, a) => {
        items.push(a.propName);
        return items;
      }, []);
      this._account.agreeNextAgreements(toAgree, () => {
        setTimeout(() => {
          this.openPage(HomeMenu);
        }, 200);
      });
    }
  }

  public openPage(page: any, params?: any) {
    this.navCtrl.push(page, params ? params : {});
  }

  /**
   * Prompt user to read, scroll and agree to agreements.
   * @param {string} text
   */
  public agreementReadPrompt(text: string) {
    let alert: any = this.alertCtrl.create({
      message: text,
      buttons: [ { text: 'Ok', role: 'cancel' } ]
    });
    alert.present();
  }
}
