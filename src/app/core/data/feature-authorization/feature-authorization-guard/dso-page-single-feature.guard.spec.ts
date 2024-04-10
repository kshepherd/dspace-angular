import {
  ActivatedRouteSnapshot,
  ResolveFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import {
  Observable,
  of as observableOf,
} from 'rxjs';

import { createSuccessfulRemoteDataObject$ } from '../../../../shared/remote-data.utils';
import { AuthService } from '../../../auth/auth.service';
import { DSpaceObject } from '../../../shared/dspace-object.model';
import { Item } from '../../../shared/item.model';
import { RemoteData } from '../../remote-data';
import { AuthorizationDataService } from '../authorization-data.service';
import { FeatureID } from '../feature-id';
import { DsoPageSingleFeatureGuard } from './dso-page-single-feature.guard';

const object = {
  self: 'test-selflink',
} as DSpaceObject;

const testResolver: ResolveFn<RemoteData<any>> = () => createSuccessfulRemoteDataObject$(object);

/**
 * Test implementation of abstract class DsoPageSingleFeatureGuard
 */
class DsoPageSingleFeatureGuardImpl extends DsoPageSingleFeatureGuard<any> {

  protected resolver: ResolveFn<RemoteData<Item>> = testResolver;

  constructor(protected authorizationService: AuthorizationDataService,
              protected router: Router,
              protected authService: AuthService,
              protected featureID: FeatureID) {
    super(authorizationService, router, authService);
  }

  getFeatureID(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<FeatureID> {
    return observableOf(this.featureID);
  }
}

describe('DsoPageSingleFeatureGuard', () => {
  let guard: DsoPageSingleFeatureGuard<any>;
  let authorizationService: AuthorizationDataService;
  let router: Router;
  let authService: AuthService;
  let route;
  let parentRoute;

  function init() {
    authorizationService = jasmine.createSpyObj('authorizationService', {
      isAuthorized: observableOf(true),
    });
    router = jasmine.createSpyObj('router', {
      parseUrl: {},
    });
    authService = jasmine.createSpyObj('authService', {
      isAuthenticated: observableOf(true),
    });
    parentRoute = {
      params: {
        id: '3e1a5327-dabb-41ff-af93-e6cab9d032f0',
      },
    };
    route = {
      params: {
      },
      parent: parentRoute,
    };
    guard = new DsoPageSingleFeatureGuardImpl(authorizationService, router, authService, undefined);
  }

  beforeEach(() => {
    init();
  });

  describe('getObjectUrl', () => {
    it('should return the resolved object\'s selflink', (done) => {
      guard.getObjectUrl(route, undefined).subscribe((selflink) => {
        expect(selflink).toEqual(object.self);
        done();
      });
    });
  });

  describe('getRouteWithDSOId', () => {
    it('should return the route that has the UUID of the DSO', () => {
      const foundRoute = (guard as any).getRouteWithDSOId(route);
      expect(foundRoute).toBe(parentRoute);
    });
  });
});
