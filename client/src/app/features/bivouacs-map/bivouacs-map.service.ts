import { ElementRef, Injectable } from "@angular/core";
import { AuthService } from "../../services/auth.service";
import { UserService } from "../../services/user.service";
import { Subject, of, tap } from "rxjs";
import { BivouacService } from "../../services/bivouac.service";
import { LatLngExpression, Map as LMap } from "leaflet";

@Injectable({
  providedIn: "root",
})
export class BivouacsMapService {
  // Reference to the leaflet map object
  map?: LMap;

  // true = favorited, false = favorite removed
  changedFavorites: Map<string, boolean> = new Map();

  favoriteBivouacs = new Set<string>();

  bivouacSidebarRef?: ElementRef<HTMLDivElement>;

  // Standard zoom for bivouacs (when flying to them on the map)
  bivouacZoom = 16;

  // Filters
  filters = {
    onlyOpenBivouacs: false,
  };

  refreshBivouacsSubject = new Subject();

  constructor(
    private authService: AuthService,
    private bivouacService: BivouacService,
    private userService: UserService
  ) {}

  /**
   * Loads user favorites, initializing the favoriteBivouacs property.
   * @returns Observable.
   */
  loadFavorites = () => {
    if (!this.authService.userIsLogged) {
      return of(null);
    }

    return this.userService.getUserData().pipe(
      tap((res) => {
        if (res.body?.status === "success") {
          this.favoriteBivouacs = new Set(
            res.body.data?.favoriteBivouacs?.map((b) => b.bivouacId)
          );
        }
      })
    );
  };

  favoriteBivouac = (bivouacId: string) =>
    this.bivouacService.favoriteBivouac(bivouacId).pipe(
      tap((res) => {
        if (res.body?.status === "success") {
          this.favoriteBivouacClient(bivouacId);
        }
      })
    );

  unfavoriteBivouac = (bivouacId: string) =>
    this.bivouacService.unfavoriteBivouac(bivouacId).pipe(
      tap((res) => {
        if (res.status === 204) {
          this.unfavoriteBivouacClient(bivouacId);
        }
      })
    );

  /**
   * Favorites the bivouac. This does not call the api; it's handled locally.
   * @param bivouacId
   */
  private favoriteBivouacClient = (bivouacId: string) => {
    this.favoriteBivouacs.add(bivouacId);
    const value = this.changedFavorites.get(bivouacId);
    // Undoes the unfavorite
    if (value === false) {
      this.changedFavorites.delete(bivouacId);
    } else {
      this.changedFavorites.set(bivouacId, true);
    }
  };

  /**
   * Favorites the bivouac. This does not call the api; it's handled locally.
   * @param bivouacId
   */
  private unfavoriteBivouacClient = (bivouacId: string) => {
    this.favoriteBivouacs.delete(bivouacId);
    const value = this.changedFavorites.get(bivouacId);
    // Undoes the favorite
    if (value === true) {
      this.changedFavorites.delete(bivouacId);
    } else {
      this.changedFavorites.set(bivouacId, false);
    }
  };

  /**
   * Tells whether the bivouac has been favorited/unfavorited by the user after last
   * userData load.
   * @param bivouacId
   * @returns True if the bivouac has been favorited; false if the bivouac has been
   * unfavorited; undefined otherwise.
   */
  bivouacHasBeenFavorited = (bivouacId: string) =>
    this.changedFavorites.get(bivouacId);

  bivouacIsFavorite = (bivouacId: string) =>
    this.favoriteBivouacs.has(bivouacId);

  scrollToLatLng = (
    latLng?: LatLngExpression | null,
    zoom?: number,
    animate: boolean = true
  ) => {
    if (!latLng) return;
    let targetLatLng = latLng;
    const width =
      this.bivouacSidebarRef?.nativeElement?.getBoundingClientRect()?.width;
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

  filterBivouacs = () => {
    this.refreshBivouacsSubject.next(this.filters);
  };
}
