import {
  AsyncPipe,
  NgFor,
  NgIf,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import {
  select,
  Store,
} from '@ngrx/store';
import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
} from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';
import { AuthMethod } from '../../core/auth/models/auth.method';
import {
  getAuthenticationError,
  getAuthenticationMethods,
  isAuthenticated,
  isAuthenticationLoading,
} from '../../core/auth/selectors';
import { CoreState } from '../../core/core-state.model';
import { hasValue, isEmpty } from '../empty.util';
import { ThemedLoadingComponent } from '../loading/themed-loading.component';
import { LogInContainerComponent } from './container/log-in-container.component';
import { rendersAuthMethodType } from './methods/log-in.methods-decorator';
import { AuthMethodType } from 'src/app/core/auth/models/auth.method-type';

@Component({
  selector: 'ds-base-log-in',
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgIf, ThemedLoadingComponent, NgFor, LogInContainerComponent, AsyncPipe],
})
export class LogInComponent implements OnInit {

  /**
   * A boolean representing if LogInComponent is in a standalone page
   * @type {boolean}
   */
  @Input() isStandalonePage: boolean;

  /**
   * A list of allowed AuthMethodType
   *  names representich which methods to display
   *  (for example, the nav bar may like to just
   *  show Shib, ORCID while the standalone login
   *  page could have plain password auth)
   */
  @Input() allowedAuthMethods: AuthMethodType[];

  /**
   * The list of authentication methods available
   * @type {AuthMethod[]}
   */
  public authMethods: Observable<AuthMethod[]>;

  /**
   * Whether user is authenticated.
   * @type {Observable<string>}
   */
  public isAuthenticated: Observable<boolean>;

  /**
   * True if the authentication is loading.
   * @type {boolean}
   */
  public loading: Observable<boolean>;

  constructor(private store: Store<CoreState>,
              private authService: AuthService,
  ) {
  }

  ngOnInit(): void {
  /*
    this.authMethods = combineLatest([
      this.store.pipe(select(getAuthenticationMethods)),
      this.allowedAuthMethods$,
    ]).pipe(
      map(([methods, allowedAuthMethods]) => methods
        .filter(authMethod => isEmpty(allowedAuthMethods) || allowedAuthMethods.includes(authMethod.authMethodType))
        .filter(authMethod => rendersAuthMethodType(authMethod.authMethodType) !== undefined)
        .sort((method1, method2) => method1.position - method2.position),
       ),
    );
    */

    this.authMethods = this.store.pipe(
      select(getAuthenticationMethods),
      map((methods: AuthMethod[]) => methods
        // Allow specified methods, or all if list is empty
        .filter((authMethod: AuthMethod) => (
          isEmpty(this.allowedAuthMethods) || this.allowedAuthMethods.includes(authMethod.authMethodType)))
        .filter((authMethod: AuthMethod) => rendersAuthMethodType(authMethod.authMethodType) !== undefined)
        .sort((method1: AuthMethod, method2: AuthMethod) => method1.position - method2.position),
      ),
    );
    console.dir(this.authMethods);
    console.dir(this.allowedAuthMethods);
    // set loading
    this.loading = this.store.pipe(select(isAuthenticationLoading));

    // set isAuthenticated
    this.isAuthenticated = this.store.pipe(select(isAuthenticated));

    // Clear the redirect URL if an authentication error occurs and this is not a standalone page
    this.store.pipe(select(getAuthenticationError)).subscribe((error) => {
      if (hasValue(error) && !this.isStandalonePage) {
        this.authService.clearRedirectUrl();
      }
    });
  }

}
