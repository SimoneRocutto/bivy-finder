import { CommonModule } from "@angular/common";
import { TranslocoDirective, TranslocoService } from "@jsverse/transloco";
import { Component, inject } from "@angular/core";
import {
  DropdownBodyContentDirective,
  DropdownComponent,
} from "../../generic/dropdown/dropdown.component";
import { AuthService } from "../../../auth.service";
import { Router, RouterModule } from "@angular/router";
import { tap } from "rxjs";

@Component({
  selector: "app-navbar",
  standalone: true,
  imports: [
    CommonModule,
    TranslocoDirective,
    DropdownBodyContentDirective,
    DropdownComponent,
    RouterModule,
  ],
  template: `
    <ng-container *transloco="let t">
      <div class="navbar bg-base-100 grid grid-cols-3">
        <div>
          <div class="flex-none">
            <label
              for="my-drawer-3"
              aria-label="open sidebar"
              class="btn btn-square btn-ghost"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                class="inline-block w-6 h-6 stroke-current"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </label>
          </div>
        </div>
        <div class="flex flex-row justify-center">
          <a routerLink="/">
            <div>{{ t("app.name") }}</div>
          </a>
        </div>
        <div class="flex flex-row justify-end">
          <!-- languages dropdown -->
          <div class="dropdown dropdown-bottom dropdown-end">
            <div
              tabindex="0"
              role="button"
              class="btn m-1"
              [attr.aria-label]="t('common.languages') | titlecase"
              [attr.title]="t('common.languages') | titlecase"
            >
              <span class="material-icons"> language </span>
            </div>
            <ul
              tabindex="0"
              class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-36"
            >
              <li>
                <button
                  *ngFor="let lang of availableLanguages"
                  (click)="changeLanguage(lang)"
                  [ngClass]="{ 'font-bold': isActiveLanguage(lang) }"
                >
                  {{ lang | titlecase }}
                </button>
              </li>
            </ul>
          </div>
          <!-- user area dropdown -->
          <div class="dropdown dropdown-bottom dropdown-end">
            <div
              tabindex="0"
              role="button"
              class="btn m-1"
              [attr.aria-label]="t('navbar.user_area') | titlecase"
              [attr.title]="t('navbar.user_area') | titlecase"
            >
              <span class="material-icons"> account_circle </span>
            </div>
            <ul
              tabindex="0"
              class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-36"
            >
              <li *ngIf="userIsLogged">
                <div>{{ loggedUser.username }}</div>
              </li>
              <li *ngIf="userIsLogged">
                <button (click)="logout()">
                  {{ t("auth.logout") | titlecase }}
                </button>
              </li>
              <li *ngIf="!userIsLogged">
                <a routerLink="/login">
                  {{ t("auth.login") | titlecase }}
                </a>
              </li>
              <li *ngIf="!userIsLogged">
                <a routerLink="/sign-up">
                  {{ t("auth.sign_up") | titlecase }}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </ng-container>
  `,
  styles: ``,
})
export class NavbarComponent {
  get loggedUser() {
    return this.authService.loggedUser;
  }

  get userIsLogged() {
    return this.authService.userIsLogged;
  }

  constructor(private authService: AuthService, private router: Router) {}

  translocoService = inject(TranslocoService);

  loggedIn = false;

  availableLanguages: string[] = this.translocoService
    .getAvailableLangs()
    .map((lang) => lang);
  changeLanguage = (language: string) => {
    this.translocoService.setActiveLang(language);
    // If you want to close it after selection just uncomment this line:
    // (document.activeElement as HTMLElement)?.blur();
  };

  isActiveLanguage = (language: string): boolean =>
    language === this.translocoService.getActiveLang();

  logout = () => {
    this.authService
      .logout()
      .pipe(
        tap((res) => {
          if (res.body?.status === "success") {
            this.router.navigate(["/"]);
          }
        })
      )
      .subscribe();
  };

  checkAuth = () => {
    this.authService.checkAuth().subscribe((res) => {
      if (res.body?.status === "success") {
        this.loggedIn = res.body.data?.userAuthenticated;
      }
    });
  };
}
