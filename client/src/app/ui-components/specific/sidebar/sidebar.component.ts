import { CommonModule } from "@angular/common";
import { Component, ElementRef, ViewChild } from "@angular/core";
import { RouterModule } from "@angular/router";

@Component({
  selector: "app-sidebar",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="drawer">
      <input
        #drawerCheckbox
        id="my-drawer-3"
        type="checkbox"
        class="drawer-toggle"
      />
      <div class="drawer-content min-h-screen flex flex-col">
        <!-- Main website content is projected in here -->
        <ng-content></ng-content>
      </div>
      <div class="drawer-side">
        <label
          for="my-drawer-3"
          aria-label="close sidebar"
          class="drawer-overlay"
        ></label>
        <ul class="menu p-4 w-80 min-h-full bg-base-200">
          <!-- Sidebar list -->
          <li *ngFor="let item of menuItems">
            <a [routerLink]="[item.url]" (click)="closeSidebar()">{{
              item.title
            }}</a>
          </li>
        </ul>
      </div>
    </div>
  `,
  styles: ``,
})
export class SidebarComponent {
  @ViewChild("drawerCheckbox") drawerCheckbox?: ElementRef<HTMLElement>;
  menuItems: { title: string; url: string }[] = [
    { title: "Home", url: "/" },
    { title: "Map", url: "/bivouacs-map" },
    { title: "Employees", url: "/employees" },
    { title: "Add employee", url: "/new-employee" },
  ];

  closeSidebar = () => {
    if (this.drawerCheckbox?.nativeElement) {
      (this.drawerCheckbox.nativeElement as HTMLInputElement).checked = false;
    }
  };
}
