import { CommonModule } from "@angular/common";
import {
  Bivouac,
  CarTransport,
  NewBivouac,
  PublicTransport,
  PublicTransportFormGroup,
  StartingSpot,
  StartingSpotFormGroup,
} from "./../../../types/bivouac.type";
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from "@angular/core";
import { TranslocoDirective } from "@jsverse/transloco";
import {
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { humanToMs, msToHuman } from "../../../helpers/misc";
import { FormInputComponent } from "../../../ui-components/generic/form-input/form-input.component";
import { TooltipComponent } from "../../../ui-components/generic/tooltip/tooltip.component";
import { ModalService } from "../../../ui-components/generic/modal/modal.service";
import { ToastService } from "../../../ui-components/generic/toast-box/toast.service";
import { LatLngExpression } from "leaflet";
import { BivouacService } from "../../../services/bivouac.service";
import { catchError, tap } from "rxjs";
import { ErrorService } from "../../../services/error.service";

@Component({
  selector: "app-starting-spots-form",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslocoDirective,
    FormInputComponent,
    TooltipComponent,
  ],
  template: `
    <h3 class="text-lg font-semibold mb-4">Starting spots</h3>
    <!-- todo - move this below (now it doesn't work because of viewchild and ngfor) -->
    <ng-container *transloco="let t">
      <form class="flex flex-col" *ngIf="spotForms" (ngSubmit)="submit()">
        <div class="flex flex-col gap-4 mb-6">
          <ng-container
            *ngFor="let spotForm of spotForms.controls; let i = index"
          >
            <div class="collapse collapse-arrow bg-base-200">
              <input type="checkbox" />
              <div class="collapse-title text-xl font-medium">
                {{ i + 1 }}
              </div>
              <div class="collapse-content">
                <form [formGroup]="spotForm" class="flex flex-col">
                  <div class="flex flex-col gap-4">
                    <div class="flex flex-row justify-between">
                      <div class="flex flex-row items-center gap-6">
                        <i class="material-symbols-outlined">hiking</i>
                        <div
                          class="flex flex-row gap-1 flex-wrap xs:flex-nowrap"
                        >
                          <app-form-input
                            label="d"
                            [formGroup]="spotForm"
                            formControlName="days"
                            type="number"
                            [step]="1"
                            [min]="0"
                            [inputWidth]="40"
                            [labelAfterInput]="true"
                            [labelAsIs]="true"
                          ></app-form-input>
                          <app-form-input
                            label="h"
                            [formGroup]="spotForm"
                            formControlName="hours"
                            type="number"
                            [step]="1"
                            [min]="0"
                            [inputWidth]="40"
                            [labelAfterInput]="true"
                            [labelAsIs]="true"
                          ></app-form-input>
                          <app-form-input
                            label="m"
                            [formGroup]="spotForm"
                            formControlName="minutes"
                            type="number"
                            [step]="1"
                            [min]="0"
                            [inputWidth]="40"
                            [labelAfterInput]="true"
                            [labelAsIs]="true"
                          ></app-form-input>
                        </div>
                      </div>
                    </div>
                    <form formGroupName="latLng" class="flex flex-col gap-4">
                      <app-tooltip
                        label="Try pasting comma-separated coordinates here"
                      >
                        <app-form-input
                          label="latitude"
                          [formGroup]="spotForm.controls.latLng"
                          formControlName="latitude"
                          type="number"
                          [step]="latLngPrecision"
                          [min]="-90"
                          [max]="90"
                          (paste)="
                            fillCoordinates($event, spotForm.controls.latLng)
                          "
                        ></app-form-input>
                      </app-tooltip>
                      <app-form-input
                        label="longitude"
                        [formGroup]="spotForm.controls.latLng"
                        formControlName="longitude"
                        type="number"
                        [step]="latLngPrecision"
                        [min]="-180"
                        [max]="180"
                      ></app-form-input>
                      <app-form-input
                        label="altitude"
                        [formGroup]="spotForm.controls.latLng"
                        formControlName="altitude"
                        type="number"
                        [step]="latLngPrecision"
                      ></app-form-input>
                    </form>
                    <form
                      class="card w-full shadow-xl bg-yellow-600"
                      *ngIf="spotForm?.controls?.car"
                      formGroupName="car"
                    >
                      <div class="flex flex-row">
                        <div class="card-body flex flex-col gap-4 pr-4">
                          <div class="flex flex-row items-center gap-2">
                            <div
                              class="flex w-8 h-8 justify-center items-center bg-transparent"
                            >
                              <i
                                class="material-symbols-outlined material-symbols--filled text-gray-200"
                                >directions_car</i
                              >
                            </div>
                            <div
                              class="flex flex-col sm:flex-row sm:items-center gap-y-2 xs:gap-y-4"
                            >
                              <div
                                class="flex flex-col gap-y-2 xs:gap-y-0 xs:flex-row xs:items-center"
                              >
                                <select
                                  formControlName="currency"
                                  class="select select-bordered max-w-24"
                                >
                                  <option ngValue="EUR">€</option>
                                  <option ngValue="USD">$</option>
                                </select>
                                <app-form-input
                                  formControlName="cost"
                                  type="number"
                                  [min]="0"
                                  [inputWidth]="40"
                                  label="Cost"
                                  [labelAsPlaceholder]="true"
                                ></app-form-input>
                                <div class="text-gray-200 mx-2">/</div>
                              </div>
                              <select
                                formControlName="costPer"
                                class="select select-bordered max-w-xs"
                              >
                                <option [ngValue]="null">Forever</option>
                                <option ngValue="hour">Hour</option>
                                <option ngValue="day">Day</option>
                                <option ngValue="week">Week</option>
                                <option ngValue="month">Month</option>
                              </select>
                            </div>
                          </div>
                          <textarea
                            formControlName="description"
                            class="textarea textarea-bordered w-full"
                            placeholder="Description"
                          ></textarea>
                        </div>
                        <div class="flex flex-col">
                          <button
                            type="button"
                            *ngIf="spotForm?.controls?.car"
                            class="btn flex-grow  bg-yellow-500 border-none rounded-l-none rounded-r-2xl"
                            (click)="removeCar(spotForm)"
                          >
                            <i class="material-symbols-outlined">delete</i>
                          </button>
                        </div>
                      </div>
                    </form>
                    <button
                      type="button"
                      *ngIf="!spotForm?.controls?.car"
                      class="btn btn-primary"
                      (click)="addCar(spotForm)"
                    >
                      <div class="relative">
                        <i class="material-symbols-outlined">directions_car</i>
                        <i class="material-symbols-outlined plus-icon">add</i>
                      </div>
                    </button>
                    <ng-container
                      *ngFor="
                        let transportForm of spotForm?.controls?.public
                          ?.controls;
                        let j = index
                      "
                    >
                      <form
                        class="card w-full shadow-xl bg-green-600"
                        [formGroup]="transportForm"
                      >
                        <div class="flex flex-row">
                          <div class="card-body pr-4 flex flex-col gap-4">
                            <div class="flex flex-row items-center gap-2">
                              <div
                                class="flex w-8 h-8 justify-center items-center bg-transparent"
                              >
                                <i
                                  class="material-symbols-outlined material-symbols--filled text-gray-200"
                                  >directions_bus</i
                                >
                              </div>
                              <div class="flex flex-col gap-4 flex-1">
                                <app-form-input
                                  formControlName="name"
                                  label="Name"
                                  [labelAsPlaceholder]="true"
                                  [inputWidth]="40"
                                ></app-form-input>
                                <div class="flex flex-col gap-y-2 xs:flex-row">
                                  <select
                                    formControlName="currency"
                                    class="select select-bordered max-w-24"
                                  >
                                    <option ngValue="EUR">€</option>
                                    <option ngValue="USD">$</option>
                                  </select>
                                  <div class="max-w-64">
                                    <app-form-input
                                      formControlName="cost"
                                      type="number"
                                      [min]="0"
                                      [inputWidth]="40"
                                      label="Cost"
                                      [labelAsPlaceholder]="true"
                                    ></app-form-input>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <textarea
                              formControlName="description"
                              class="textarea textarea-bordered w-full"
                              placeholder="Description"
                            ></textarea>
                          </div>
                          <div class="flex flex-col">
                            <button
                              type="button"
                              class="btn flex-grow  bg-green-500 border-none rounded-l-none rounded-r-2xl"
                              (click)="
                                removePublicTransport(
                                  spotForm.controls.public,
                                  j
                                )
                              "
                            >
                              <i class="material-symbols-outlined">delete</i>
                            </button>
                          </div>
                        </div>
                      </form>
                    </ng-container>
                    <button
                      type="button"
                      class="btn btn-primary"
                      (click)="addPublicTransport(spotForm)"
                    >
                      <div class="relative">
                        <i class="material-symbols-outlined">directions_bus</i>
                        <i class="material-symbols-outlined plus-icon">add</i>
                      </div>
                    </button>
                    <textarea
                      formControlName="description"
                      class="textarea textarea-bordered grow"
                      placeholder="Description"
                    ></textarea>
                  </div>
                </form>
                <div class="divider"></div>
                <div class="flex flex-row justify-center mb-2">
                  <button
                    type="button"
                    class="btn btn-error"
                    (click)="removeSpot(i)"
                  >
                    <i class="material-symbols-outlined">delete</i>
                  </button>
                </div>
              </div>
            </div>
          </ng-container>
          <button type="button" class="btn btn-primary" (click)="addSpot()">
            <div class="relative">
              <i class="material-symbols-outlined">hiking</i>
              <i class="material-symbols-outlined plus-icon">add</i>
            </div>
          </button>
        </div>
        <div class="flex flex-row self-end gap-4">
          <button
            type="button"
            class="btn btn-error"
            (click)="closeModal()"
            [disabled]="isSubmitting"
          >
            Cancel
          </button>
          <button
            type="submit"
            [disabled]="!spotForms.valid || isSubmitting"
            class="btn btn-primary relative"
          >
            <div [ngClass]="{ invisible: isSubmitting }">Submit</div>
            <span
              *ngIf="isSubmitting"
              class="loading loading-dots loading-md absolute"
            ></span>
          </button>
        </div>
      </form>
    </ng-container>
  `,
  styles: `.plus-icon {
    position: absolute;
    top: -4px;
    right: -10px;
    font-size: 1rem;
    font-weight: 650;
  }`,
})
export class StartingSpotsFormComponent implements OnInit {
  @Input() bivouac?: Bivouac;
  @Output() onSubmit = new EventEmitter();
  @Output() onUpdate = new EventEmitter<string>();

