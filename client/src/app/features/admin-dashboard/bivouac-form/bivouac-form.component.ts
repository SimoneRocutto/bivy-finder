import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import {
  FormControl,
  FormGroup,
  FormsModule,
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
import { ToastService } from "../../../ui-components/generic/toast-box/toast.service";
import { LatLngExpression } from "leaflet";
import { ErrorService } from "../../../error.service";
import { ModalService } from "../../../ui-components/generic/modal/modal.service";
import { ItemsListInputComponent } from "../../../ui-components/generic/items-list-input/items-list-input.component";
import { TooltipComponent } from "../../../ui-components/generic/tooltip/tooltip.component";
import { FormInputComponent } from "../../../ui-components/generic/form-input/form-input.component";

@Component({
  selector: "app-bivouac-form",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ItemsListInputComponent,
    TooltipComponent,
    FormInputComponent,
  ],
  template: `<form
    [formGroup]="bivouacForm"
    (ngSubmit)="submit()"
    class="flex flex-col"
  >
    <div class="flex flex-col gap-4 mb-6">
      <app-form-input
        label="name"
        [formGroup]="bivouacForm"
        formControlName="name"
      ></app-form-input>
      <textarea
        formControlName="description"
        class="textarea textarea-bordered grow"
        placeholder="Description"
      ></textarea>
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
      <app-tooltip label="Try pasting comma-separated coordinates here">
        <app-form-input
          label="latitude"
          [formGroup]="bivouacForm"
          formControlName="latitude"
          type="number"
          [step]="latLngPrecision"
          [min]="-90"
          [max]="90"
          (paste)="fillCoordinates($event)"
        ></app-form-input>
      </app-tooltip>
      <app-form-input
        label="longitude"
        [formGroup]="bivouacForm"
        formControlName="longitude"
        type="number"
        [step]="latLngPrecision"
        [min]="-180"
        [max]="180"
      ></app-form-input>
      <app-form-input
        label="altitude"
        [formGroup]="bivouacForm"
        formControlName="altitude"
        type="number"
        [step]="latLngPrecision"
      ></app-form-input>
      <div>
        <div class="mb-2">
          External Links ({{ bivouacForm.value.externalLinks?.length ?? 0 }}/{{
            maxExternalLinksCount
          }})
        </div>
        <app-items-list-input
          [items]="bivouacForm.value.externalLinks"
          [maxItems]="maxExternalLinksCount"
          [isLink]="true"
        ></app-items-list-input>
      </div>
      <div class="relative overflow-hidden">
        <div class="aspect-ratio-16-9"></div>
        <ng-template #noImage
          ><div
            class="absolute inset-0 flex flex-row justify-center items-center bg-gray-400"
          >
            <button
              (click)="fileUploader.click()"
              type="button"
              class="btn btn-primary"
            >
              <i class="material-symbols-outlined">upload</i>
            </button>
          </div></ng-template
        >
        <ng-container
          *ngIf="
            !imageWillBeDeleted && (temporaryImageUrl || bivouac?.imageUrl);
            else noImage
          "
        >
          <ng-container *ngIf="!imageLoaded"
            ><div
              class="absolute inset-0 flex flex-row justify-center items-center"
            >
              <div class="skeleton absolute inset-0"></div>
              @defer(on timer(400ms)) {
              <div class="loading loading-dots loading-lg"></div>
              }
            </div></ng-container
          >
          <img
            [src]="temporaryImageUrl ?? bivouac?.imageUrl"
            [ngClass]="{ invisible: !imageLoaded }"
            alt="Bivouac image"
            (load)="onImageLoaded()"
            class="absolute inset-0"
          />
          <div
            class="absolute inset-0 z-10 flex flex-row justify-center items-center gap-2 transition-opacity opacity-0 hover:opacity-100"
          >
            <button
              (click)="fileUploader.click()"
              type="button"
              class="btn btn-primary"
            >
              <i class="material-symbols-outlined">upload</i>
            </button>
            <button (click)="removeImage()" type="button" class="btn btn-error">
              <i class="material-symbols-outlined">delete</i>
            </button>
          </div>
        </ng-container>
      </div>
      <input
        #fileUploader
        type="file"
        accept="image/*"
        (change)="onFileChange($event)"
        class="hidden"
      />
    </div>
    <div class="flex flex-row self-end gap-4">
      <!-- todo: handle this outside this component. Ideally this form shouldn't know
      whether it's called from a modal or not. -->
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
        [disabled]="!bivouacForm.valid || isSubmitting"
        class="btn btn-primary relative"
      >
        <div [ngClass]="{ invisible: isSubmitting }">Submit</div>
        <span
          *ngIf="isSubmitting"
          class="loading loading-dots loading-md absolute"
        ></span>
      </button>
    </div>
  </form>`,
  styles: ``,
})
export class BivouacFormComponent implements OnInit {
  @Input() bivouac?: Bivouac;
  @Output() onSubmit = new EventEmitter();
  @Output() onCreate = new EventEmitter<string>();
  @Output() onUpdate = new EventEmitter<string>();

  isSubmitting = false;

  imageLoaded = false;

  latLngPrecision = 0.0001;

