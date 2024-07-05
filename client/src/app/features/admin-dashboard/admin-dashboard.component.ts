import { Component, OnInit, ViewChild } from "@angular/core";
import { Bivouac } from "../../types/bivouac.type";
import { BivouacService } from "../../bivouac.service";
import { CommonModule } from "@angular/common";
import { PaginationComponent } from "../../ui-components/generic/pagination/pagination.component";
import { ToastService } from "../../ui-components/generic/toast-box/toast.service";
import { HttpErrorResponse } from "@angular/common/http";
import { ModalService } from "../../ui-components/generic/modal/modal.service";
import { catchError, forkJoin, map, tap } from "rxjs";

@Component({
  selector: "app-admin-dashboard",
  standalone: true,
  imports: [CommonModule, PaginationComponent],
  template: `
    <div class="min-w-96 overflow-x-auto pt-4 pb-16">
      <div class="flex justify-end gap-4 mb-4">
        <button class="btn btn-primary">Add bivouac</button>
        <button
          (click)="openBulkDeleteModal()"
          class="btn btn-error"
          [disabled]="selectedBivouacsIds.size < 1"
        >
          Delete bulk
        </button>
      </div>
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
              <input
                type="checkbox"
                class="checkbox"
                [checked]="bivouacIsSelected(bivouac)"
                (change)="toggleBivouacSelection(bivouac)"
              />
            </td>
            <td *ngFor="let col of columns" class="flex-1">
              {{ bivouac[col.prop] }}
            </td>
            <td>
              <button><i class="material-icons">edit</i></button
              ><button (click)="openDeleteModal(bivouac)">
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

  selectedBivouacsIds: Set<Bivouac> = new Set();

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

  private deleteBivouac = (bivouac: Bivouac) =>
    this.bivouacService.deleteBivouac(bivouac._id).pipe(
      map((res) => {
        if (res.status !== 204) {
          const errorMessage = "Unknown error while deleting bivouac.";
          console.error(errorMessage);
          this.toastService.createToast(errorMessage, "error");
          return res;
        }
        this.toastService.createToast(
          "Bivouac deleted successfully.",
          "success"
        );
        this.bivouacs = this.bivouacs.filter((b) => b !== bivouac);
        this.deselectBivouac(bivouac);
        setTimeout(() => {
          this.pagination.setPage(this.pagination.pageNumber);
        }, 0);
        return res;
      }),
      catchError((err) => {
        let errorMessage = "Unknown error while deleting bivouac.";
        if (err instanceof HttpErrorResponse && err.status === 404) {
          errorMessage =
            "Oops, bivouac has already been deleted. Refresh the page to sync table data.";
        }
        console.error(err);
        this.toastService.createToast(errorMessage, "error", 5000);
        return err;
      })
    );

  openDeleteModal = (bivouac: Bivouac) => {
    this.modalService.openConfirmModal({
      title: "Are you sure you want to delete this bivouac?",
      content: bivouac.name,
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      onConfirm: () => this.deleteBivouac(bivouac).subscribe(),
    });
  };

  openBulkDeleteModal = () => {
    const bivouacsList = Array.from(this.selectedBivouacsIds).reduce(
      (acc, bivouac, i) => {
        return acc.concat(i > 0 ? "\n" : "", bivouac.name);
      },
      ""
    );
    this.modalService.openConfirmModal({
      title: "Are you sure you want to delete these bivouacs?",
      content: bivouacsList,
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      onConfirm: () => {
        this.deleteSelectedBivouacs().subscribe();
      },
    });
  };

  private deleteSelectedBivouacs = () => {
    return forkJoin(
      Array.from(this.selectedBivouacsIds).map((bivouac) =>
        this.bivouacService.deleteBivouac(bivouac._id).pipe(
          catchError((err) => {
            // Todo handle errors, maybe save info about which bivouacs failed to be deleted
            return err;
          })
        )
      )
    ).pipe(
      tap(() => {
        this.bivouacs = this.bivouacs.filter(
          (b) => !this.selectedBivouacsIds.has(b)
        );
        this.deselectAllBivouacs();
        setTimeout(() => {
          this.pagination.setPage(this.pagination.pageNumber);
        }, 0);
      })
    );
  };

  bivouacIsSelected = (bivouac: Bivouac) => {
    return this.selectedBivouacsIds.has(bivouac);
  };

  selectBivouac = (bivouac: Bivouac) => {
    this.selectedBivouacsIds.add(bivouac);
  };

  deselectBivouac = (bivouac: Bivouac) => {
    this.selectedBivouacsIds.delete(bivouac);
  };

  deselectAllBivouacs = () => {
    this.selectedBivouacsIds.clear();
  };

  toggleBivouacSelection = (bivouac: Bivouac) => {
    if (this.bivouacIsSelected(bivouac)) {
      this.deselectBivouac(bivouac);
    } else {
      this.selectBivouac(bivouac);
    }
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
