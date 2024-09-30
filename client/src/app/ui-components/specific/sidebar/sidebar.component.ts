import { CommonModule } from "@angular/common";
import { Component, ElementRef, ViewChild } from "@angular/core";
import { RouterModule } from "@angular/router";
import { AuthService } from "../../../services/auth.service";

@Component({
  selector: "app-sidebar",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="drawer drawer-auto-gutter">
      <input
        #drawerCheckbox
        id="my-drawer-3"
        type="checkbox"
        class="drawer-toggle"
      />
      <div class="drawer-content min-h-dvh flex flex-col">
        <!-- Main website content is projected in here -->
        <ng-content></ng-content>
      </div>
      <div class="drawer-side z-20">
        <label
          for="my-drawer-3"
          aria-label="close sidebar"
          class="drawer-overlay"
        ></label>
        <ul class="menu p-4 w-80 min-h-full bg-base-200">
          <!-- Sidebar list -->
          <ng-container *ngFor="let item of menuItems">
            <li *ngIf="!item.role || item.role === userRole">
              <a [routerLink]="[item.url]" (click)="closeSidebar()">{{
                item.title
              }}</a>
            </li>
          </ng-container>
        </ul>
      </div>
    </div>
  `,
  styles: ``,
})
export class SidebarComponent {
  @ViewChild("drawerCheckbox") drawerCheckbox?: ElementRef<HTMLElement>;
  menuItems: { title: string; url: string; role?: string }[] = [
    { title: "Map", url: "/cabins-map" },
    { title: "Cabins List", url: "/cabins-list" },
  ];

  constructor(private authService: AuthService) {}

  get userRole() {
    return this.authService.loggedUser?.role;
  }

  closeSidebar = () => {
    if (this.drawerCheckbox?.nativeElement) {
      (this.drawerCheckbox.nativeElement as HTMLInputElement).checked = false;
    }
  };
}
