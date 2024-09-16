import { Component } from "@angular/core";
import { CabinsMapService } from "../cabins-map.service";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ModalService } from "../../../ui-components/generic/modal/modal.service";

@Component({
  selector: "app-map-filters",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: ` <div class="flex flex-col">
    <h3 class="font-lg font-bold mb-4">Filters</h3>
    <div class="flex flex-row gap-4 mb-6">
      <div>Only open cabins</div>
      <input
        type="checkbox"
        class="toggle"
        [(ngModel)]="filters.onlyOpenCabins"
      />
    </div>
    <div class="flex flex-row self-end gap-4">
      <!-- todo: handle this outside this component. Ideally this form shouldn't know
        whether it's called from a modal or not. -->
      <button type="button" class="btn btn-error" (click)="closeModal()">
        Cancel
      </button>
      <button type="button" class="btn btn-primary" (click)="filterCabins()">
        Submit
      </button>
    </div>
  </div>`,
  styles: ``,
})
export class MapFiltersComponent {
  get filters() {
    return this.cabinsMapService.filters;
  }

  constructor(
    private cabinsMapService: CabinsMapService,
    private modalService: ModalService
  ) {}

  closeModal = () => {
    this.modalService.close();
  };

  filterCabins = () => {
    this.cabinsMapService.filterCabins();
    this.modalService.close();
  };
}
