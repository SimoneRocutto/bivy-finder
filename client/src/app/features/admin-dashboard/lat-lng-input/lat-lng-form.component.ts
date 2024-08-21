import { Component } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { FormInputComponent } from "../../../ui-components/generic/form-input/form-input.component";
import { TooltipComponent } from "../../../ui-components/generic/tooltip/tooltip.component";
import { LatLngExpression } from "leaflet";

export type LatLngFormGroup = FormGroup<{
  latitude: FormControl<number | null>;
  longitude: FormControl<number | null>;
  altitude: FormControl<number | null>;
}>;

@Component({
  selector: "app-lat-lng-form",
  standalone: true,
  imports: [ReactiveFormsModule, FormInputComponent, TooltipComponent],
  template: `
    <form [formGroup]="latLngFormGroup" class="flex flex-col gap-4">
      <app-tooltip label="Try pasting comma-separated coordinates here">
        <app-form-input
          label="latitude"
          [formGroup]="latLngFormGroup"
          formControlName="latitude"
          type="number"
          [step]="latLngPrecision"
          [min]="-90"
          [max]="90"
          (paste)="fillCoordinates($event)"
          (valueChange)="log($event)"
        ></app-form-input>
      </app-tooltip>
      <app-form-input
        label="longitude"
        [formGroup]="latLngFormGroup"
        formControlName="longitude"
        type="number"
        [step]="latLngPrecision"
        [min]="-180"
        [max]="180"
      ></app-form-input>
      <app-form-input
        label="altitude"
        [formGroup]="latLngFormGroup"
        formControlName="altitude"
        type="number"
        [step]="latLngPrecision"
      ></app-form-input>
    </form>
  `,
  styles: ``,
})
export class LatLngFormComponent {
  latLngFormGroup!: LatLngFormGroup;

  latLngPrecision = 0.0001;

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
      this.latLngFormGroup.patchValue({
        latitude,
        longitude,
        ...(altitude ? { altitude } : undefined),
      });
    }
  };

  createGroup = () => {
    this.latLngFormGroup = new FormGroup({
      latitude: new FormControl(null, [
        Validators.min(-90),
        Validators.max(90),
      ]) as FormControl<number | null>,
      longitude: new FormControl(null, [
        Validators.min(-180),
        Validators.max(180),
      ]) as FormControl<number | null>,
      altitude: new FormControl(),
    });
    return this.latLngFormGroup;
  };

  getValue = () => {
    this.latLngFormGroup.value;

    const { latitude, longitude, altitude } = this.latLngFormGroup.value;

    let parsedLatLng: LatLngExpression | null = null;
    // If lat is set, we give a default value to lng to avoid losing data and vice versa.
    // If altitude is set, both lat and lng must be set.
    // Todo Ideally these should already be numbers. Angular should make it so inputs type number always return
    // numbers. Unfortunately it isn't like this for dynamically typed inputs... There's an open issue about this on GitHub.
    if (latitude || longitude || altitude) {
      parsedLatLng = [
        latitude ? Number(latitude) : 0,
        longitude ? Number(longitude) : 0,
        altitude ? Number(altitude) : undefined,
      ];
    }
    return parsedLatLng;
  };

  log = (foo: any) => {
    console.log("lmao");
    console.log(foo);
  };
}
