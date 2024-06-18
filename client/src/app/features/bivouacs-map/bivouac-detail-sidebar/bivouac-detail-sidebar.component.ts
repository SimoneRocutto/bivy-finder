import { Component, Input } from "@angular/core";
import { Bivouac } from "../../../types/bivouac.type";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-bivouac-detail-sidebar",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      [ngClass]="!hidden && bivouac ? 'drawer-open' : ''"
      class="drawer z-10 absolute top-0 left-0 w-auto h-full"
    >
      <input id="detail-drawer" type="checkbox" class="drawer-toggle" />
      <div class="drawer-side h-full sticky">
        <div
          class="menu relative p-0 w-96 min-h-full bg-base-200 text-base-content"
        >
          <div class="w-full h-48">
            <img
              [src]="bivouac?.imageUrl"
              alt="Bivouac image"
              class="w-full h-full"
            />
          </div>
          <div class="p-4">
            <h3 class="text-lg font-semibold">{{ bivouac?.name }}</h3>
            <p>{{ bivouac?.description }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: ``,
})
export class BivouacDetailSidebarComponent {
  @Input() bivouac?: Bivouac;
  @Input() hidden?: boolean = true;
}
