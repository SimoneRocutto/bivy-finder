import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import { Cabin } from "../../../types/cabin.type";
import { CommonModule } from "@angular/common";
import { CabinsMapService } from "../cabins-map.service";
import { Map as LMap } from "leaflet";
import { CabinDetailComponent } from "../cabin-detail/cabin-detail.component";
import { ScreenService } from "../../../services/screen.service";

@Component({
  selector: "app-cabin-detail-sidebar",
  standalone: true,
  imports: [CommonModule, CabinDetailComponent],
  template: `
    @if (!isLargeScreen) {
    <div class="cupertino-pane">
      <app-cabin-detail [cabin]="cabin" [map]="map"></app-cabin-detail>
    </div>
    } @else {
    <div
      [ngClass]="!hidden && cabin ? 'drawer-open' : ''"
      class="drawer z-10 absolute top-0 left-0 w-auto h-full pointer-events-none"
      #cabinDetailSidebar
    >
      <input id="detail-drawer" type="checkbox" class="drawer-toggle" />
      <div class="drawer-side h-full sticky pointer-events-none">
        <div
          class="relative p-0 w-96 min-h-full bg-base-200 text-base-content"
          style="max-width: calc(100vw - 60px)"
        >
          <app-cabin-detail [cabin]="cabin" [map]="map"></app-cabin-detail>
        </div>
      </div>
    </div>
    }
  `,
  styles: ``,
})
export class CabinDetailSidebarComponent
  implements AfterViewInit, OnChanges, OnDestroy
{
  @ViewChild("cabinDetailSidebar")
  cabinDetailSidebar!: ElementRef<HTMLDivElement>;
  @Input() cabin?: Cabin | null;
  @Input() map?: LMap | null;
  @Input() hidden?: boolean = true;

  paneWillBeOpened = false;

  isLargeScreen: boolean = false;

  constructor(
    private cabinsMapService: CabinsMapService,
    private screenService: ScreenService
  ) {
    this.isLargeScreen = this.screenService.isLargeScreen();
  }

  ngAfterViewInit(): void {
    if (!this.isLargeScreen) {
      this.cabinsMapService.initCupertinoDetailPane();
      if (this.paneWillBeOpened) {
        this.showPane();
      }
    } else {
      this.cabinsMapService.cabinSidebarRef = this.cabinDetailSidebar;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    const hidden = changes.hidden;
    if (hidden?.currentValue === false) {
      this.showPane();
    } else if (hidden?.currentValue === true && !hidden?.firstChange) {
      this.destroyPane();
    }
  }

  ngOnDestroy(): void {
    this.destroyPane();
  }

  showPane = () => {
    if (this.cabinsMapService.detailCupertinoPane) {
      this.cabinsMapService.detailCupertinoPane.present({ animate: true });
    } else {
      // This is useful if ngAfterViewInit has not been fired yet
      this.paneWillBeOpened = true;
    }
  };

  destroyPane() {
    if (this.cabinsMapService.detailCupertinoPane?.isPanePresented()) {
      this.cabinsMapService.detailCupertinoPane.destroy({ animate: true });
    }
  }
}
