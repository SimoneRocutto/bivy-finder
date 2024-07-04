import { Component, OnInit, ViewChild } from "@angular/core";
import { Bivouac } from "../../types/bivouac.type";
import { BivouacService } from "../../bivouac.service";
import { CommonModule } from "@angular/common";
import { PaginationComponent } from "../../ui-components/generic/pagination/pagination.component";
import { ToastService } from "../../ui-components/generic/toast-box/toast.service";
import { HttpErrorResponse } from "@angular/common/http";
import { ModalService } from "../../ui-components/generic/modal/modal.service";

@Component({
  selector: "app-admin-dashboard",
  standalone: true,
  imports: [CommonModule, PaginationComponent],
  template: `
    <div class="min-w-96 overflow-x-auto pt-4 pb-16">
      <app-pagination
        [items]="bivouacs"
        [pageSize]="pageSize"
        (onPageChange)="setShownBivouacs($event)"
      ></app-pagination>
      <table class="table table-zebra-zebra my-6">
        <thead>
          <tr class="flex flex-row">
            <th class="w-16"></th>
            <th *ngFor="let col of columns" class="flex-1">
              <button (click)="sortBivouacs(col.prop)">{{ col.name }}</button>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let bivouac of shownBivouacs" class="flex flex-row">
            <td class="w-16 flex justify-center items-center">
              <input type="checkbox" class="checkbox" />
            </td>
            <td *ngFor="let col of columns" class="flex-1">
              {{ bivouac[col.prop] }}
            </td>
            <td>
              <button><i class="material-icons">edit</i></button
              ><button (click)="openDeleteModal(bivouac._id)">
                <i class="material-icons">delete</i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <app-pagination
        [items]="bivouacs"
        [pageSize]="pageSize"
        (onPageChange)="setShownBivouacs($event)"
      ></app-pagination>
    </div>
  `,
  styles: ``,
})
export class AdminDashboardComponent implements OnInit {
  bivouacs: Bivouac[] = [];
  shownBivouacs: Bivouac[] = [];

  pageSize = 50;

  columns: { name: string; prop: keyof Bivouac }[] = [
    { name: "Name", prop: "name" },
    { name: "Type", prop: "type" },
  ];

  defaultSortProp: keyof Bivouac = "name";
  currentSortProp?: keyof Bivouac;
  reverseSort = false;

  constructor(
    private bivouacService: BivouacService,
    private toastService: ToastService,
    private modalService: ModalService
  ) {}

  @ViewChild(PaginationComponent) pagination!: PaginationComponent;

  ngOnInit() {
    this.bivouacService.getBivouacs().subscribe((res) => {
      if (res.body?.status !== "success") {
        // Todo handle bad response
        console.error("Unknown error while fetching bivouacs.");
        return;
      }
      this.bivouacs = res.body.data;
      this.sortBivouacs(this.defaultSortProp);
    });
  }

  setShownBivouacs = (bivouacs: Bivouac[]) => {
    this.shownBivouacs = bivouacs;
  };

  sortBivouacs = (prop: keyof Bivouac) => {
    const reverseSort = this.currentSortProp === prop && !this.reverseSort;
    this.sortItems(this.bivouacs, prop, reverseSort);
    this.currentSortProp = prop;
    this.reverseSort = reverseSort;
    // 0s timeout makes sure items property of pagination component is populated with bivouacs.
    setTimeout(() => {
      this.pagination.setPage(1);
    }, 0);
  };

  deleteBivouac = (bivouacId: string) => {
    this.bivouacService.deleteBivouac(bivouacId).subscribe(
      (res) => {
        if (res.status !== 204) {
          const errorMessage = "Unknown error while deleting bivouac.";
          console.error(errorMessage);
          this.toastService.createToast(errorMessage, "error");
          return;
        }
        this.toastService.createToast(
          "Bivouac deleted successfully.",
          "success"
        );
        this.bivouacs = this.bivouacs.filter((b) => b._id !== bivouacId);
        setTimeout(() => {
          this.pagination.setPage(this.pagination.pageNumber);
        }, 0);
      },
      (err) => {
        let errorMessage = "Unknown error while deleting bivouac.";
        if (err instanceof HttpErrorResponse && err.status === 404) {
          errorMessage =
            "Oops, bivouac has already been deleted. Refresh the page to sync table data.";
        }
        console.error(err);
        this.toastService.createToast(errorMessage, "error", 5000);
      }
    );
  };

  openDeleteModal = (bivouacId: string) => {
    this.modalService.openConfirmModal({
      title: "Are you sure you want to delete this bivouac?",
      content: "This action cannot be undone.",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      onConfirm: () => this.deleteBivouac(bivouacId),
    });
  };

  private sortItems = <T>(items: T[], prop: string, reverse: boolean = false) =>
    items.sort((a, b) => {
      let propA = a[prop];
      let propB = b[prop];
      if ([propA, propB].every((item) => typeof item !== "number")) {
        [propA, propB] = [propA, propB].map((item) =>
          (item ?? "").toString().toLowerCase()
        );
      }
      return ((propA ?? "") < (propB ?? "") ? -1 : 1) * (reverse ? -1 : 1);
    });
}
