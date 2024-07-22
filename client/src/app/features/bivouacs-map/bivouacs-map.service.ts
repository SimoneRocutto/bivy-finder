import { Injectable } from "@angular/core";
import { AuthService } from "../../auth.service";
import { UserService } from "../../services/user.service";
import { of, tap } from "rxjs";
import { BivouacService } from "../../bivouac.service";

@Injectable({
  providedIn: "root",
})
export class BivouacsMapService {
  // true = favorited, false = favorite removed
  changedFavorites: Map<string, boolean> = new Map();

  favoriteBivouacs = new Set<string>();

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
}
