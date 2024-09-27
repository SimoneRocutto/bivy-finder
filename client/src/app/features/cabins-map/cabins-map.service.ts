import { ElementRef, Injectable } from "@angular/core";
import { AuthService } from "../../services/auth.service";
import { UserService } from "../../services/user.service";
import { Subject, of, tap } from "rxjs";
import { CabinService } from "../../services/cabin.service";
import { LatLngExpression, Map as LMap } from "leaflet";
import { environment } from "../../../environments/environment";

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

  constructor(
    private authService: AuthService,
    private cabinService: CabinService,
    private userService: UserService
  ) {}

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

  scrollToLatLng = (
    latLng?: LatLngExpression | null,
    zoom?: number,
    animate: boolean = true
  ) => {
    if (!latLng) return;
    let targetLatLng = latLng;
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
    this.map?.flyTo(targetLatLng, zoom, { animate, duration: 1 });
  };

  // Filters

  filterCabins = () => {
    this.refreshCabinsSubject.next(this.filters);
  };
}