  spotForms!: FormArray<StartingSpotFormGroup>;

  isSubmitting = false;

  latLngPrecision = 0.0001;

  get parsedForm(): StartingSpot[] {
    const formValues = this.spotForms.getRawValue();

    const parsedForm: StartingSpot[] = formValues.map((form) => {
      const {
        days,
        hours,
        minutes,
        description,
        car,
        public: publicTransports,
        latLng,
      } = form;

      const {
        cost,
        costPer,
        currency,
        description: carDescription,
      } = car ?? {};
      const parsedCar: CarTransport = {
        description: carDescription,
        ...(cost && {
          cost: {
            value: this.untransformCost(cost),
            currency: currency ?? "EUR",
            ...(costPer && { per: costPer }),
          },
        }),
      };

      const { latitude, longitude, altitude } = latLng;

      const parsedLatLng: LatLngExpression | null =
        latitude || longitude || altitude
          ? [latitude ?? 0, longitude ?? 0, altitude ?? undefined]
          : null;

      const parsedPublicTransports: PublicTransport[] = publicTransports.map(
        (transport) => {
          const { name, description, cost, currency } = transport;
          return {
            // We are sure this will not be null since it is required in the form.
            name: name!,
            description,
            ...(cost && {
              cost: {
                value: this.untransformCost(cost),
                currency: currency ?? "EUR",
              },
            }),
          };
        }
      );

      const timeToDestination = humanToMs([
        days ?? 0,
        hours ?? 0,
        minutes ?? 0,
      ]);

      return {
        ...([hours, days, minutes].some((item) => item != null) && {
          timeToDestination,
        }),
        ...(description && { description }),
        ...(parsedLatLng && { latLng: parsedLatLng }),
        ...((car || parsedPublicTransports?.length > 0) && {
          transport: {
            ...(car && { car: parsedCar }),
            ...(parsedPublicTransports?.length > 0 && {
              public: parsedPublicTransports,
            }),
          },
        }),
      };
    });

    return parsedForm;
  }

