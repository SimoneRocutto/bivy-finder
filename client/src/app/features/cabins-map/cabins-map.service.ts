import { ElementRef, Injectable, QueryList } from "@angular/core";
import { AuthService } from "../../services/auth.service";
import { UserService } from "../../services/user.service";
import { Subject, of, tap } from "rxjs";
import { CabinService } from "../../services/cabin.service";
import { LatLngExpression, Map as LMap } from "leaflet";
import { environment } from "../../../environments/environment";
import { CupertinoPane } from "cupertino-pane";

@Injectable({
  providedIn: "root",
})
export class CabinsMapService {
  // Reference to the leaflet map object
  map?: LMap;

  // true = favorited, false = favorite removed
  changedFavorites: Map<string, boolean> = new Map();

  favoriteCabins = new Set<string>();

  cabinSidebarRef?: ElementRef<HTMLDivElement>;

  // Standard zoom for cabins (when flying to them on the map)
  cabinZoom = 16;

  // Filters
  filters = {
    onlyOpenCabins: false,
  };

  refreshCabinsSubject = new Subject();

  startingSpotsTab?: QueryList<ElementRef<HTMLInputElement>>;

  // Bottom drawer used instead of the sidebar for small screens
  detailCupertinoPane?: CupertinoPane;

  detailCupertinoPaneSizes = {
    middle: 300,
    bottom: 80,
  };

  constructor(
    private authService: AuthService,
    private cabinService: CabinService,
    private userService: UserService
  ) {}

  initCupertinoDetailPane = () => {
    this.detailCupertinoPane = new CupertinoPane(".cupertino-pane", {
      parentElement: "body",
      breaks: {
        middle: {
          enabled: true,
          height: this.detailCupertinoPaneSizes.middle,
          bounce: true,
        },
        bottom: { enabled: true, height: this.detailCupertinoPaneSizes.bottom },
      },
      buttonDestroy: false,
    });
  };

  getCabinLink = (id: string, absolute: boolean) =>
    absolute ? `${environment.baseUrl}/cabins-map/${id}` : `/cabins-map/${id}`;

  /**
   * Loads user favorites, initializing the favoriteCabins property.
   * @returns Observable.
   */
  loadFavorites = () => {
    if (!this.authService.userIsLogged) {
      return of(null);
    }

    return this.userService.getUserData().pipe(
      tap((res) => {
        if (res.body?.status === "success") {
          this.favoriteCabins = new Set(
            res.body.data?.favoriteCabins?.map((b) => b.cabinId)
          );
        }
      })
    );
  };

  favoriteCabin = (cabinId: string) =>
    this.cabinService.favoriteCabin(cabinId).pipe(
      tap((res) => {
        if (res.body?.status === "success") {
          this.favoriteCabinClient(cabinId);
        }
      })
    );

  unfavoriteCabin = (cabinId: string) =>
    this.cabinService.unfavoriteCabin(cabinId).pipe(
      tap((res) => {
        if (res.status === 204) {
          this.unfavoriteCabinClient(cabinId);
        }
      })
    );

  /**
   * Favorites the cabin. This does not call the api; it's handled locally.
   * @param cabinId
   */
  private favoriteCabinClient = (cabinId: string) => {
    this.favoriteCabins.add(cabinId);
    const value = this.changedFavorites.get(cabinId);
    // Undoes the unfavorite
    if (value === false) {
      this.changedFavorites.delete(cabinId);
    } else {
      this.changedFavorites.set(cabinId, true);
    }
  };

  /**
   * Favorites the cabin. This does not call the api; it's handled locally.
   * @param cabinId
   */
  private unfavoriteCabinClient = (cabinId: string) => {
    this.favoriteCabins.delete(cabinId);
    const value = this.changedFavorites.get(cabinId);
    // Undoes the favorite
    if (value === true) {
      this.changedFavorites.delete(cabinId);
    } else {
      this.changedFavorites.set(cabinId, false);
    }
  };

  /**
   * Tells whether the cabin has been favorited/unfavorited by the user after last
   * userData load.
   * @param cabinId
   * @returns True if the cabin has been favorited; false if the cabin has been
   * unfavorited; undefined otherwise.
   */
  cabinHasBeenFavorited = (cabinId: string) =>
    this.changedFavorites.get(cabinId);

  cabinIsFavorite = (cabinId: string) => this.favoriteCabins.has(cabinId);

  /**
   * Moves the map to the specified coordinates.
   * @param latLng Coordinates of the destination point.
   * @param zoom Zoom level that will be reached after the transition.
   * @param animate Whether to animate the transition.
   * @param cupertinoBreak Small screens only - which break the cupertino pane
   * should reach after the transition.
   * @returns
   */
  scrollToLatLng = (
    latLng?: LatLngExpression | null,
    zoom?: number,
    animate: boolean = true,
    cupertinoBreak?: "middle" | "bottom"
  ) => {
    if (!latLng) return;
    let targetLatLng = latLng;

    // Compensating sidebar width (for large screens)
    const width =
      this.cabinSidebarRef?.nativeElement?.getBoundingClientRect()?.width;
    if (width) {
      // We are compensating for the sidebar width.
      const targetPoint = this.map
        ?.project(latLng, zoom)
        .subtract([width / 2, 0]);
      if (!targetPoint) return;
      targetLatLng = this.map?.unproject(targetPoint, zoom) as LatLngExpression;
      if (!targetLatLng) return;
    }

    // Compensating cupertino pane height (for small screens)
    if (this.detailCupertinoPane && cupertinoBreak) {
      const targetPoint = this.map
        ?.project(latLng, zoom)
        .subtract([
          0,
          (-1 / 2) * this.detailCupertinoPaneSizes[cupertinoBreak],
        ]);
      if (!targetPoint) return;
      targetLatLng = this.map?.unproject(targetPoint, zoom) as LatLngExpression;
      if (!targetLatLng) return;
      this.detailCupertinoPane?.moveToBreak(cupertinoBreak);
    }

    this.map?.flyTo(targetLatLng, zoom, { animate, duration: 1 });
  };

  // Todo scroll to the spot data (useful when we have several spots).
  showSpotDetails = (spotNumber: number) => {
    if (this.startingSpotsTab?.first?.nativeElement) {
      this.detailCupertinoPane?.moveToBreak("top");
      this.startingSpotsTab.first.nativeElement.checked = true;
    }
  };

  // Filters

  filterCabins = () => {
    this.refreshCabinsSubject.next(this.filters);
  };
}
