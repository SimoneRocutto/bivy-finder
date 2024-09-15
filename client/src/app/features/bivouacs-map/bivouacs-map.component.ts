import { BivouacDetailSidebarComponent } from "./bivouac-detail-sidebar/bivouac-detail-sidebar.component";
import { BivouacService } from "../../services/bivouac.service";
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
import { Bivouac, BivouacType } from "../../types/bivouac.type";
import { LeafletMarkerClusterModule } from "@bluehalo/ngx-leaflet-markercluster";
import { Subscription, forkJoin, tap } from "rxjs";
import { BivouacsMapService } from "./bivouacs-map.service";
import { GlyphOptions, glyph } from "../../helpers/leaflet/Leaflet.Icon.Glyph";
import { CommonModule } from "@angular/common";
import { ActivatedRoute } from "@angular/router";
import { ModalService } from "../../ui-components/generic/modal/modal.service";
import { MapFiltersComponent } from "./map-filters/map-filters.component";

@Component({
  selector: "app-bivouacs-map",
  standalone: true,
  imports: [
    CommonModule,
    LeafletModule,
    LeafletMarkerClusterModule,
    BivouacDetailSidebarComponent,
  ],
  template: `
    <app-bivouac-detail-sidebar
      *ngIf="map"
      [bivouac]="selectedBivouac.data"
      [map]="map"
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
export class BivouacsMapComponent implements OnDestroy {
  @ViewChild(BivouacDetailSidebarComponent)
  bivouacDetailSidebar!: BivouacDetailSidebarComponent;

  get map() {
    return this.bivouacsMapService.map;
  }

  // Marker cluster allows to avoid loading every marker at once,
  // optimizing performance.
  markerCluster?: MarkerClusterGroup;

  selectedBivouac: { data: Bivouac | null; marker: Marker | null } = {
    data: null,
    marker: null,
  };

  detailHidden?: boolean = true;

  bivouacs: Bivouac[] = [];

  private initialZoom = 8;

  private get bivouacZoom() {
    return this.bivouacsMapService.bivouacZoom;
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

  initialBivouacData?: { bivouac: Bivouac; marker: Marker };

  initialBivouacId?: string;

  private refreshSubscription?: Subscription;

  constructor(
    private bivouacService: BivouacService,
    private bivouacsMapService: BivouacsMapService,
    private changeDetector: ChangeDetectorRef,
    private modalService: ModalService,
    private route: ActivatedRoute
  ) {
    this.initialBivouacId = this.route.snapshot.paramMap.get("id") ?? undefined;
    this.loadData();
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
  }

  onMapReady = (map: LMap) => {
    map.attributionControl.setPrefix("");
    this.bivouacsMapService.map = map;
    control.zoom({ position: "bottomright" }).addTo(map);
    this.changeDetector.detectChanges();
  };

  // Close bivouac detail when user clicks on the map.
  onMapClick = (event) => {
    this.unselectBivouac();
  };

  openFilterModal = () => {
    this.modalService.openModal(MapFiltersComponent);
  };

  private loadData = () => {
    forkJoin([this.bivouacsMapService.loadFavorites(), this.loadBivouacs()])
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
    // If a route param has been passed, pan to the bivouac with that id.
    if (this.initialBivouacData) {
      this.selectBivouac(
        this.initialBivouacData.bivouac,
        this.initialBivouacData.marker
      );
      const { latLng } = this.initialBivouacData.bivouac;
      if (latLng) {
        this.bivouacsMapService.scrollToLatLng(latLng, this.bivouacZoom, false);
      }
    }

    this.refreshSubscription =
      this.bivouacsMapService.refreshBivouacsSubject.subscribe(() => {
        this.refreshBivouacs();
      });
  };

  private selectBivouac = (bivouac: Bivouac, marker?: Marker) => {
    if (this.selectedBivouac?.data === bivouac) {
      return;
    }

    this.unselectBivouac(false);

    if (marker) {
      this.selectedBivouac.marker = marker;
      this.highlightMarker(marker);
    }

    this.detailHidden = false;
    this.selectedBivouac.data = bivouac;

    if (bivouac?.startingSpots?.length ?? 0 > 0) {
      this.showBivouacStartingSpots(bivouac);
    }
  };

  private unselectBivouac = (hideBar: boolean = true) => {
    this.detailHidden = hideBar;
    const { marker, data: bivouac } = this.selectedBivouac;
    this.selectedBivouac = {
      data: null,
      marker: null,
    };
    this.resetStartingSpotsLayer();
    if (marker) {
      this.unhighlightMarker(marker, bivouac ?? undefined);
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
  private unhighlightMarker = (marker: Marker, bivouac?: Bivouac) => {
    marker.setIcon(this.getMarkerIcon(this.getMarkerColor(bivouac?.type)));
    marker.setZIndexOffset(0);
    this.markerCluster?.addLayer(marker);
  };

  private showBivouacStartingSpots = (bivouac: Bivouac) => {
    for (const [key, spot] of (bivouac?.startingSpots ?? []).entries()) {
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
    this.bivouacDetailSidebar?.showSpotDetails(spotNumber);
    return;
  };

  private loadBivouacs = () =>
    this.bivouacService.getBivouacs().pipe(
      tap((res) => {
        if (res.body?.status !== "success") {
          console.error("Unknown error");
          return;
        }
        this.bivouacs = res.body.data;
        this.refreshBivouacs(true);
      })
    );

  private refreshBivouacs = (firstLoad = false) => {
    const markerCluster = markerClusterGroup({ maxClusterRadius: 45 });
    const filteredBivouacs = this.bivouacs.filter((bivouac) => {
      if (
        this.bivouacsMapService.filters.onlyOpenBivouacs &&
        !["open", "out-of-lombardy"].includes(bivouac.type ?? "")
      ) {
        return false;
      }
      return true;
    });
    for (const bivouac of filteredBivouacs) {
      // No latLng data => no marker on the map
      if (!bivouac?.latLng) {
        continue;
      }
      const marker = new Marker(bivouac.latLng, {
        icon: this.getMarkerIcon(this.getMarkerColor(bivouac.type)),
      }).addEventListener("click", () => {
        this.selectBivouac(bivouac, marker);
        this.changeDetector.detectChanges();
      });
      if (firstLoad && bivouac._id === this.initialBivouacId) {
        this.initialBivouacData = { bivouac, marker };
      }
      markerCluster?.addLayer(marker);
    }
    this.markerCluster = markerCluster;
  };

  private getMarkerColor = (
    bivouacType?: BivouacType
  ): GlyphOptions["markerColor"] =>
    ["managed", "require-keys"].includes(bivouacType ?? "")
      ? "green"
      : ["private", "incomplete", "abandoned"].includes(bivouacType ?? "")
      ? "purple"
      : "blue";
}