  constructor(
    private bivouacsService: BivouacService,
    private errorService: ErrorService,
    private modalService: ModalService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.spotForms = new FormArray([]) as any;

    this.prefillForm();
  }

  submit = () => {
    if (!this.spotForms.valid || !this.parsedForm) {
      this.toastService.createToast("Invalid form", "error");
      return;
    }

    this.isSubmitting = true;

    this.updateBivouac(this.bivouac!._id, {
      // Todo remove name from sent data! We are not updating it
      name: this.bivouac!.name,
      startingSpots: this.parsedForm,
    })
      .pipe(
        catchError((e) =>
          this.errorService
            .catchAll(e, true)
            .pipe(tap(() => (this.isSubmitting = false)))
        )
      )
      .subscribe();
  };

  updateBivouac = (bivouacId: string, bivouac: NewBivouac) =>
    this.bivouacsService.updateBivouac(bivouacId, bivouac).pipe(
      tap((res) => {
        if (res.status === 204) {
          this.toastService.createToast("Bivouac updated", "success");
          this.onSubmit.emit();
          this.onUpdate.emit();
        }
      })
    );

  closeModal = () => {
    this.modalService.close();
  };

  private transformCost = (cost?: number) =>
    typeof cost === "number" ? cost / 100 : cost;

  private untransformCost = (cost: number) => Math.round(cost * 100);

