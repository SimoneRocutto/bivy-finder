import { Component, inject } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { EmployeesListComponent } from "./features/employees/employees-list/employees-list.component";
import {
  AvailableLangs,
  TranslocoDirective,
  TranslocoService,
} from "@jsverse/transloco";
import { CommonModule } from "@angular/common";
import {
  DropdownBodyContentDirective,
  DropdownComponent,
} from "./ui-components/dropdown/dropdown.component";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    EmployeesListComponent,
    TranslocoDirective,
    DropdownBodyContentDirective,
    DropdownComponent,
  ],
  styles: [
    `
      main {
        display: flex;
        justify-content: center;
        padding: 2rem 4rem;
      }
    `,
  ],
  template: `
    <ng-container *transloco="let t">
      <div class="flex flex-row justify-between">
        <div>{{ t("app.name") }}</div>
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
      </div>
    </ng-container>
    <main>
      <router-outlet />
    </main>
  `,
})
export class AppComponent {
  translocoService = inject(TranslocoService);
  availableLanguages: string[] = this.translocoService
    .getAvailableLangs()
    .map((lang) => lang);
  changeLanguage = (language: string) => {
    this.translocoService.setActiveLang(language);
  };

  isActiveLanguage = (language: string): boolean =>
    language === this.translocoService.getActiveLang();
}