  maxExternalLinksCount = 5;

  newLink: string = "";

  bivouacForm: FormGroup<{
    name: FormControl<string>;
    description: FormControl<string | null>;
    type: FormControl<BivouacType | null>;
    material: FormControl<BivouacMaterial | null>;
    latitude: FormControl<number | null>;
    longitude: FormControl<number | null>;
    altitude: FormControl<number | null>;
    externalLinks: FormControl<string[] | null>;
  }> = new FormGroup({
    name: new FormControl("", {
      nonNullable: true,
      validators: [Validators.required],
    }),
    description: new FormControl(),
    type: new FormControl(),
    material: new FormControl(),
    latitude: new FormControl(null, [
      Validators.min(-90),
      Validators.max(90),
    ]) as FormControl<number | null>,
    longitude: new FormControl(null, [
      Validators.min(-180),
      Validators.max(180),
    ]) as FormControl<number | null>,
    altitude: new FormControl(),
    externalLinks: new FormControl([] as string[]),
  });

  imageFile?: File;
  temporaryImageUrl?: ArrayBuffer | string;
  imageWillBeDeleted = false;

  get name() {
    return this.bivouacForm.get("name")!;
  }

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
    // Props that aren't altered in the form. We have to preserve them.
    const nonFormProps = ["imageName"];
    const nonFormPropsObj = nonFormProps.reduce((acc, curr) => {
      const propValue = this.bivouac?.[curr];
      if (propValue) {
        acc[curr] = propValue;
      }
      return acc;
    }, {});

    const { name, ...optionalProps } = this.bivouacForm.value;
    if (!name) {
      return null;
    }

    const { latitude, longitude, altitude, externalLinks, ...partialData } =
      optionalProps;

    let latLng: LatLngExpression | null = null;
    // If lat is set, we give a default value to lng to avoid losing data and vice versa.
    // If altitude is set, both lat and lng must be set.
    if (latitude || longitude || altitude) {
      latLng = [latitude ?? 0, longitude ?? 0, altitude ?? undefined];
    }

    return {
      name,
      ...partialData,
      ...nonFormPropsObj,
      // Sending null imageName will delete both the image file and the property.
      ...(this.imageWillBeDeleted ? { imageName: null } : {}),
      latLng: latLng,
      // Delete prop if array is empty.
      externalLinks: externalLinks?.length === 0 ? null : externalLinks,
    };
  }

  constructor(
    private bivouacsService: BivouacService,
    private toastService: ToastService,
    private errorService: ErrorService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.prefillForm();
  }

  submit = () => {
    if (!this.bivouacForm.valid || !this.parsedForm) {
      this.toastService.createToast("Invalid form", "error");
      return;
    }

    this.isSubmitting = true;
    (this.isEdit()
      ? this.updateBivouac(this.bivouac._id, this.parsedForm)
      : this.createBivouac(this.parsedForm)
    )
      .pipe(
        catchError((e) => {
          console.error(e);
          // Re-enable form interaction if the operation failed.
          this.isSubmitting = false;
          this.toastService.createToast("Unknown error", "error");
          // Todo check whether this makes sense.
          return of(e);
        })
      )
      .subscribe();
  };

  createBivouac = (bivouac: NewBivouac) =>
    this.bivouacsService.createBivouac(bivouac, this.imageFile).pipe(
      catchError((res) => this.errorService.catchNonHttpError(res)),
      filter((res) => this.errorService.filterHttpError(res)),
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
    this.bivouacsService.updateBivouac(bivouacId, bivouac, this.imageFile).pipe(
      catchError((res) => this.errorService.catchNonHttpError(res)),
      filter((res) => this.errorService.filterHttpError(res)),
      tap((res) => {
        if (res.status === 204) {
          this.toastService.createToast("Bivouac updated", "success");
          this.onSubmit.emit();
          this.onUpdate.emit();
        }
      })
    );

  /**
   * Pasting a comma-separated list of coordinates in the latitude input
   * will fill the coordinates form inputs. Altitude is filled only if
   * 3 coordinates are provided.
   * @param event Paste event
   */
  fillCoordinates = (event: ClipboardEvent) => {
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
      this.bivouacForm.patchValue({
        latitude,
        longitude,
        ...(altitude ? { altitude } : undefined),
      });
    }
  };

  onFileChange = (event: Event) => {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    if (file) {
      this.imageFile = file;
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = (e) => {
        this.temporaryImageUrl = e.target?.result ?? undefined;
        this.imageWillBeDeleted = false;
      };
    }
  };

  removeImage = () => {
    this.temporaryImageUrl = undefined;
    this.imageWillBeDeleted = true;
  };

  pushLink = () => {
    if (!this.newLink) return;
    this.bivouacForm.get("externalLinks")?.value?.push(this.newLink);
    this.newLink = "";
  };

  closeModal = () => {
    this.modalService.close();
  };

  onImageLoaded = () => {
    this.imageLoaded = true;
  };

  private isEdit(): this is { bivouac: Bivouac & { _id: string } } {
    return !!this.bivouac?._id;
  }

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
        externalLinks: this.bivouac.externalLinks ?? [],
      });
    }
  };
}
