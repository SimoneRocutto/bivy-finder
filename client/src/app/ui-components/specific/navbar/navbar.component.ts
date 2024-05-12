import { CommonModule } from "@angular/common";
import { TranslocoDirective, TranslocoService } from "@jsverse/transloco";
import { Component, inject } from "@angular/core";
import {
  DropdownBodyContentDirective,
  DropdownComponent,
} from "../../generic/dropdown/dropdown.component";
import { AuthService } from "../../../auth.service";

@Component({
  selector: "app-navbar",
  standalone: true,
  imports: [
    CommonModule,
    TranslocoDirective,
    DropdownBodyContentDirective,
    DropdownComponent,
  ],
  template: `
    <ng-container *transloco="let t">
      <div class="flex flex-row justify-between bg-blue-300">
        <div>{{ t("app.name") }}</div>
        <div class="flex flex-row">
          <ui-dropdown>
            <button
              head
              [attr.aria-label]="t('common.languages') | titlecase"
              [attr.title]="t('common.languages') | titlecase"
            >
              <span class="material-icons"> language </span>
            </button>
            <ng-template body>
              <button
                *ngFor="let lang of availableLanguages"
                (click)="changeLanguage(lang)"
                [ngClass]="{ 'font-bold': isActiveLanguage(lang) }"
              >
                {{ lang | titlecase }}
              </button>
            </ng-template>
          </ui-dropdown>
          <ui-dropdown>
            <button
              head
              [attr.aria-label]="t('navbar.user_area') | titlecase"
              [attr.title]="t('navbar.user_area') | titlecase"
            >
              <span class="material-icons"> account_circle </span>
            </button>
            <ng-template body>
              <button (click)="logout()">
                {{ t("navbar.logout") | titlecase }}
              </button>
            </ng-template>
          </ui-dropdown>
        </div>
      </div>
    </ng-container>
  `,
  styles: ``,
})
export class NavbarComponent {
  constructor(private authService: AuthService) {}
  translocoService = inject(TranslocoService);
  availableLanguages: string[] = this.translocoService
    .getAvailableLangs()
    .map((lang) => lang);
  changeLanguage = (language: string) => {
    this.translocoService.setActiveLang(language);
  };

  isActiveLanguage = (language: string): boolean =>
    language === this.translocoService.getActiveLang();

  logout = () => {
    this.authService.logout().subscribe();
  };
}
