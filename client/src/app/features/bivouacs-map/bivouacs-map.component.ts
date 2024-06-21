import { BivouacDetailSidebarComponent } from "./bivouac-detail-sidebar/bivouac-detail-sidebar.component";
import { BivouacService } from "../../bivouac.service";
import { ChangeDetectorRef, Component } from "@angular/core";
import { LeafletModule } from "@bluehalo/ngx-leaflet";
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
  MarkerClusterGroup,
  markerClusterGroup,
} from "leaflet";
import { Bivouac } from "../../types/bivouac.type";
import { LeafletMarkerClusterModule } from "@bluehalo/ngx-leaflet-markercluster";

@Component({
  selector: "app-bivouacs-map",
  standalone: true,
  imports: [
    LeafletModule,
    LeafletMarkerClusterModule,
    BivouacDetailSidebarComponent,
  ],
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
    >
      @if (markerCluster) {
      <div [leafletLayer]="markerCluster"></div>
      }
    </div>
  `,
})
export class BivouacsMapComponent {
  map?: LMap;

  // Marker cluster allows to avoid loading every marker at once,
  // optimizing performance.
  markerCluster?: MarkerClusterGroup;

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
    private bivouacService: BivouacService,
    private changeDetector: ChangeDetectorRef
  ) {
    this.loadData();
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

  private loadData = () => {
    this.bivouacService.getBivouacs().subscribe((bivouacs) => {
      if (bivouacs.status !== "success") {
        console.error("Unknown error");
        return;
      }
      this.bivouacs = bivouacs.data;
      const markerCluster = markerClusterGroup({ maxClusterRadius: 45 });
      for (const bivouac of this.bivouacs) {
        // No latLng data => no marker on the map
        if (!bivouac?.latLng) {
          continue;
        }
        const marker = new Marker(bivouac.latLng, {
          icon: this.markerIcon,
        }).addEventListener("click", () => {
          this.selectBivouac(bivouac);
          this.changeDetector.detectChanges();
        });
        markerCluster?.addLayer(marker);
      }
      this.markerCluster = markerCluster;
    });
  };
}
