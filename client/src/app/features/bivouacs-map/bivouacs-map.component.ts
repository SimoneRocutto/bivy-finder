import { BivouacDetailSidebarComponent } from "./bivouac-detail-sidebar/bivouac-detail-sidebar.component";
import { DataService } from "../../data.service";
import { ChangeDetectorRef, Component } from "@angular/core";
import { LeafletModule } from "@asymmetrik/ngx-leaflet";
import {
  Icon,
  LayerGroup,
  // Don't want conflicts with the vanilla JS Map type
  Map as LMap,
  MapOptions,
  Marker,
  control,
  icon,
  latLng,
  tileLayer,
} from "leaflet";
import { Bivouac } from "../../types/bivouac.type";

@Component({
  selector: "app-bivouacs-map",
  standalone: true,
  imports: [LeafletModule, BivouacDetailSidebarComponent],
  template: `
    <app-bivouac-detail-sidebar
      [bivouac]="selectedBivouac"
      [hidden]="detailHidden"
    ></app-bivouac-detail-sidebar>
    <div
      style="height: 100%; width: 100vw"
      class="z-0"
      leaflet
      [leafletOptions]="options"
      (leafletMapReady)="onMapReady($event)"
      (leafletClick)="onMapClick($event)"
    ></div>
  `,
})
export class BivouacsMapComponent {
  map?: LMap;

  selectedBivouac?: Bivouac;

  detailHidden?: boolean = true;

  bivouacs: Bivouac[] = [];

  markerIcon: Icon = icon({
    iconSize: [25, 41],
    iconAnchor: [13, 41],
    iconUrl: "leaflet/marker-icon.png",
    shadowUrl: "leaflet/marker-shadow.png",
  });

  markersLayer: LayerGroup = new LayerGroup();

  options: MapOptions = {
    layers: [
      tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: "...",
      }),
      this.markersLayer,
    ],
    zoom: 8,
    zoomControl: false,
    // Lombardy center
    center: latLng(45.47606840909091, 9.146797684437137),
  };

  constructor(
    private dataService: DataService,
    private changeDetector: ChangeDetectorRef
  ) {
    this.dataService.getData().subscribe((bivouacs) => {
      this.bivouacs = bivouacs;
      for (const bivouac of this.bivouacs) {
        new Marker(bivouac.latLng, { icon: this.markerIcon })
          .addEventListener("click", () => {
            this.selectBivouac(bivouac);
            this.changeDetector.detectChanges();
          })
          .addTo(this.markersLayer);
      }
    });
  }

  onMapReady = (map: LMap) => {
    this.map = map;
    control.zoom({ position: "bottomright" }).addTo(this.map);
  };

  // Close bivouac detail when user clicks on the map.
  onMapClick = (event) => {
    this.detailHidden = true;
  };

  private selectBivouac = (bivouac: Bivouac) => {
    this.detailHidden = false;
    this.selectedBivouac = bivouac;
  };
}