  private initSpotForm = () =>
    new FormGroup({
      description: new FormControl(),
      days: new FormControl(),
      hours: new FormControl(),
      minutes: new FormControl(),
      latLng: new FormGroup({
        latitude: new FormControl(null, [
          Validators.required,
          Validators.min(-90),
          Validators.max(90),
        ]) as FormControl<number | null>,
        longitude: new FormControl(null, [
          Validators.required,
          Validators.min(-180),
          Validators.max(180),
        ]) as FormControl<number | null>,
        altitude: new FormControl(),
      }),
      public: new FormArray([] as PublicTransportFormGroup[]),
    });

  private initCarForm = () =>
    new FormGroup({
      description: new FormControl(),
      currency: new FormControl(),
      cost: new FormControl(),
      costPer: new FormControl(),
    });

  private initPublicTransportForm = () =>
    new FormGroup({
      name: new FormControl(null, [Validators.required]) as FormControl<
        string | null
      >,
      description: new FormControl(),
      currency: new FormControl(),
      cost: new FormControl(),
    });

  /**
   * If this is an update form, prefills the form with data.
   * Otherwise, the form is left empty.
   */
  private prefillForm = () => {
    for (const [i, spot] of (this.bivouac?.startingSpots ?? []).entries()) {
      const formGroup: StartingSpotFormGroup = this.initSpotForm();
      if (spot?.transport?.car) {
        const carGroup = this.initCarForm();
        carGroup.patchValue({
          description: spot?.transport?.car?.description,
          currency: spot?.transport?.car?.cost?.currency,
          cost: this.transformCost(spot?.transport?.car?.cost?.value),
        });
        formGroup.addControl("car", carGroup);
      }

      for (const publicTransport of spot?.transport?.public ?? []) {
        const transportGroup = this.initPublicTransportForm();
        transportGroup.patchValue({
          name: publicTransport?.name,
          description: publicTransport?.description,
          currency: publicTransport?.cost?.currency,
          cost: this.transformCost(publicTransport?.cost?.value),
        });
        formGroup.controls.public.push(transportGroup);
      }

      const { latLng, transport, ...otherProps } = spot ?? {};
      const car = transport?.car;
      const { currency, per: costPer, value: cost } = car?.cost ?? {};
      const [days, hours, minutes] = msToHuman(spot?.timeToDestination);
      formGroup.patchValue({
        ...otherProps,
        days,
        hours,
        minutes,
        car: {
          description: car?.description,
          currency,
          cost: this.transformCost(cost),
          costPer,
        },
        latLng: {
          latitude: latLng?.[0],
          longitude: latLng?.[1],
          altitude: latLng?.[2],
        },
      });

      this.spotForms.push(formGroup);
    }
  };

  addSpot = () => {
    this.spotForms.push(this.initSpotForm());
  };

  removeSpot = (i: number) => {
    this.spotForms.removeAt(i);
  };

  addPublicTransport = (spotForm: StartingSpotFormGroup) => {
    let publicTransports = spotForm.controls.public;

    const newPublicTransport = this.initPublicTransportForm();
    publicTransports!.push(newPublicTransport);
  };

  removePublicTransport = (publicTransports: FormArray, i: number) => {
    publicTransports.removeAt(i);
  };

  addCar = (spotForm: StartingSpotFormGroup) => {
    spotForm.controls.car = this.initCarForm();
  };

  removeCar = (spotForm: StartingSpotFormGroup) => {
    spotForm.removeControl("car");
  };

  //! CODE DUPLICATION! We have to find a way to create a reusable latLngForm.
  /**
   * Pasting a comma-separated list of coordinates in the latitude input
   * will fill the coordinates form inputs. Altitude is filled only if
   * 3 coordinates are provided.
   * @param event Paste event
   */
  fillCoordinates = (event: ClipboardEvent, formGroup: FormGroup) => {
    const paste = event.clipboardData?.getData("text");

    if (!paste) return;

    const coordinates = paste
      .replaceAll(" ", "")
      .split(",")
      .map((item) => Number(item));

    if (
      coordinates.every((item) => !isNaN(item)) &&
      [2, 3].includes(coordinates.length)
    ) {
      event.preventDefault();
      const [latitude, longitude, altitude] = coordinates;
      formGroup.patchValue({
        latitude,
        longitude,
        ...(altitude ? { altitude } : undefined),
      });
    }
  };
}
