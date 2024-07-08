import { Component, OnInit, ViewChild } from "@angular/core";
import { Bivouac } from "../../types/bivouac.type";
import { BivouacService } from "../../bivouac.service";
import { CommonModule } from "@angular/common";
import { PaginationComponent } from "../../ui-components/generic/pagination/pagination.component";
import { ToastService } from "../../ui-components/generic/toast-box/toast.service";
import { HttpErrorResponse } from "@angular/common/http";
import { ModalService } from "../../ui-components/generic/modal/modal.service";
import {
  Observable,
  catchError,
  concatMap,
  filter,
  forkJoin,
  map,
  take,
  tap,
} from "rxjs";
import { BivouacFormComponent } from "./bivouac-form/bivouac-form.component";
import { ErrorService } from "../../error.service";

@Component({
  selector: "app-admin-dashboard",
  standalone: true,
  imports: [CommonModule, PaginationComponent],
  template: `
    <div class="min-w-96 overflow-x-auto pt-4 pb-16">
      <div class="flex justify-end gap-4 mb-4">
        <button class="btn btn-primary" (click)="openCreateModal()">
          Add bivouac
        </button>
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
        [(pageNumber)]="pageNumber"
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
              <button (click)="openUpdateModal(bivouac)">
                <i class="material-icons">edit</i></button
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
        [(pageNumber)]="pageNumber"
        (onPageChange)="setShownBivouacs($event)"
      ></app-pagination>
    </div>
  `,
  styles: ``,
})
export class AdminDashboardComponent implements OnInit {
  bivouacs: Bivouac[] = [];
  shownBivouacs: Bivouac[] = [];

  pageNumber = 1;
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
    private modalService: ModalService,
    private errorService: ErrorService
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

  sortBivouacs = (prop: keyof Bivouac, ignoreReverse = false) => {
    const reverseSort = ignoreReverse
      ? this.reverseSort
      : this.currentSortProp === prop && !this.reverseSort;
    this.sortTableItems(prop, reverseSort);
    this.currentSortProp = prop;
    this.reverseSort = reverseSort;
    // 0s timeout makes sure items property of pagination component is populated with bivouacs.
    setTimeout(() => {
      this.pagination.setPage(1);
    }, 0);
  };

  openCreateModal = () => {
    const newComponent = this.modalService.openModal(BivouacFormComponent);
    newComponent.instance.onCreate
      .pipe(
        concatMap((bivouacId) => this.refreshAfterCreateOrUpdate(bivouacId)),
        take(1)
      )
      .subscribe(() => {
        this.modalService.close();
      });
  };

  openUpdateModal = (bivouac: Bivouac) => {
    const newComponent = this.modalService.openModal(BivouacFormComponent, {
      bivouac,
    });
    newComponent.instance.onUpdate
      .pipe(
        concatMap(() => this.refreshAfterCreateOrUpdate(bivouac._id, bivouac)),
        take(1)
      )
      .subscribe(() => {
        this.modalService.close();
      });
  };

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

  toggleBivouacSelection = (bivouac: Bivouac) => {
    if (this.bivouacIsSelected(bivouac)) {
      this.deselectBivouac(bivouac);
    } else {
      this.selectBivouac(bivouac);
    }
  };

  bivouacIsSelected = (bivouac: Bivouac) => {
    return this.selectedBivouacsIds.has(bivouac);
  };

  /**
   * Refresh bivouacs list after create or update. The new/updated bivouac
   * is fetched from the server and added to the list, to avoid refreshing
   * the whole list data.
   * @param bivouacId
   * @param bivouac Pass this only for update. Leave undefined for create.
   * @returns Observable
   */
  private refreshAfterCreateOrUpdate = (
    bivouacId: string,
    bivouac?: Bivouac
  ): Observable<any> =>
    this.bivouacService.getBivouacById(bivouacId).pipe(
      catchError((res) => this.errorService.catchNonHttpError(res)),
      filter((res) => this.errorService.filterHttpError(res)),
      tap((res) => {
        // ? This doesn't throw error in typescript version 5.5.2. (in fact it
        // shouldn't throw - see the same case in updateBivouac)
        // Todo remove ts-ignore comments after updating angular to a version
        // that allows using typescript 5.5.2 or more.
        // @ts-ignore
        if (res.status !== 200 || res.body?.status !== "success") {
          const errorMessage = "Unknown error while getting bivouac.";
          console.error(errorMessage);
          this.toastService.createToast(errorMessage, "error");
          return;
        }
        // Todo use ngZone to avoid refreshing view in the middle of an update
        if (bivouac) {
          this.removeBivouacFromList(bivouac);
        }
        // @ts-ignore
        this.bivouacs.push(res.body.data);
        this.softRefreshPage(true);
      })
    );

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
        this.removeBivouacFromList(bivouac);
        this.softRefreshPage();
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

  /**
   * Removes bivouac from the client's bivouacs list.
   * @param bivouac - bivouac to remove
   */
  private removeBivouacFromList = (bivouac: Bivouac) => {
    this.bivouacs = this.bivouacs.filter((b) => b !== bivouac);
    this.deselectBivouac(bivouac);
  };

  /**
   * Refreshes the current pagination page. "Soft" means
   * that we are not refetching the list of items from the backend.
   * @param sort - whether to sort the bivouacs
   */
  private softRefreshPage = (sort: boolean = false) => {
    setTimeout(() => {
      if (sort) {
        this.sortTableItems();
      }
      this.pagination.setPage(this.pagination.pageNumber);
    }, 0);
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

  private selectBivouac = (bivouac: Bivouac) => {
    this.selectedBivouacsIds.add(bivouac);
  };

  private deselectBivouac = (bivouac: Bivouac) => {
    this.selectedBivouacsIds.delete(bivouac);
  };

  private deselectAllBivouacs = () => {
    this.selectedBivouacsIds.clear();
  };

  private sortTableItems = (
    prop: string = this.currentSortProp ?? this.defaultSortProp,
    reverse: boolean = this.reverseSort
  ) => {
    this.sortItems(this.bivouacs, prop, reverse);
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
