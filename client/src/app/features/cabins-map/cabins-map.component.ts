import { CabinDetailSidebarComponent } from "./cabin-detail-sidebar/cabin-detail-sidebar.component";
import { CabinService } from "../../services/cabin.service";
import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  ViewChild,
} from "@angular/core";
import { LeafletModule } from "@bluehalo/ngx-leaflet";
import "leaflet";
import "leaflet.markercluster";
import {
  Icon,
  LayerGroup,
  // Don't want conflicts with the vanilla JS Map type
  Map as LMap,
  MapOptions,
  Marker,
  control,
  latLng,
  tileLayer,
  MarkerClusterGroup,
  markerClusterGroup,
} from "leaflet";
import { Cabin, CabinType } from "../../types/cabin.type";
import { LeafletMarkerClusterModule } from "@bluehalo/ngx-leaflet-markercluster";
import { Subscription, forkJoin, tap } from "rxjs";
import { CabinsMapService } from "./cabins-map.service";
import { GlyphOptions, glyph } from "../../helpers/leaflet/Leaflet.Icon.Glyph";
import { CommonModule } from "@angular/common";
import { ActivatedRoute } from "@angular/router";
import { ModalService } from "../../ui-components/generic/modal/modal.service";
import { MapFiltersComponent } from "./map-filters/map-filters.component";

@Component({
  selector: "app-cabins-map",
  standalone: true,
  imports: [
    CommonModule,
    LeafletModule,
    LeafletMarkerClusterModule,
    CabinDetailSidebarComponent,
  ],
  template: `
    <app-cabin-detail-sidebar
      *ngIf="map"
      [cabin]="selectedCabin.data"
      [map]="map"
      [hidden]="detailHidden"
    ></app-cabin-detail-sidebar>
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
      <div
        class="absolute top-0 right-0 p-4"
        style="z-index: 500"
        (click)="openFilterModal()"
      >
        <button class="btn btn-primary">
          <i class="material-symbols-outlined">filter_alt</i>
        </button>
      </div>
    </div>
  `,
})
export class CabinsMapComponent implements OnDestroy {
  @ViewChild(CabinDetailSidebarComponent)
  cabinDetailSidebar!: CabinDetailSidebarComponent;

  get map() {
    return this.cabinsMapService.map;
  }

  // Marker cluster allows to avoid loading every marker at once,
  // optimizing performance.
  markerCluster?: MarkerClusterGroup;

  selectedCabin: { data: Cabin | null; marker: Marker | null } = {
    data: null,
    marker: null,
  };

  detailHidden?: boolean = true;

  cabins: Cabin[] = [];

  private initialZoom = 8;

  private get cabinZoom() {
    return this.cabinsMapService.cabinZoom;
  }

  private getMarkerIcon = (
    markerColor: GlyphOptions["markerColor"] = "blue"
  ): Icon =>
    glyph({
      className: "material-symbols-outlined material-symbols--filled",
      glyph: "radio_button_unchecked",
      glyphSize: "12px",
      glyphAnchor: [0, -6],
      markerColor: markerColor,
    });

  startingSpotsLayer: LayerGroup = new LayerGroup();

