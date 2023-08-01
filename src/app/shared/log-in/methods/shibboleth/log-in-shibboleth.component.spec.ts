import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { provideMockStore } from '@ngrx/store/testing';
import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { authReducer } from '../../../../core/auth/auth.reducer';
import { AuthService } from '../../../../core/auth/auth.service';
import { AuthServiceStub } from '../../../testing/auth-service.stub';
import { storeModuleConfig } from '../../../../app.reducer';
import { AuthMethod } from '../../../../core/auth/models/auth.method';
import { AuthMethodType } from '../../../../core/auth/models/auth.method-type';
import { LogInShibbolethComponent } from './log-in-shibboleth.component';
import { NativeWindowService } from '../../../../core/services/window.service';
import { RouterStub } from '../../../testing/router.stub';
import { ActivatedRouteStub } from '../../../testing/active-router.stub';
import { NativeWindowMockFactory } from '../../../mocks/mock-native-window-ref';
import { HardRedirectService } from '../../../../core/services/hard-redirect.service';


describe('LogInShibbolethComponent', () => {

  let component: LogInShibbolethComponent;
  let fixture: ComponentFixture<LogInShibbolethComponent>;
  let componentAsAny: any;
  let setHrefSpy;
  let shibbolethBaseUrl: string;
  let location: string;
  let initialState: any;
  let hardRedirectService: HardRedirectService;

  beforeEach(() => {
    shibbolethBaseUrl = 'dspace-rest.test/shibboleth?redirectUrl=';
    location = shibbolethBaseUrl + 'http://dspace-angular.test/home';

    hardRedirectService = jasmine.createSpyObj('hardRedirectService', {
      getCurrentRoute: {},
      redirect: {}
    });

    initialState = {
      core: {
        auth: {
          authenticated: false,
          loaded: false,
          blocking: false,
          loading: false,
          authMethods: []
        }
      }
    };
  });

  beforeEach(waitForAsync(() => {
    // refine the test module by declaring the test component
    void TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({ auth: authReducer }, storeModuleConfig),
        TranslateModule.forRoot()
      ],
      declarations: [
        LogInShibbolethComponent
      ],
      providers: [
        { provide: AuthService, useClass: AuthServiceStub },
        { provide: 'authMethodProvider', useValue: new AuthMethod(AuthMethodType.Shibboleth, 0, location) },
        { provide: 'isStandalonePage', useValue: true },
        { provide: NativeWindowService, useFactory: NativeWindowMockFactory },
        { provide: Router, useValue: new RouterStub() },
        { provide: ActivatedRoute, useValue: new ActivatedRouteStub() },
        { provide: HardRedirectService, useValue: hardRedirectService },
        provideMockStore({ initialState }),
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ]
    })
      .compileComponents();

  }));

  beforeEach(() => {
    // create component and test fixture
    fixture = TestBed.createComponent(LogInShibbolethComponent);

    // get test component from the fixture
    component = fixture.componentInstance;
    componentAsAny = component;

    // create page
    setHrefSpy = spyOnProperty(componentAsAny._window.nativeWindow.location, 'href', 'set').and.callThrough();

  });

  it('should set the properly a new redirectUrl', () => {
    const currentUrl = 'http://dspace-angular.test/collections/12345';
    componentAsAny._window.nativeWindow.location.href = currentUrl;

    fixture.detectChanges();

    expect(componentAsAny.injectedAuthMethodModel.location).toBe(location);
    expect(componentAsAny._window.nativeWindow.location.href).toBe(currentUrl);

    component.redirectToShibboleth();

    expect(setHrefSpy).toHaveBeenCalledWith(currentUrl);

  });

  it('should not set a new redirectUrl', () => {
    const currentUrl = 'http://dspace-angular.test/home';
    componentAsAny._window.nativeWindow.location.href = currentUrl;

    fixture.detectChanges();

    expect(componentAsAny.injectedAuthMethodModel.location).toBe(location);
    expect(componentAsAny._window.nativeWindow.location.href).toBe(currentUrl);

    component.redirectToShibboleth();

    expect(setHrefSpy).toHaveBeenCalledWith(currentUrl);

  });

});
