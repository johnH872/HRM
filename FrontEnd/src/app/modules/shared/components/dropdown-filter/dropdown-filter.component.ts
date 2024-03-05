import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';
import { ReturnResult } from '../../models/return-result';
import { FilterConfig } from './filter-config';

@Component({
  selector: 'app-dropdown-filter',
  templateUrl: './dropdown-filter.component.html',
  styleUrls: ['./dropdown-filter.component.scss']
})
export class DropdownFilterComponent implements OnInit, OnChanges {


  @Input() notifyRefresh: boolean = false;
  @Input() columnName;
  @Input() appearance: string = null;
  @Input() set value(tempValue) {
    if (tempValue) {
      this.selectedValue = tempValue;
      if (this.filterOption != null) {
        this.bankMultiCtrl.setValue(this.multiple
          ? this.filterOption.filter(x => tempValue.includes(x[this.filter.displayValue]))
          : this.filterOption.find(x => tempValue == x[this.filter.displayValue])
        );
      }
    } else {
      this.bankMultiCtrl.setValue(null);
    }
  };
  selectedValue: any[] = [];
  /** list of banks */
  //  protected banks: any[] = BANKS;
  @Input() filter: FilterConfig;
  filterOption: any[];
  @Input() multiple: boolean = true;
  @Input() customTemplate: TemplateRef<any>;
  @Input() isUseLabel: boolean = false;
  @Input() hintTemplate: TemplateRef<any>;
  @Input() suffixTemplate: TemplateRef<any>;
  @Input() required: boolean = false;
  
  @Output() onFilter = new EventEmitter<any>();

  /** list of banks */

  /** total number of available entries */
  public allBanksSize: number;

  /** control for the selected bank for multi-selection */
  public bankMultiCtrl: FormControl = new FormControl();

  /** control for the MatSelect filter keyword multi-selection */
  public bankMultiFilterCtrl: FormControl = new FormControl();

  /** list of banks filtered by search keyword */
  public filteredBanksMulti: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  /** local copy of filtered banks to help set the toggle all checkbox state */
  protected filteredBanksCache: any[] = [];

  /** flags to set the toggle all checkbox state */
  isIndeterminate = false;
  isChecked = false;
  checkAll = true;
  @ViewChild('multiSelect', { static: true }) multiSelect: MatSelect;

  /** Subject that emits when the component has been destroyed. */
  protected _onDestroy = new Subject<void>();
  private unsubscribeData$ = new Subject<void>();

  constructor() { }
  ngOnChanges(changes: SimpleChanges): void {
    let notifyChanges = changes.notifyChanges;
    if (notifyChanges && notifyChanges.currentValue == true) {
      this.unsubscribeData$.next();
      this.unsubscribeData$.complete();
      this.unsubscribeData$ = new Subject<void>();
      // re-init all data:
      this.notifyRefresh = false;
      this.filterOption = undefined;
      this.allBanksSize = undefined;
      // this.filteredBanksMulti = new ReplaySubject<any[]>(1);
      this.ngOnInit();
    }

  }

