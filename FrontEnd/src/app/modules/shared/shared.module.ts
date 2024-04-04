import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { NbAuthModule } from '@nebular/auth';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NbAlertModule, NbButtonGroupModule, NbButtonModule, NbCardModule, NbCheckboxModule, NbDatepickerModule, NbFormFieldModule, NbIconModule, NbInputModule, NbLayoutModule, NbMenuModule, NbRadioModule, NbSearchModule, NbSelectModule, NbSpinnerModule, NbTabsetModule, NbToggleModule, NbUserModule } from '@nebular/theme';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MatSelectModule } from '@angular/material/select';
import { HttpClientModule } from '@angular/common/http';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  NgxMatDatetimePickerModule, 
  NgxMatNativeDateModule, 
  NgxMatTimepickerModule 
} from '@angular-material-components/datetime-picker';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatRadioModule } from '@angular/material/radio';
import { MatPaginatorModule } from '@angular/material/paginator';
import { GoogleMapsModule } from '@angular/google-maps';
import { QuillModule } from 'ngx-quill';
import { MatTableModule } from '@angular/material/table';
import { HtmlSafetyPipe } from './pipes/safety-html.pipe';
import { DatePipePipe } from './pipes/date-pipe.pipe';
import { MAT_DIALOG_DEFAULT_OPTIONS, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import {MatDividerModule} from '@angular/material/divider';
import { ConfirmModalComponent } from './components/confirm-modal/confirm-modal.component';
import { NgxTableComponent } from './components/ngx-table/ngx-table.component';
import { MatTableComponent } from './components/mat-table/mat-table.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { ColorPickerModule } from 'ngx-color-picker';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { RichInlineEditComponent } from './components/rich-inline-edit/rich-inline-edit.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { MatSliderModule } from '@angular/material/slider';
import { RatingStarComponent } from './components/rating-star/rating-star.component';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxEchartsModule } from 'ngx-echarts';
import { TableModule } from 'primeng/table';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { CalendarModule } from 'primeng/calendar';
import { ChipsModule } from 'primeng/chips';
import { DropdownModule } from 'primeng/dropdown';
import { InputMaskModule } from 'primeng/inputmask';
import { InputNumberModule } from 'primeng/inputnumber';
import { CascadeSelectModule } from 'primeng/cascadeselect';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { DropdownFilterComponent } from './components/dropdown-filter/dropdown-filter.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { EmployeeSearchingComponent } from './components/employee-searching/employee-searching.component';
import { NumberFormatPipe } from './pipes/number-format.pipe';
import { HighlightTextSearchingPipe } from './pipes/highlight-text-searching.pipe';
import { MatNativeDateModule } from '@angular/material/core';
import { DateFormatPipe, DateTimeFormatPipe } from './pipes/date-time-format.pipe';
import {MatStepperModule} from '@angular/material/stepper';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { DateArrFormatPipe } from './pipes/date-arr-format.pipe';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

const materialModules = [
  MatFormFieldModule,
  MatCheckboxModule,
  MatInputModule,
  MatToolbarModule,
  MatIconModule,
  MatMenuModule,
  MatButtonModule,
  MatGridListModule,
  MatSelectModule,
  MatDatepickerModule,
  MatTabsModule,
  MatAutocompleteModule,
  MatExpansionModule,
  MatRadioModule,
  MatPaginatorModule,
  MatTooltipModule,
  MatTableModule,
  MatDialogModule,
  QuillModule,
  MatListModule,
  MatDividerModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatNativeDateModule,
  MatStepperModule,
  MatProgressBarModule,
  MatButtonToggleModule,
];

const nebularModules = [
  NbIconModule,
  NbInputModule,
  NbCheckboxModule,
  NbButtonModule,
  NbButtonGroupModule,
  NbRadioModule,
  NbSearchModule,
  NbAlertModule,
  NbTabsetModule,
  NbSpinnerModule,
  NbDatepickerModule,
  NbSelectModule,
  NbFormFieldModule,
  NbToggleModule,
  NbUserModule,
];

const angularModules = [
  ReactiveFormsModule,
  MatFormFieldModule,
  RxReactiveFormsModule,
  HttpClientModule,
  FlexLayoutModule,
  ColorPickerModule,
  NgxSkeletonLoaderModule,
  NgxMatSelectSearchModule,
];

const primengModules = [
  FormsModule,
  AutoCompleteModule,
  CalendarModule,
  ChipsModule,
  DropdownModule,
  InputMaskModule,
  InputNumberModule,
  CascadeSelectModule,
  MultiSelectModule,
  InputTextareaModule,
  InputTextModule,
  PasswordModule,
  CheckboxModule,
  TableModule,
  ButtonModule,
  ToolbarModule,
  DialogModule,
]

@NgModule({
  declarations: [
    HtmlSafetyPipe,
    ConfirmModalComponent,
    NgxTableComponent,
    MatTableComponent,
    ToolbarComponent,
    RichInlineEditComponent,
    ConfirmDialogComponent,
    RatingStarComponent,
    DropdownFilterComponent,
    EmployeeSearchingComponent,
    NumberFormatPipe,
    HighlightTextSearchingPipe,
    DatePipePipe,
    DateTimeFormatPipe,
    DateFormatPipe,
    DateArrFormatPipe,
  ],
  imports: [
    CommonModule,
    FontAwesomeModule,
    NbAuthModule,
    NbLayoutModule,
    NbCardModule,
    NbMenuModule,
    FormsModule,
    ReactiveFormsModule,
    RxReactiveFormsModule,
    NgxDatatableModule,
    GoogleMapsModule,
    ToastModule,
    NgxEchartsModule,
    [...materialModules],
    [...nebularModules],
    [...angularModules],
    [...primengModules]
  ],
  exports: [
    CommonModule,
    FontAwesomeModule,
    NbAuthModule,
    NbLayoutModule,
    NbCardModule,
    NbMenuModule,
    FormsModule,
    ReactiveFormsModule,
    RxReactiveFormsModule,
    NgxDatatableModule,
    NgxMatDatetimePickerModule, 
    NgxMatNativeDateModule, 
    NgxMatTimepickerModule,
    GoogleMapsModule,
    HtmlSafetyPipe,
    ToastModule,
    [...materialModules],
    [...nebularModules],
    [...angularModules],
    [...primengModules],
    DatePipePipe,
    NgxTableComponent,
    MatTableComponent,
    ToolbarComponent,
    RichInlineEditComponent,
    ConfirmDialogComponent,
    RatingStarComponent,
    NgxEchartsModule,
    DropdownFilterComponent,
    EmployeeSearchingComponent,
    DatePipePipe,
    DateTimeFormatPipe,
    DateFormatPipe,
    DateArrFormatPipe,
  ],
  providers: [
    {provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: {hasBackdrop: false}},
    {
      provide: MatDialogRef,
      useValue: {}
    },
    {
      provide: MessageService
    },
    DatePipePipe,
    DateTimeFormatPipe,
    DateFormatPipe,
  ]
})
export class SharedModule { }
