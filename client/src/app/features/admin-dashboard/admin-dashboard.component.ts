import { Component, OnInit, ViewChild } from "@angular/core";
import { Bivouac } from "../../types/bivouac.type";
import { BivouacService } from "../../services/bivouac.service";
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
import { ErrorService } from "../../services/error.service";
import { FormsModule } from "@angular/forms";
import { TableComponent } from "../../ui-components/generic/table/table.component";
import { TableColumn } from "../../ui-components/generic/table/table.type";
import { TranslocoService } from "@jsverse/transloco";
import { StartingSpotsFormComponent } from "./starting-spots-form/starting-spots-form.component";

@Component({
  selector: "app-admin-dashboard",
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent, TableComponent],
  template: `
    <div class="sm:min-w-96 overflow-x-auto pt-4 pb-16">
      <div class="flex justify-end gap-4 mb-4 mx-4">
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
      <app-table
        [items]="bivouacs"
        [beforeCell]="beforeCell"
        [afterCell]="afterCell"
        [pageSize]="pageSize"
        [columns]="columns"
        [isLoading]="isLoading"
      >
        <ng-template #beforeCell let-bivouac>
          <td before class="w-16 flex justify-center items-center">
            <input
              type="checkbox"
              class="checkbox"
              [checked]="bivouacIsSelected(bivouac)"
              (change)="toggleBivouacSelection(bivouac)"
            /></td
        ></ng-template>
        <ng-template #afterCell let-bivouac>
          <td after>
            <button (click)="openUpdateModal(bivouac)">
              <i class="material-symbols-outlined">edit</i></button
            ><button (click)="openStartingSpotsModal(bivouac)">
              <i class="material-symbols-outlined">hiking</i></button
            ><button (click)="openDeleteModal(bivouac)">
              <i class="material-symbols-outlined">delete</i>
            </button>
          </td></ng-template
        ></app-table
      >
    </div>
  `,
  styles: ``,
})
export class AdminDashboardComponent implements OnInit {
  isLoading = true;
  bivouacs: Bivouac[] = [];
  pageSize = 50;

  columns: TableColumn<Bivouac>[] = [
    { prop: "name", name: "Name", filter: true, defaultSort: true },
    {
      prop: "type",
      name: "Type",
      filter: true,
      style: { textTransform: "capitalize" },
      transform: (type) =>
        this.translationTransform(type as string, "bivouacs.types"),
    },
    {
      prop: "material",
      name: "Material",
      hidden: false,
      filter: true,
      style: { textTransform: "capitalize" },
      transform: (material) =>
        this.translationTransform(material as string, "bivouacs.materials"),
    },
  ];

  selectedBivouacsIds: Set<Bivouac> = new Set();

  constructor(
    private bivouacService: BivouacService,
    private toastService: ToastService,
    private modalService: ModalService,
    private errorService: ErrorService,
    private translocoService: TranslocoService
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
      this.stopLoading();
    });
  }

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

  openStartingSpotsModal = (bivouac: Bivouac) => {
    const newComponent = this.modalService.openModal(
      StartingSpotsFormComponent,
      {
        bivouac,
      }
    );
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
      onConfirmObs: () => this.deleteBivouac(bivouac),
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
      onConfirmObs: () => this.deleteSelectedBivouacs(),
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
    // Todo improve api calls by using mongodb findOneAndUpdate: that allows us
    // to get the updated bivouac without having to call the get api.
    this.bivouacService.getBivouacById(bivouacId).pipe(
      tap((res) => {
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
        this.refreshPagination();
      }),
      catchError((res) => this.errorService.catchAll(res, true))
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
   * Triggers items setter. Sometimes we have to trigger it manually (e.g. when
   * altering the items array with .push).
   */
  private refreshPagination = () => {
    this.bivouacs = this.bivouacs.slice();
  };

  /**
   * Removes bivouac from the client's bivouacs list.
   * @param bivouac - bivouac to remove
   */
  private removeBivouacFromList = (bivouac: Bivouac) => {
    this.bivouacs = this.bivouacs.filter((b) => b !== bivouac);
    this.deselectBivouac(bivouac);
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

  private translationTransform = (item: string, translationPrefix: string) =>
    item ? this.translocoService.translate(translationPrefix + "." + item) : "";

  private stopLoading = () => {
    this.isLoading = false;
  };
}
