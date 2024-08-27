import { Component } from "@angular/core";
import { BivouacsMapService } from "../bivouacs-map.service";
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
      <div>Only open bivouacs</div>
      <input
        type="checkbox"
        class="toggle"
        [(ngModel)]="filters.onlyOpenBivouacs"
      />
    </div>
    <div class="flex flex-row self-end gap-4">
      <!-- todo: handle this outside this component. Ideally this form shouldn't know
        whether it's called from a modal or not. -->
      <button type="button" class="btn btn-error" (click)="closeModal()">
        Cancel
      </button>
      <button type="button" class="btn btn-primary" (click)="filterBivouacs()">
        Submit
      </button>
    </div>
  </div>`,
  styles: ``,
})
export class MapFiltersComponent {
  get filters() {
    return this.bivouacsMapService.filters;
  }

  constructor(
    private bivouacsMapService: BivouacsMapService,
    private modalService: ModalService
  ) {}

  closeModal = () => {
    this.modalService.close();
  };

  filterBivouacs = () => {
    this.bivouacsMapService.filterBivouacs();
    this.modalService.close();
  };
}
