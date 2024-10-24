import { Component, OnInit, ViewChild } from "@angular/core";
import { Cabin } from "../../types/cabin.type";
import { CabinService } from "../../services/cabin.service";
import { CommonModule } from "@angular/common";
import { PaginationComponent } from "../../ui-components/generic/pagination/pagination.component";
import { ToastService } from "../../ui-components/generic/toast-box/toast.service";
import { HttpErrorResponse } from "@angular/common/http";
import { ModalService } from "../../ui-components/generic/modal/modal.service";
import {
  Observable,
  catchError,
  concatMap,
  forkJoin,
  map,
  take,
  tap,
} from "rxjs";
import { CabinFormComponent } from "./cabin-form/cabin-form.component";
import { ErrorService } from "../../services/error.service";
import { FormsModule } from "@angular/forms";
import { TableComponent } from "../../ui-components/generic/table/table.component";
import { TableColumn } from "../../ui-components/generic/table/table.type";
import { TranslocoService } from "@jsverse/transloco";
import { StartingSpotsFormComponent } from "./starting-spots-form/starting-spots-form.component";
import { AuthService } from "../../services/auth.service";
import { RouterModule } from "@angular/router";
import { CabinsMapService } from "../cabins-map/cabins-map.service";

@Component({
  selector: "app-cabins-list",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PaginationComponent,
    TableComponent,
    RouterModule,
  ],
  template: `
    <div class="sm:min-w-96 overflow-x-auto pt-4 pb-16">
      <div *ngIf="userIsAdmin" class="flex justify-end gap-4 mb-4 mx-4">
        <button class="btn btn-primary" (click)="openCreateModal()">
          Add cabin
        </button>
        <button
          (click)="openBulkDeleteModal()"
          class="btn btn-error"
          [disabled]="selectedCabinsIds.size < 1"
        >
          Delete bulk
        </button>
      </div>
      <app-table
        [items]="cabins"
        [beforeCell]="userIsAdmin ? beforeCell : null"
        [afterCell]="afterCell"
        [pageSize]="pageSize"
        [columns]="columns"
        [isLoading]="isLoading"
      >
        <ng-template #beforeCell let-cabin>
          <td before class="w-16 flex justify-center items-center">
            <input
              type="checkbox"
              class="checkbox"
              [checked]="cabinIsSelected(cabin)"
              (change)="toggleCabinSelection(cabin)"
            /></td
        ></ng-template>
        <ng-template #afterCell let-cabin>
          <td after>
            <ng-container *ngIf="userIsAdmin">
              <button (click)="openUpdateModal(cabin)">
                <i class="material-symbols-outlined">edit</i></button
              ><button (click)="openStartingSpotsModal(cabin)">
                <i class="material-symbols-outlined">hiking</i></button
              ><button (click)="openDeleteModal(cabin)">
                <i class="material-symbols-outlined">delete</i>
              </button>
            </ng-container>
            <a [routerLink]="getCabinLink(cabin._id)">
              <button>
                <i class="material-symbols-outlined">map</i>
              </button>
            </a>
          </td></ng-template
        ></app-table
      >
    </div>
  `,
  styles: ``,
})
export class CabinsListComponent implements OnInit {
  userIsAdmin = false;
  isLoading = true;
  cabins: Cabin[] = [];
  pageSize = 50;

  columns: TableColumn<Cabin>[] = [
    { prop: "name", name: "Name", filter: true, defaultSort: true },
    {
      prop: "type",
      name: "Type",
      filter: true,
      style: { textTransform: "capitalize" },
      transform: (type) =>
        this.translationTransform(type as string, "cabins.types"),
    },
    {
      prop: "material",
      name: "Material",
      hidden: false,
      filter: true,
      style: { textTransform: "capitalize" },
      transform: (material) =>
        this.translationTransform(material as string, "cabins.materials"),
    },
  ];

  selectedCabinsIds: Set<Cabin> = new Set();

  constructor(
    private authService: AuthService,
    private cabinService: CabinService,
    private toastService: ToastService,
    private modalService: ModalService,
    private errorService: ErrorService,
    private translocoService: TranslocoService,
    private cabinsMapService: CabinsMapService
  ) {}

  @ViewChild(PaginationComponent) pagination!: PaginationComponent;

  ngOnInit() {
    this.userIsAdmin = this.authService.loggedUser.role === "admin";

    this.cabinService.getCabins().subscribe((res) => {
      if (res.body?.status !== "success") {
        // Todo handle bad response
        console.error("Unknown error while fetching cabins.");
        return;
      }
      this.cabins = res.body.data;
      this.stopLoading();
    });
  }

  getCabinLink = (id: string) => this.cabinsMapService.getCabinLink(id, false);

  openCreateModal = () => {
    const newComponent = this.modalService.openModal(
      CabinFormComponent,
      {},
      { fullOnSmallScreen: true }
    );
    newComponent.content.instance.onCreate
      .pipe(
        concatMap((cabinId) => this.refreshAfterCreateOrUpdate(cabinId)),
        take(1)
      )
      .subscribe(() => {
        this.modalService.close();
      });
  };

