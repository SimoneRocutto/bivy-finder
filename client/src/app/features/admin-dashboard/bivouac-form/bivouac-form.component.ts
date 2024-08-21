import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { BivouacService } from "../../../services/bivouac.service";
import {
  Bivouac,
  BivouacMaterial,
  BivouacType,
  NewBivouac,
  bivouacMaterials,
  bivouacTypes,
} from "../../../types/bivouac.type";
import { CommonModule } from "@angular/common";
import { catchError, tap } from "rxjs";
import { ToastService } from "../../../ui-components/generic/toast-box/toast.service";
import { ErrorService } from "../../../services/error.service";
import { ModalService } from "../../../ui-components/generic/modal/modal.service";
import { ItemsListInputComponent } from "../../../ui-components/generic/items-list-input/items-list-input.component";
import { TooltipComponent } from "../../../ui-components/generic/tooltip/tooltip.component";
import { FormInputComponent } from "../../../ui-components/generic/form-input/form-input.component";
import {
  LatLngFormComponent,
  LatLngFormGroup,
} from "../lat-lng-input/lat-lng-form.component";

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
    LatLngFormComponent,
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
      <app-lat-lng-form></app-lat-lng-form>
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
  @ViewChild(LatLngFormComponent, { static: true })
  latLngForm!: LatLngFormComponent;
  @Input() bivouac?: Bivouac;
  @Output() onSubmit = new EventEmitter();
  @Output() onCreate = new EventEmitter<string>();
  @Output() onUpdate = new EventEmitter<string>();

  isSubmitting = false;

  imageLoaded = false;

  latLngPrecision = 0.0001;

  maxExternalLinksCount = 5;

  newLink: string = "";

  bivouacForm!: FormGroup<{
    name: FormControl<string>;
    description: FormControl<string | null>;
    type: FormControl<BivouacType | null>;
    material: FormControl<BivouacMaterial | null>;
    latLng: LatLngFormGroup;
    externalLinks: FormControl<string[] | null>;
  }>;

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

    const { latLng, externalLinks, ...partialData } = optionalProps;

    const parsedLatLng = this.latLngForm.getValue();

    return {
      name,
      ...partialData,
      ...nonFormPropsObj,
      // Sending null imageName will delete both the image file and the property.
      ...(this.imageWillBeDeleted ? { imageName: null } : {}),
      latLng: parsedLatLng,
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
    this.bivouacForm = new FormGroup({
      name: new FormControl("", {
        nonNullable: true,
        validators: [Validators.required],
      }),
      description: new FormControl(),
      type: new FormControl(),
      material: new FormControl(),
      latLng: this.latLngForm.createGroup(),
      externalLinks: new FormControl([] as string[]),
    });
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
        catchError((e) =>
          this.errorService
            .catchAll(e, true)
            .pipe(tap(() => (this.isSubmitting = false)))
        )
      )
      .subscribe();
  };

  createBivouac = (bivouac: NewBivouac) =>
    this.bivouacsService.createBivouac(bivouac, this.imageFile).pipe(
      tap((res) => {
        if (res.body?.status === "success") {
          const { id } = res.body.data;
          this.toastService.createToast("Bivouac created", "success");
          this.onSubmit.emit();
          this.onCreate.emit(id);
        }
      })
    );

  updateBivouac = (bivouacId: string, bivouac: NewBivouac) =>
    this.bivouacsService.updateBivouac(bivouacId, bivouac, this.imageFile).pipe(
      tap((res) => {
        if (res.status === 204) {
          this.toastService.createToast("Bivouac updated", "success");
          this.onSubmit.emit();
          this.onUpdate.emit();
        }
      })
    );

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
      const { latLng, ...otherProps } = this.bivouac;
      this.bivouacForm.patchValue({
        ...otherProps,
        externalLinks: this.bivouac.externalLinks ?? [],
      });
      this.latLngForm.latLngFormGroup.patchValue({
        latitude: latLng?.[0],
        longitude: latLng?.[1],
        altitude: latLng?.[2],
      });
    }
  };
}