  options: MapOptions = {
    layers: [
      tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: "OpenStreetMap",
      }),
      this.startingSpotsLayer,
    ],
    zoomControl: false,
    zoom: this.initialZoom,
    // Lombardy center
    center: latLng(45.47606840909091, 9.146797684437137),
  };

  initialCabinData?: { cabin: Cabin; marker: Marker };

  initialCabinId?: string;

  private refreshSubscription?: Subscription;

  constructor(
    private cabinService: CabinService,
    private cabinsMapService: CabinsMapService,
    private changeDetector: ChangeDetectorRef,
    private modalService: ModalService,
    private route: ActivatedRoute
  ) {
    this.initialCabinId = this.route.snapshot.paramMap.get("id") ?? undefined;
    this.loadData();
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
  }

  onMapReady = (map: LMap) => {
    map.attributionControl.setPrefix("");
    this.cabinsMapService.map = map;
    control.zoom({ position: "bottomright" }).addTo(map);
    this.changeDetector.detectChanges();
  };

  // Close cabin detail when user clicks on the map.
  onMapClick = (event) => {
    this.unselectCabin();
  };

  openFilterModal = () => {
    this.modalService.openModal(MapFiltersComponent);
  };

  private loadData = () => {
    forkJoin([this.cabinsMapService.loadFavorites(), this.loadCabins()])
      .pipe(
        tap(() => {
          this.onLoad();
        })
      )
      .subscribe();
  };

  /**
   * Fires after all data has been loaded.
   */
  private onLoad = () => {
    // If a route param has been passed, pan to the cabin with that id.
    if (this.initialCabinData) {
      this.selectCabin(
        this.initialCabinData.cabin,
        this.initialCabinData.marker
      );
      const { latLng } = this.initialCabinData.cabin;
      if (latLng) {
        this.cabinsMapService.scrollToLatLng(
          latLng,
          this.cabinZoom,
          false,
          "middle"
        );
      }
    }

    this.refreshSubscription =
      this.cabinsMapService.refreshCabinsSubject.subscribe(() => {
        this.refreshCabins();
      });
  };

  private selectCabin = (cabin: Cabin, marker?: Marker) => {
    if (this.selectedCabin?.data === cabin) {
      return;
    }

    this.unselectCabin(false);

    if (marker) {
      this.selectedCabin.marker = marker;
      this.highlightMarker(marker);
    }

    this.detailHidden = false;
    this.selectedCabin.data = cabin;

    if (cabin?.startingSpots?.length ?? 0 > 0) {
      this.showCabinStartingSpots(cabin);
    }

    this.cabinsMapService.moveCupertinoDetailPane("middle");
  };

  private unselectCabin = (hideBar: boolean = true) => {
    this.detailHidden = hideBar;
    const { marker, data: cabin } = this.selectedCabin;
    this.selectedCabin = {
      data: null,
      marker: null,
    };
    this.resetStartingSpotsLayer();
    if (marker) {
      this.unhighlightMarker(marker, cabin ?? undefined);
    }
  };

  /**
   * Highlights the given marker. Useful for marker selection.
   * @param marker The marker to highlight
   */
  private highlightMarker = (marker: Marker) => {
    // We are removing the marker from the cluster group, so it will be visible even when
    // zooming out. On unselection, we'll add it back.
    marker.setIcon(this.getMarkerIcon("red"));
    this.markerCluster?.removeLayer(marker);
    marker.addTo(this.startingSpotsLayer);
    // Making sure the marker is on top of the starting spots markers.
    marker.setZIndexOffset(1000);
  };

  /**
   * Restores original highlighted marker conditions.
   * @param marker The marker to unhighlight
   */
  private unhighlightMarker = (marker: Marker, cabin?: Cabin) => {
    marker.setIcon(this.getMarkerIcon(this.getMarkerColor(cabin?.type)));
    marker.setZIndexOffset(0);
    this.markerCluster?.addLayer(marker);
  };

  private showCabinStartingSpots = (cabin: Cabin) => {
    for (const [key, spot] of (cabin?.startingSpots ?? []).entries()) {
      const latLng = spot.latLng;
      if (!latLng) {
        continue;
      }
      const marker = new Marker(latLng, {
        icon: glyph({
          className: "number-marker",
          glyph: "" + (key + 1),
          markerColor: "purple",
        }),
      }).addEventListener("click", () => {
        this.selectStartingSpot(key + 1);
        this.changeDetector.detectChanges();
      });
      marker.addTo(this.startingSpotsLayer);
    }
  };

  private resetStartingSpotsLayer = () => {
    if (!this.map) {
      return;
    }
    this.startingSpotsLayer.removeFrom(this.map);
    this.startingSpotsLayer = new LayerGroup();
    this.startingSpotsLayer.addTo(this.map);
  };

  private selectStartingSpot = (spotNumber: number) => {
    this.cabinsMapService.showSpotDetails(spotNumber);
  };

  private loadCabins = () =>
    this.cabinService.getCabins().pipe(
      tap((res) => {
        if (res.body?.status !== "success") {
          console.error("Unknown error");
          return;
        }
        this.cabins = res.body.data;
        this.refreshCabins(true);
      })
    );

  private refreshCabins = (firstLoad = false) => {
    const markerCluster = markerClusterGroup({ maxClusterRadius: 45 });
    const filteredCabins = this.cabins.filter((cabin) => {
      if (
        this.cabinsMapService.filters.onlyOpenCabins &&
        !["open", "out-of-lombardy"].includes(cabin.type ?? "")
      ) {
        return false;
      }
      return true;
    });
    for (const cabin of filteredCabins) {
      // No latLng data => no marker on the map
      if (!cabin?.latLng) {
        continue;
      }
      const marker = new Marker(cabin.latLng, {
        icon: this.getMarkerIcon(this.getMarkerColor(cabin.type)),
      }).addEventListener("click", () => {
        this.selectCabin(cabin, marker);
        this.changeDetector.detectChanges();
      });
      if (firstLoad && cabin._id === this.initialCabinId) {
        this.initialCabinData = { cabin, marker };
      }
      markerCluster?.addLayer(marker);
    }
    this.markerCluster = markerCluster;
  };

  private getMarkerColor = (
    cabinType?: CabinType
  ): GlyphOptions["markerColor"] =>
    ["managed", "require-keys"].includes(cabinType ?? "")
      ? "green"
      : ["private", "incomplete", "abandoned"].includes(cabinType ?? "")
      ? "purple"
      : "blue";
}