  openUpdateModal = (cabin: Cabin) => {
    const newComponent = this.modalService.openModal(
      CabinFormComponent,
      {
        cabin,
      },
      { fullOnSmallScreen: true }
    );
    newComponent.content.instance.onUpdate
      .pipe(
        concatMap(() => this.refreshAfterCreateOrUpdate(cabin._id, cabin)),
        take(1)
      )
      .subscribe(() => {
        this.modalService.close();
      });
  };

  openStartingSpotsModal = (cabin: Cabin) => {
    const newComponent = this.modalService.openModal(
      StartingSpotsFormComponent,
      {
        cabin,
      },
      { fullOnSmallScreen: true }
    );
    newComponent.content.instance.onUpdate
      .pipe(
        concatMap(() => this.refreshAfterCreateOrUpdate(cabin._id, cabin)),
        take(1)
      )
      .subscribe(() => {
        this.modalService.close();
      });
  };

  openDeleteModal = (cabin: Cabin) => {
    this.modalService.openConfirmModal({
      title: "Are you sure you want to delete this cabin?",
      content: cabin.name,
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      onConfirmObs: () => this.deleteCabin(cabin),
    });
  };

  openBulkDeleteModal = () => {
    const cabinsList = Array.from(this.selectedCabinsIds).reduce(
      (acc, cabin, i) => {
        return acc.concat(i > 0 ? "\n" : "", cabin.name);
      },
      ""
    );
    this.modalService.openConfirmModal({
      title: "Are you sure you want to delete these cabins?",
      content: cabinsList,
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      onConfirmObs: () => this.deleteSelectedCabins(),
    });
  };

  toggleCabinSelection = (cabin: Cabin) => {
    if (this.cabinIsSelected(cabin)) {
      this.deselectCabin(cabin);
    } else {
      this.selectCabin(cabin);
    }
  };

  cabinIsSelected = (cabin: Cabin) => {
    return this.selectedCabinsIds.has(cabin);
  };

  /**
   * Refresh cabins list after create or update. The new/updated cabin
   * is fetched from the server and added to the list, to avoid refreshing
   * the whole list data.
   * @param cabinId
   * @param cabin Pass this only for update. Leave undefined for create.
   * @returns Observable
   */
  private refreshAfterCreateOrUpdate = (
    cabinId: string,
    cabin?: Cabin
  ): Observable<any> =>
    // Todo improve api calls by using mongodb findOneAndUpdate: that allows us
    // to get the updated cabin without having to call the get api.
    this.cabinService.getCabinById(cabinId).pipe(
      tap((res) => {
        if (res.status !== 200 || res.body?.status !== "success") {
          const errorMessage = "Unknown error while getting cabin.";
          console.error(errorMessage);
          this.toastService.createToast(errorMessage, "error");
          return;
        }
        // Todo use ngZone to avoid refreshing view in the middle of an update
        if (cabin) {
          this.removeCabinFromList(cabin);
        }
        // @ts-ignore
        this.cabins.push(res.body.data);
        this.refreshPagination();
      }),
      catchError((res) => this.errorService.catchAll(res, true))
    );

  private deleteCabin = (cabin: Cabin) =>
    this.cabinService.deleteCabin(cabin._id).pipe(
      map((res) => {
        if (res.status !== 204) {
          const errorMessage = "Unknown error while deleting cabin.";
          console.error(errorMessage);
          this.toastService.createToast(errorMessage, "error");
          return res;
        }
        this.toastService.createToast("Cabin deleted successfully.", "success");
        this.removeCabinFromList(cabin);
        return res;
      }),
      catchError((err) => {
        let errorMessage = "Unknown error while deleting cabin.";
        if (err instanceof HttpErrorResponse && err.status === 404) {
          errorMessage =
            "Oops, cabin has already been deleted. Refresh the page to sync table data.";
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
    this.cabins = this.cabins.slice();
  };

  /**
   * Removes cabin from the client's cabins list.
   * @param cabin - cabin to remove
   */
  private removeCabinFromList = (cabin: Cabin) => {
    this.cabins = this.cabins.filter((b) => b !== cabin);
    this.deselectCabin(cabin);
  };

  private deleteSelectedCabins = () => {
    return forkJoin(
      Array.from(this.selectedCabinsIds).map((cabin) =>
        this.cabinService.deleteCabin(cabin._id).pipe(
          catchError((err) => {
            // Todo handle errors, maybe save info about which cabins failed to be deleted
            return err;
          })
        )
      )
    ).pipe(
      tap(() => {
        this.cabins = this.cabins.filter((b) => !this.selectedCabinsIds.has(b));
        this.deselectAllCabins();
      })
    );
  };

  private selectCabin = (cabin: Cabin) => {
    this.selectedCabinsIds.add(cabin);
  };

  private deselectCabin = (cabin: Cabin) => {
    this.selectedCabinsIds.delete(cabin);
  };

  private deselectAllCabins = () => {
    this.selectedCabinsIds.clear();
  };

  private translationTransform = (item: string, translationPrefix: string) =>
    item ? this.translocoService.translate(translationPrefix + "." + item) : "";

  private stopLoading = () => {
    this.isLoading = false;
  };
}
