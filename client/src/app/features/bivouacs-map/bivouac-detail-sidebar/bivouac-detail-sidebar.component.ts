import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  ViewChild,
} from "@angular/core";
import { Bivouac } from "../../../types/bivouac.type";
import { CommonModule } from "@angular/common";
import { CopyButtonComponent } from "../../../ui-components/generic/copy-button/copy-button.component";
import { finalize, tap } from "rxjs";
import { BivouacsMapService } from "../bivouacs-map.service";
import { TranslocoDirective } from "@jsverse/transloco";
import { CapitalizePipe } from "../../../pipes/capitalize.pipe";
import { FormatTimePipe } from "../../../pipes/format-time.pipe";
import { CurrencySymbolPipe } from "../../../pipes/currency-symbol.pipe";
import { LatLngExpression, Map as LMap } from "leaflet";

@Component({
  selector: "app-bivouac-detail-sidebar",
  standalone: true,
  imports: [
    CommonModule,
    CopyButtonComponent,
    CapitalizePipe,
    CurrencySymbolPipe,
    FormatTimePipe,
    TranslocoDirective,
  ],
  template: `
    <ng-container *transloco="let t">
      <div
        [ngClass]="!hidden && bivouac ? 'drawer-open' : ''"
        class="drawer z-10 absolute top-0 left-0 w-auto h-full pointer-events-none"
        #bivouacDetailSidebar
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
                <div
                  role="tablist"
                  class="tabs tabs-bordered"
                  style="word-break: break-word;"
                >
                  <input
                    type="radio"
                    name="bivouac_tabs"
                    role="tab"
                    class="tab whitespace-nowrap"
                    [attr.aria-label]="
                      t('bivouacs.map.tabs.overview') | capitalize
                    "
                    checked="checked"
                  />
                  <div
                    role="tabpanel"
                    class="tab-content bg-base-100 border-base-300 rounded-box p-6"
                  >
                    <div>
                      <p class="whitespace-pre-line">
                        {{ bivouac.description }}
                      </p>
                      <div class="divider"></div>
                      <div>
                        <p>Type: {{ bivouac.type }}</p>
                        <p>Material: {{ bivouac.material }}</p>
                        <div class="flex flex-row items-center gap-4">
                          <div>
                            {{ bivouac.latLng?.[0] | number : '1.5-5'}},
                            {{ bivouac.latLng?.[1] | number : '1.5-5'}}
                          </div>
                          <app-copy-button
                            [text]="bivouac.latLng?.[0] + ', ' + bivouac.latLng?.[1]"
                          ></app-copy-button>
                        </div>
                      </div>
                      <ng-container
                        *ngIf="bivouac?.externalLinks?.length ?? 0 > 0"
                      >
                        <div class="divider"></div>
                        <div>
                          <a
                            [href]="link"
                            target="_blank"
                            *ngFor="let link of bivouac?.externalLinks"
                            class="link-info flex flex-row gap-1"
                            ><i class="material-symbols-outlined text-lg"
                              >ungroup</i
                            >
                            <div class="link leading-7">{{ link }}</div></a
                          >
                        </div>
                      </ng-container>
                    </div>
                  </div>
                  <input
                    #startingSpotsTab
                    type="radio"
                    name="bivouac_tabs"
                    role="tab"
                    class="tab"
                    [attr.aria-label]="
                      t('bivouacs.map.tabs.starting_spots') | capitalize
                    "
                  />
                  <div
                    role="tabpanel"
                    class="tab-content bg-base-100 border-base-300 rounded-box p-6"
                  >
                    <div class="flex flex-col">
                      <ng-content
                        *ngFor="
                          let spot of bivouac?.startingSpots;
                          let i = index
                        "
                      >
                        <div class="divider" *ngIf="i > 0"></div>
                        <div class="flex flex-col gap-2">
                          <div class="flex flex-row justify-between">
                            <div class="flex flex-row items-center gap-6">
                              <i class="material-symbols-outlined">hiking</i>
                              <div class="leading-none">
                                {{
                                  spot.timeToDestination
                                    ? (spot.timeToDestination | formatTime)
                                    : "N/A"
                                }}
                              </div>
                            </div>
                            <button
                              class="badge bg-purple-700 text-gray-200 w-10 h-10 text-xl font-semibold"
                              (click)="scrollToLatLng(spot.latLng)"
                            >
                              {{ i + 1 }}
                            </button>
                          </div>
                          <div class="flex flex-row items-center gap-6">
                            <i class="material-symbols-outlined">explore</i>
                            <div class="flex flex-row items-center gap-4">
                              <div>
                                {{ spot?.latLng?.[0] | number : '1.5-5'}},
                                {{ spot?.latLng?.[1] | number : '1.5-5'}}
                              </div>
                              <app-copy-button
                                [text]="spot?.latLng?.[0] + ', ' + spot?.latLng?.[1]"
                              ></app-copy-button>
                            </div>
                          </div>
                          <div class="flex flex-col gap-4 my-4">
                            <div
                              *ngIf="spot?.transport?.car as car"
                              class="card w-full shadow-xl bg-yellow-600 text-gray-200"
                            >
                              <div class="card-body flex flex-col gap-4">
                                <div class="grid grid-cols-2">
                                  <div
                                    class="flex w-8 h-8 justify-center items-center bg-transparent"
                                  >
                                    <i
                                      class="material-symbols-outlined material-symbols--filled"
                                      >directions_car</i
                                    >
                                  </div>
                                  <div class="text-lg">
                                    <ng-content
                                      *ngIf="
                                        car?.cost?.value ?? 0 > 0;
                                        else noCost
                                      "
                                    >
                                      {{
                                        (car?.cost?.value ?? 0) / 100
                                          | currency
                                            : car?.cost?.currency ?? "EUR"
                                      }}
                                      <ng-content
                                        *ngIf="
                                          car?.cost?.per &&
                                          car?.cost?.per !== 'forever'
                                        "
                                      >
                                        /
                                        {{
                                          t(
                                            "common.time_units.per." +
                                              (car?.cost?.per ?? "hour")
                                          )
                                        }}
                                      </ng-content>
                                    </ng-content>
                                    <ng-template #noCost>Free</ng-template>
                                  </div>
                                </div>
                                <div>{{ car?.description }}</div>
                              </div>
                            </div>
                            <ng-content *ngIf="spot?.transport?.public">
                              <div
                                *ngFor="
                                  let transport of spot?.transport?.public
                                "
                                class="card w-full shadow-xl bg-green-600 text-gray-200"
                              >
                                <div class="card-body">
                                  <h5 class="font-bold">
                                    {{ transport.name }}
                                  </h5>
                                  <div class="grid grid-cols-2">
                                    <div
                                      class="flex flex-row items-center gap-2"
                                    >
                                      <div
                                        class="flex w-8 h-8 justify-center items-center bg-transparent"
                                      >
                                        <i
                                          class="material-symbols-outlined material-symbols--filled"
                                          >directions_bus</i
                                        >
                                      </div>
                                    </div>
                                    <div class="text-lg">
                                      <ng-content
                                        *ngIf="
                                          transport?.cost?.value ?? 0 > 0;
                                          else noCost
                                        "
                                      >
                                        {{
                                          (transport?.cost?.value ?? 0) / 100
                                            | currency
                                              : transport?.cost?.currency ??
                                                  "EUR"
                                        }}
                                      </ng-content>
                                      <ng-template #noCost>Free</ng-template>
                                    </div>
                                  </div>
                                  <div>{{ transport.description }}</div>
                                </div>
                              </div>
                            </ng-content>
                          </div>
                          <div>{{ spot.description }}</div>
                        </div>
                      </ng-content>
                    </div>
                  </div>
                </div>
              </div>
            </ng-container>
          </div>
        </div>
      </div>
    </ng-container>
  `,
  styles: ``,
})
export class BivouacDetailSidebarComponent {
  @ViewChild("bivouacDetailSidebar")
  bivouacDetailSidebar!: ElementRef<HTMLDivElement>;
  @ViewChild("startingSpotsTab")
  startingSpotsTab!: ElementRef<HTMLInputElement>;
  @Input() bivouac?: Bivouac | null;
  @Input() map?: LMap | null;
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

  scrollToLatLng = (latLng?: LatLngExpression | null) => {
    if (!latLng) return;
    // We are compensating for the sidebar width.
    const { width } =
      this.bivouacDetailSidebar.nativeElement.getBoundingClientRect();
    const targetPoint = this.map?.project(latLng).subtract([width / 2, 0]);
    if (!targetPoint) return;
    const targetLatLng = this.map?.unproject(targetPoint);
    if (!targetLatLng) return;
    this.map?.flyTo(targetLatLng);
  };

  // Todo scroll to the spot data (useful when we have several spots).
  showSpotDetails = (spotNumber: number) => {
    this.startingSpotsTab.nativeElement.checked = true;
  };
}
