import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { MatSelect } from '@angular/material/select';
import { take, takeUntil } from 'rxjs/operators';
import { EmployeeModel } from '../../models/employee.model';
import { EmployeeManagementService } from 'src/app/modules/admin/employee-management/employee-management.service';

@Component({
  selector: 'app-employee-searching',
  templateUrl: './employee-searching.component.html',
  styleUrls: ['./employee-searching.component.scss']
})
export class EmployeeSearchingComponent implements AfterViewInit, OnDestroy, OnChanges {

  /** list of banks */
  @Input() banks: EmployeeModel[] = []
  @Input() currentUser = new EmployeeModel();
  @Input() isNbUser: boolean = false;
  @Input() styleMatSelect: { [key: string]: string };
  @Input() enableUnAssignee: boolean = true;
  @Input() label: string = 'Employee';
  @Input() placeholderLabel = 'Search display name or user name...';
  @Input() isDropDown: boolean = true;
  @Input() readonly: boolean = false;
  
  @Output() userSelect = new EventEmitter<EmployeeModel>()
  /** control for the selected bank */
  public bankCtrl: FormControl = new FormControl();

  /** control for the MatSelect filter keyword */
  public bankFilterCtrl: FormControl = new FormControl();

  /** list of banks filtered by search keyword */
  public filteredBanks: ReplaySubject<EmployeeModel[]> = new ReplaySubject<EmployeeModel[]>(1);

  @ViewChild('singleSelect') singleSelect: MatSelect;

  /** Subject that emits when the component has been destroyed. */
  protected _onDestroy = new Subject<void>();

  employeeLoading: boolean = false;
  totalResults: number = 0;


  constructor(private employeeService: EmployeeManagementService) { }

  ngOnInit() {
    // load the initial bank list
    this.filteredBanks?.next(this.banks?.slice());
    // set initial selection
    if (this.currentUser)
      this.bankCtrl.setValue(this.banks?.find(x => x.userId === this.currentUser?.userId));
    // listen for search field value changes
    this.bankFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterBanks();
      });
  }

  async getCurrentEmployee(id) {
    const res = await this.employeeService.getEmployeeById(id).toPromise();
    if (res.result) {
      this.bankCtrl.setValue(res.result);
    }
  }

  ngAfterViewInit() {
    this.setInitialValue();
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const changeMyTask = changes.currentUser;
    if (changeMyTask && !changeMyTask.firstChange && JSON.stringify(changeMyTask.currentValue) !== JSON.stringify(changeMyTask.previousValue)) {
      this.bankCtrl.setValue(this.banks?.find(x => x.userId === changeMyTask.currentValue.id));
    }
  }
  /**
   * Sets the initial value after the filteredBanks are loaded initially
   */
  protected setInitialValue() {
    this.employeeLoading = true;
    this.filteredBanks
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        // setting the compareWith property to a comparison function
        // triggers initializing the selection according to the initial value of
        // the form control (i.e. _initializeSelection())
        // this needs to be done after the filteredBanks are loaded initially
        // and after the mat-option elements are available
        this.singleSelect.compareWith = (a: EmployeeModel, b: EmployeeModel) => a && b && a?.userId === b?.userId;
      });
    this.totalResults = this.banks?.length;
    this.employeeLoading = false;
  }

  protected filterBanks() {
    if (!this.banks) {
      return;
    }
    // get the search keyword
    let search = this.bankFilterCtrl?.value;
    if (!search) {
      this.totalResults = this.banks?.length;
      this.filteredBanks.next(this.banks.slice());
    } else {
      search = search.toLowerCase();
      this.totalResults = 0;
      // filter the banks
      this.filteredBanks.next(
        this.banks.filter(bank => {
          if (bank.displayName.toLowerCase().indexOf(search) > -1) {
            this.totalResults += 1;
            return bank; 
          }
          else if (bank.displayName.toLowerCase().indexOf(search) > -1) {
            this.totalResults += 1;
            return bank;
          } 
        })
      );
    }
  }
  
  selectionChange(data) {
    if (this.userSelect)
      this.userSelect.emit(this.bankCtrl.value);
  }
  public resetField() {
    this.bankCtrl.setValue(this.banks.find(x => x.userId === this.currentUser?.userId));
    // load the initial bank list
    this.filteredBanks.next(this.banks.slice());
  }
}
