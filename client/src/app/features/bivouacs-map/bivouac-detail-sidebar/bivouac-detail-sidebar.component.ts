import { ChangeDetectorRef, Component, Input } from "@angular/core";
import { Bivouac } from "../../../types/bivouac.type";
import { CommonModule } from "@angular/common";
import { CopyButtonComponent } from "../../../ui-components/generic/copy-button/copy-button.component";
import { finalize, tap } from "rxjs";
import { BivouacsMapService } from "../bivouacs-map.service";

@Component({
  selector: "app-bivouac-detail-sidebar",
  standalone: true,
  imports: [CommonModule, CopyButtonComponent],
  template: `
    <div
      [ngClass]="!hidden && bivouac ? 'drawer-open' : ''"
      class="drawer z-10 absolute top-0 left-0 w-auto h-full pointer-events-none"
    >
      <input id="detail-drawer" type="checkbox" class="drawer-toggle" />
      <div class="drawer-side h-full sticky pointer-events-none">
        <div
          class="relative p-0 w-96 min-h-full bg-base-200 text-base-content"
          style="max-width: calc(100vw - 60px)"
        >
          <ng-container *ngIf="bivouac">
            <div class="w-full h-48">
              <img
                [src]="bivouac.imageUrl"
                alt="Bivouac image"
                class="w-full h-full"
              />
            </div>
            <div class="p-4">
              <div class="flex flex-row justify-between items-center">
                <h3 class="text-lg font-semibold">{{ bivouac.name }}</h3>
                <div class="flex flex-row items-center">
                  <div>{{ bivouacsCount }}</div>
                  <button
                    class="btn btn-ghost"
                    (click)="toggleFavorite(bivouac._id)"
                  >
                    <i
                      class="material-symbols-outlined"
                      [ngClass]="{
                        'material-symbols--filled text-red-500':
                          bivouacIsFavorite(bivouac._id)
                      }"
                      >favorite</i
                    >
                  </button>
                </div>
              </div>
              <p class="whitespace-pre-line">
                {{ bivouac.description }}
              </p>
              <div class="divider"></div>
              <div>
                <p>Type: {{ bivouac.type }}</p>
                <p>Material: {{ bivouac.material }}</p>
                <div class="flex flex-row items-center gap-2">
                  <div>
                    {{ bivouac.latLng?.[0] | number : '1.5-5'}},
                    {{ bivouac.latLng?.[1] | number : '1.5-5'}}
                  </div>
                  <app-copy-button
                    [text]="bivouac.latLng?.[0] + ', ' + bivouac.latLng?.[1]"
                  ></app-copy-button>
                </div>
              </div>
              <ng-container *ngIf="bivouac?.externalLinks?.length ?? 0 > 0">
                <div class="divider"></div>
                <div>
                  <a
                    [href]="link"
                    target="_blank"
                    *ngFor="let link of bivouac?.externalLinks"
                    class="link-info flex flex-row gap-1"
                    ><i class="material-symbols-outlined text-lg">ungroup</i>
                    <div class="link leading-7">{{ link }}</div></a
                  >
                </div>
              </ng-container>
            </div>
          </ng-container>
        </div>
      </div>
    </div>
  `,
  styles: ``,
})
export class BivouacDetailSidebarComponent {
  @Input() bivouac?: Bivouac;
  @Input() hidden?: boolean = true;

  favoriteIsLoading = false;

  get bivouacsCount() {
    if (!this.bivouac) return 0;
    const hasBeenFavorited = this.bivouacsMapService.bivouacHasBeenFavorited(
      this.bivouac._id
    );
    return (
      (this.bivouac?.favoritesCount ?? 0) +
      (hasBeenFavorited === true ? 1 : hasBeenFavorited === false ? -1 : 0)
    );
  }

  constructor(
    private bivouacsMapService: BivouacsMapService,
    private changeDetector: ChangeDetectorRef
  ) {}

  bivouacIsFavorite = (bivouacId: string) =>
    this.bivouacsMapService.bivouacIsFavorite(bivouacId);

  toggleFavorite = (bivouacId: string) => {
    if (this.favoriteIsLoading) {
      return;
    }
    this.favoriteIsLoading = true;
    const bivouacIsFavorite = this.bivouacIsFavorite(bivouacId);
    (bivouacIsFavorite
      ? this.bivouacsMapService.unfavoriteBivouac(bivouacId).pipe(
          tap((res) => {
            if (res.status === 204) {
              this.bivouacsMapService.unfavoriteBivouac(bivouacId);
              this.changeDetector.detectChanges();
            }
          })
        )
      : this.bivouacsMapService.favoriteBivouac(bivouacId).pipe(
          tap((res) => {
            if (res.body?.status === "success") {
              this.changeDetector.detectChanges();
            }
          })
        )
    )
      .pipe(finalize(() => (this.favoriteIsLoading = false)))
      .subscribe();
  };
}
