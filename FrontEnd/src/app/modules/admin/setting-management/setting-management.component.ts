import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { SettingModel } from './setting-management.model';
import { SettingManagementService } from './setting-management.service';
import { MatDialog } from '@angular/material/dialog';
import { AddEditSettingComponent } from './add-edit-setting/add-edit-setting.component';
import { TblActionType } from '../../shared/enum/tbl-action-type.enum';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-setting-management',
  templateUrl: './setting-management.component.html',
  styleUrls: ['./setting-management.component.scss']
})
export class SettingManagementComponent implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();
  dataTable: SettingModel[];
  settingModel: SettingModel;

  first = 0;
  rows = 10;
  loading: boolean = false;
  selectedSettings: SettingModel[] | null;

  constructor(
    private settingService: SettingManagementService,
    private dialog: MatDialog,
  ) {
    
  }

  async ngOnInit() {
    this.loading = !this.loading;
    await this.refreshData();
    this.loading = !this.loading;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async refreshData() {
    this.loading = !this.loading;
    var settingPagingResults = await this.settingService.getAllSetting().pipe(takeUntil(this.destroy$)).toPromise();
    if (settingPagingResults.result) {
      this.dataTable = settingPagingResults.result;
    }
    this.loading = !this.loading;
  }

  async addEditSetting(model: SettingModel = null) {
    this.settingModel = model;
    const dialogRef = this.dialog.open(AddEditSettingComponent, {
      disableClose: true,
      height: '100vh',
      width: '600px',
      backdropClass: 'custom-backdrop',
      hasBackdrop: true,
      autoFocus: false,
      data: {
        model: model,
        action: model === null ? TblActionType.Add : TblActionType.Edit,
      }
    });
    dialogRef.afterClosed().subscribe(async response => {
      if (response) {
        await this.refreshData();
      }
    });
  }

  next() {
    this.first = this.first + this.rows;
  }

  prev() {
      this.first = this.first - this.rows;
  }

  async reset() {
    this.first = 0;
    await this.refreshData();
  }

  pageChange(event) {
      this.first = event.first;
      this.rows = event.rows;
  }

  clear(table: Table) {
    table.clear();
  }

  deleteSetting(model: SettingModel) {

  }
  
  deleteSelectedSetting() {

  }
}
