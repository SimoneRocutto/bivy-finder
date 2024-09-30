import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  QueryList,
  ViewChildren,
} from "@angular/core";
import { Cabin } from "../../../types/cabin.type";
import { CommonModule } from "@angular/common";
import { CopyButtonComponent } from "../../../ui-components/generic/copy-button/copy-button.component";
import { finalize, tap } from "rxjs";
import { CabinsMapService } from "../cabins-map.service";
import { TranslocoDirective } from "@jsverse/transloco";
import { CapitalizePipe } from "../../../pipes/capitalize.pipe";
import { FormatTimePipe } from "../../../pipes/format-time.pipe";
import { CurrencySymbolPipe } from "../../../pipes/currency-symbol.pipe";
import { LatLngExpression, Map as LMap } from "leaflet";
import { AuthService } from "../../../services/auth.service";
import { ToastService } from "../../../ui-components/generic/toast-box/toast.service";
import { CupertinoPane } from "cupertino-pane";
import { ScreenService } from "../../../services/screen.service";

@Component({
  selector: "app-cabin-detail",
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
      <ng-container *ngIf="cabin">
        <div
          class="flex flex-col gap-4"
          [ngClass]="{ 'flex-col-reverse': isLargeScreen }"
        >
          <div class="flex flex-row justify-between items-center px-4">
            <h3 class="text-lg font-semibold">{{ cabin.name }}</h3>
            <div class="flex flex-row items-center">
              <div>{{ cabinsCount }}</div>
              <button class="btn btn-ghost" (click)="toggleFavorite(cabin._id)">
                <i
                  class="material-symbols-outlined"
                  [ngClass]="{
                    'material-symbols--filled text-red-500': cabinIsFavorite(
                      cabin._id
                    )
                  }"
                  >favorite</i
                >
              </button>
              <button
                class="btn btn-neutral btn-sm btn-circle"
                (click)="shareCabin(cabin)"
                *ngIf="canShare; else shareCopyButton"
              >
                <i class="material-symbols-outlined text-lg">share</i>
              </button>
              <ng-template #shareCopyButton>
                <app-copy-button
                  [text]="getCabinLink(cabin._id)"
                  [circularButton]="true"
                  icon="share"
                ></app-copy-button>
              </ng-template>
            </div>
          </div>
          <div class="max-w-full mx-auto">
            <img [src]="cabin.imageUrl" alt="Cabin image" />
          </div>
        </div>
        <div class="p-4">
          <div
            role="tablist"
            class="tabs tabs-bordered"
            style="word-break: break-word;"
          >
            <input
              type="radio"
              name="cabin_tabs"
              role="tab"
              class="tab whitespace-nowrap"
              [attr.aria-label]="t('cabins.map.tabs.overview') | capitalize"
              checked="checked"
            />
            <div
              role="tabpanel"
              class="tab-content bg-base-100 border-base-300 rounded-box p-6"
            >
              <div>
                <p class="whitespace-pre-line">
                  {{ cabin.description }}
                </p>
                <div class="divider"></div>
                <div>
                  <p>Type: {{ cabin.type }}</p>
                  <p>Material: {{ cabin.material }}</p>
                  <div class="flex flex-row items-center gap-4">
                    <div>
                      {{ cabin.latLng?.[0] | number : '1.5-5'}},
                      {{ cabin.latLng?.[1] | number : '1.5-5'}}
                    </div>
                    <app-copy-button
                      [text]="cabin.latLng?.[0] + ', ' + cabin.latLng?.[1]"
                    ></app-copy-button>
                  </div>
                </div>
                <ng-container *ngIf="cabin?.externalLinks?.length ?? 0 > 0">
                  <div class="divider"></div>
                  <div>
                    <a
                      [href]="link"
                      target="_blank"
                      *ngFor="let link of cabin?.externalLinks"
                      class="link-info flex flex-row gap-1"
                      ><i class="material-symbols-outlined text-lg">ungroup</i>
                      <div class="link leading-7">{{ link }}</div></a
                    >
                  </div>
                </ng-container>
              </div>
            </div>
            <input
              #startingSpotsTab
              type="radio"
              name="cabin_tabs"
              role="tab"
              class="tab"
              [attr.aria-label]="
                t('cabins.map.tabs.starting_spots') | capitalize
              "
            />
            <div
              role="tabpanel"
              class="tab-content bg-base-100 border-base-300 rounded-box p-6"
            >
              <div class="flex flex-col">
                <ng-content
                  *ngFor="let spot of cabin?.startingSpots; let i = index"
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
                                *ngIf="car?.cost?.value ?? 0 > 0; else noCost"
                              >
                                {{
                                  (car?.cost?.value ?? 0) / 100
                                    | currency : car?.cost?.currency ?? "EUR"
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
                          *ngFor="let transport of spot?.transport?.public"
                          class="card w-full shadow-xl bg-green-600 text-gray-200"
                        >
                          <div class="card-body">
                            <h5 class="font-bold">
                              {{ transport.name }}
                            </h5>
                            <div class="grid grid-cols-2">
                              <div class="flex flex-row items-center gap-2">
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
                                        : transport?.cost?.currency ?? "EUR"
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
    </ng-container>
  `,
  styles: ``,
})
export class CabinDetailComponent implements AfterViewInit {
  // Using ViewChildren instead of ViewChild because the ngIf makes it so
  // the tab is not rendered yet at ngAfterViewInit. With ViewChildren,
  // we can then access the tab element from cabins-map-service by using
  // startingSpotsTab.first
  @ViewChildren("startingSpotsTab")
  startingSpotsTab!: QueryList<ElementRef<HTMLInputElement>>;
  @Input() cabin?: Cabin | null;
  @Input() map?: LMap | null;

  favoriteIsLoading = false;

  cupertinoPane!: CupertinoPane;

  paneWillBeOpened = false;

  isLargeScreen: boolean = false;

  get canShare() {
    return !!navigator?.canShare;
  }

  get cabinsCount() {
    if (!this.cabin) return 0;
    const hasBeenFavorited = this.cabinsMapService.cabinHasBeenFavorited(
      this.cabin._id
    );
    return (
      (this.cabin?.favoritesCount ?? 0) +
      (hasBeenFavorited === true ? 1 : hasBeenFavorited === false ? -1 : 0)
    );
  }

  constructor(
    private authService: AuthService,
    private cabinsMapService: CabinsMapService,
    private changeDetector: ChangeDetectorRef,
    private toastService: ToastService,
    private screenService: ScreenService
  ) {
    this.isLargeScreen = this.screenService.isLargeScreen();
  }

  ngAfterViewInit(): void {
    this.cabinsMapService.startingSpotsTab = this.startingSpotsTab;
  }

  getCabinLink = (id: string) => this.cabinsMapService.getCabinLink(id, true);

  shareCabin = (cabin: Cabin) => {
    const data = {
      title: `${cabin.name}`,
      url: this.getCabinLink(cabin._id),
    };
    if (!navigator?.canShare(data)) {
      return;
    }
    navigator.share(data);
  };

  cabinIsFavorite = (cabinId: string) =>
    this.cabinsMapService.cabinIsFavorite(cabinId);

  toggleFavorite = (cabinId: string) => {
    if (!this.authService.userIsLogged) {
      this.toastService.createToast(
        "You have to be logged in to perform this action",
        "info"
      );
    }
    if (this.favoriteIsLoading) {
      return;
    }
    this.favoriteIsLoading = true;
    const cabinIsFavorite = this.cabinIsFavorite(cabinId);
    (cabinIsFavorite
      ? this.cabinsMapService.unfavoriteCabin(cabinId).pipe(
          tap((res) => {
            if (res.status === 204) {
              this.cabinsMapService.unfavoriteCabin(cabinId);
              this.changeDetector.detectChanges();
            }
          })
        )
      : this.cabinsMapService.favoriteCabin(cabinId).pipe(
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
    let zoom: number | undefined;
    // We only zoom if the current zoom is less than the recommended zoom for cabins.
    if (
      this.cabinsMapService.cabinZoom >
      (this.cabinsMapService.map?.getZoom() ?? 0)
    ) {
      zoom = this.cabinsMapService.cabinZoom;
    }
    this.cabinsMapService.scrollToLatLng(latLng, zoom, true, "bottom");
  };
}
