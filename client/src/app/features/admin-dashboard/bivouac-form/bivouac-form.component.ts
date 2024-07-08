import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { BivouacService } from "../../../bivouac.service";
import {
  Bivouac,
  BivouacMaterial,
  BivouacType,
  NewBivouac,
  bivouacMaterials,
  bivouacTypes,
} from "../../../types/bivouac.type";
import { CommonModule } from "@angular/common";
import { catchError, filter, of, tap } from "rxjs";
import { HttpErrorResponse, HttpResponse } from "@angular/common/http";
import { ToastService } from "../../../ui-components/generic/toast-box/toast.service";
import { LatLngExpression } from "leaflet";

@Component({
  selector: "app-bivouac-form",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `<form
    [formGroup]="bivouacForm"
    (ngSubmit)="submit()"
    class="flex flex-col"
  >
    <div class="flex flex-col gap-4 mb-6">
      <label class="input input-bordered flex items-center gap-2">
        Name
        <input formControlName="name" type="text" class="grow" />
      </label>
      <label class="input input-bordered flex items-center gap-2">
        Description
        <input formControlName="description" type="text" class="grow" />
      </label>
      <select
        class="select select-bordered w-full max-w-xs"
        formControlName="type"
      >
        <option [ngValue]="null">Type</option>
        <option *ngFor="let type of bivouacTypes" [ngValue]="type">
          {{ type }}
        </option>
      </select>
      <select
        class="select select-bordered w-full max-w-xs"
        formControlName="material"
      >
        <option [ngValue]="null">Material</option>
        <option *ngFor="let material of bivouacMaterials" [ngValue]="material">
          {{ material }}
        </option>
      </select>
      <label class="input input-bordered flex items-center gap-2">
        Latitude
        <input
          formControlName="latitude"
          type="number"
          [step]="latLngPrecision"
          class="grow"
        />
      </label>
      <label class="input input-bordered flex items-center gap-2">
        Longitude
        <input
          formControlName="longitude"
          type="number"
          [step]="latLngPrecision"
          class="grow"
        />
      </label>
      <label class="input input-bordered flex items-center gap-2">
        Altitude
        <input
          formControlName="altitude"
          type="number"
          [step]="latLngPrecision"
          class="grow"
        />
      </label>
    </div>
    <button type="submit" class="btn btn-primary self-end">Submit</button>
  </form>`,
  styles: ``,
})
export class BivouacFormComponent implements OnInit {
  @Input() bivouac?: Bivouac;
  @Output() onSubmit = new EventEmitter();
  @Output() onCreate = new EventEmitter<string>();
  @Output() onUpdate = new EventEmitter<string>();

  latLngPrecision = 0.0001;

  bivouacForm: FormGroup<{
    name: FormControl<string>;
    description: FormControl<string | null>;
    type: FormControl<BivouacType | null>;
    material: FormControl<BivouacMaterial | null>;
    // image: FormControl<string | null>;
    latitude: FormControl<number | null>;
    longitude: FormControl<number | null>;
    altitude: FormControl<number | null>;
  }> = new FormGroup({
    name: new FormControl("", {
      nonNullable: true,
      validators: [Validators.required],
    }),
    description: new FormControl(),
    type: new FormControl(),
    material: new FormControl(),
    // image: new FormControl(),
    latitude: new FormControl(),
    longitude: new FormControl(),
    altitude: new FormControl(),
  });

  get bivouacTypes(): BivouacType[] {
    return bivouacTypes;
  }

  get bivouacMaterials(): BivouacMaterial[] {
    return bivouacMaterials;
  }

  /**
   * Parses the form into a new bivouac object, ready to be used for create
   * or update operations.
   */
  get parsedForm(): NewBivouac | null {
    const { name, ...optionalProps } = this.bivouacForm.value;
    if (!name) {
      return null;
    }

    const { latitude, longitude, altitude, ...partialData } = optionalProps;

    let latLng: LatLngExpression | undefined;
    // If at least one value has been set, we give a default to all other values,
    // to avoid losing data. Keep in mind that we are preventing this case by
    // validating user input form.
    // Todo validate latlng: if lat is set, then lng must be set and vice versa.
    // If altitude is set, both lat and lng must be set.
    if (latitude || longitude || altitude) {
      latLng = [latitude ?? 0, longitude ?? 0, altitude ?? undefined];
    }
    return {
      name,
      ...partialData,
      latLng: latLng,
    };
  }

  constructor(
    private bivouacsService: BivouacService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.prefillForm();
  }

  submit = () => {
    if (!this.bivouacForm.valid || !this.parsedForm) {
      this.toastService.createToast("Invalid form", "error");
      return;
    }

    if (this.isEdit()) {
      this.updateBivouac(this.bivouac._id, this.parsedForm).subscribe();
    } else {
      this.createBivouac(this.parsedForm).subscribe();
    }
  };

  createBivouac = (bivouac: NewBivouac) =>
    this.bivouacsService.createBivouac(bivouac).pipe(
      catchError((res) => this.catchNonHttpError(res)),
      filter((res) => this.filterHttpError(res)),
      tap((res) => {
        // ? This doesn't throw error in typescript version 5.5.2. (in fact it
        // shouldn't throw - see the same case in updateBivouac)
        // Todo remove ts-ignore comments after updating angular to a version
        // that allows using typescript 5.5.2 or more.
        // @ts-ignore
        if (res.body?.status === "success") {
          // @ts-ignore
          const { id } = res.body.data;
          this.toastService.createToast("Bivouac created", "success");
          this.onSubmit.emit();
          this.onCreate.emit(id);
        }
      })
    );

  updateBivouac = (bivouacId: string, bivouac: NewBivouac) =>
    this.bivouacsService.updateBivouac(bivouacId, bivouac).pipe(
      catchError((res) => this.catchNonHttpError(res)),
      filter((res) => this.filterHttpError(res)),
      tap((res) => {
        if (res.status === 204) {
          this.toastService.createToast("Bivouac updated", "success");
          this.onSubmit.emit();
          this.onUpdate.emit();
        }
      })
    );

  private isEdit(): this is { bivouac: Bivouac & { _id: string } } {
    return !!this.bivouac?._id;
  }

  private catchNonHttpError = (error: any) => {
    if (error instanceof HttpErrorResponse) {
      return of(error);
    }
    throw error;
  };

  private filterHttpError = (
    res: HttpResponse<any> | HttpErrorResponse
  ): res is Exclude<typeof res, HttpErrorResponse> => {
    const isError = res instanceof HttpErrorResponse;
    if (isError) {
      this.toastService.createToast("Unknown server error", "error");
    }
    return !isError;
  };

  /**
   * If this is an update form, prefills the form with bivouac data.
   * Otherwise, the form is left empty.
   */
  private prefillForm = () => {
    if (this.isEdit()) {
      // patchValue should correctly handle all cases except for latLng
      this.bivouacForm.patchValue({
        ...this.bivouac,
        latitude: this.bivouac?.latLng?.[0],
        longitude: this.bivouac?.latLng?.[1],
        altitude: this.bivouac?.latLng?.[2],
      });
    }
  };
}
