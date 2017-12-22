// import { async, ComponentFixture, TestBed } from '@angular/core/testing';
// import { By } from '@angular/platform-browser';
// import { DebugElement } from '@angular/core';
// import { HomeMenu } from './home-menu';
// import { IonicModule, Platform, NavController} from 'ionic-angular/index';
// import { StatusBar } from '@ionic-native/status-bar';
// import { SplashScreen } from '@ionic-native/splash-screen';
// import { PlatformMock, StatusBarMock, SplashScreenMock } from '../../../test-config/mocks-ionic';
// import { AuthService } from '../../services';
//
// describe('Home Menu', () => {
//   let de: DebugElement;
//   let comp: HomeMenu;
//   let fixture: ComponentFixture<HomeMenu>;
//
//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//       declarations: [HomeMenu],
//       imports: [
//         IonicModule.forRoot(HomeMenu)
//       ],
//       providers: [
//         AuthService,
//         NavController,
//         { provide: Platform, useClass: PlatformMock},
//         { provide: StatusBar, useClass: StatusBarMock },
//         { provide: SplashScreen, useClass: SplashScreenMock },
//       ]
//     });
//   }));
//
//   beforeEach(() => {
//     fixture = TestBed.createComponent(HomeMenu);
//     comp = fixture.componentInstance;
//     de = fixture.debugElement.query(By.css('h3'));
//   });
//
//   it('should create component', () => expect(comp).toBeDefined());
//
// });