  ngOnInit() {
    if (this.filter) {
      if (this.filter.filterValue instanceof Observable) {
        if (this.filter.firstLoad || (this.selectedValue && this.selectedValue.length > 0))
          this.filter.filterValue.pipe(takeUntil(this.unsubscribeData$)).subscribe((data: any) => {
            let parseData: any[];
            if (data.result) {
              parseData = data.result;
            } else {
              parseData = data;
            }
            this.filterOption = parseData;
            this.allBanksSize = this.filterOption.length;
            this.filteredBanksMulti.next(this.filterOption.slice());
            if ((this.multiple && this.selectedValue.length > 0) || (!this.multiple && this.selectedValue)) {
              this.bankMultiCtrl.setValue(this.multiple
                ? this.filterOption.filter((x: any) => this.selectedValue.includes(x[this.filter.displayValue]))
                : this.filterOption.find((x: any) => this.selectedValue == x[this.filter.displayValue])
              );
            }
          });
      } else {
        this.filterOption = this.filter.filterValue;
        this.allBanksSize = this.filterOption.length;
        this.filteredBanksMulti.next(this.filterOption.slice());
        if ((this.multiple && this.selectedValue.length > 0) || (!this.multiple && this.selectedValue)) {
          this.bankMultiCtrl.setValue(this.multiple
            ? this.filterOption.filter((x: any) => this.selectedValue.includes(x[this.filter.displayValue]))
            : this.filterOption.find((x: any) => this.selectedValue == x[this.filter.displayValue])
          );
        }
      }
    }
    // listen for search field value changes
    this.bankMultiFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterBanksMulti();
        this.setToggleAllCheckboxState();
      });

    // listen for multi select field value changes
    this.bankMultiCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy)).subscribe(() => {
        this.setToggleAllCheckboxState();
      });
  }

  ngAfterViewInit() {
    this.setInitialValue();
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  toggleSelectAll(selectAllValue) {
    this.filteredBanksMulti.pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(val => {
        if (selectAllValue) {
          this.bankMultiCtrl.patchValue(val, { emitEvent: false });
        } else {
          this.bankMultiCtrl.patchValue([], { emitEvent: false });
        }
      });
  }

  /**
   * Sets the initial value after the filteredBanks are loaded initially
   */
  protected setInitialValue() {
    this.filteredBanksMulti
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        // setting the compareWith property to a comparison function
        // triggers initializing the selection according to the initial value of
        // the form control (i.e. _initializeSelection())
        // this needs to be done after the filteredBanks are loaded initially
        // and after the mat-option elements are available
        this.multiSelect.compareWith = (a: any, b: any) => a && b && a[this.filter.displayText] === b[this.filter.displayText];
      });
  }

  protected filterBanksMulti() {

    if (!this.filterOption) {
      return;
    }
    // get the search keyword
    let search = this.bankMultiFilterCtrl.value;
    if (!search) {
      this.checkAll = true;
      this.filteredBanksCache = this.filterOption.slice();
      this.filteredBanksMulti.next(this.filteredBanksCache);
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredBanksCache = this.filterOption.filter(bank => bank[this.filter.displayText].toLowerCase().indexOf(search) > -1);
    if (this.filteredBanksCache.length == 0) {
      this.checkAll = false;
    } else {
      this.checkAll = true;
    }
    this.filteredBanksMulti.next(this.filteredBanksCache);
  }

  async changeValue(event) {
    if (!this.filterOption && this.filter.filterValue instanceof Observable) {
      let data: any = await this.filter.filterValue.pipe(takeUntil(this.unsubscribeData$)).toPromise();
      let parseData: any[];
      if (data.result) parseData = data.result;
      else parseData = data;

      this.filterOption = parseData;
      this.allBanksSize = this.filterOption.length;
      this.filteredBanksMulti.next(this.filterOption.slice());
      if ((this.multiple && this.selectedValue.length > 0) || (!this.multiple && this.selectedValue)) {
        this.bankMultiCtrl.setValue(this.multiple
          ? this.filterOption.filter((x: any) => this.selectedValue.includes(x[this.filter.displayValue]))
          : this.filterOption.find((x: any) => this.selectedValue == x[this.filter.displayValue])
        );
      }
    }

    if (!event) {
      const value = this.bankMultiCtrl.value ?? [];
      this.onFilter.emit(this.multiple ? value.map(x => x[this.filter.displayValue]) : value[this.filter.displayValue]);
    }
  }
  protected setToggleAllCheckboxState() {
    let filteredLength = 0;
    if (this.bankMultiCtrl && this.bankMultiCtrl.value && this.multiple) {
      this.filteredBanksCache.forEach(el => {
        if (this.bankMultiCtrl.value.indexOf(el) > -1) {
          filteredLength++;
        }
      });
      this.isIndeterminate = filteredLength > 0 && filteredLength < this.filteredBanksCache.length;
      this.isChecked = filteredLength > 0 && filteredLength === this.filteredBanksCache.length;
    }
  }
}
