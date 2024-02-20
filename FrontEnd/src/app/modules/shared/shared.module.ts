import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { NbAuthModule } from '@nebular/auth';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CORPORATE_THEME, COSMIC_THEME, DARK_THEME, DEFAULT_THEME, NbAlertModule, NbButtonGroupModule, NbButtonModule, NbCardModule, NbCheckboxModule, NbDatepickerModule, NbFormFieldModule, NbIconModule, NbInputModule, NbLayoutModule, NbMenuModule, NbRadioModule, NbSearchModule, NbSelectModule, NbSpinnerModule, NbTabsetModule, NbThemeModule, NbToastrModule } from '@nebular/theme';
import { MatSelectModule } from '@angular/material/select';
import { HttpClientModule } from '@angular/common/http';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatRadioModule } from '@angular/material/radio';
import { MatPaginatorModule } from '@angular/material/paginator';
import { QuillModule } from 'ngx-quill';
import { MatTableModule } from '@angular/material/table';
import { MAT_DIALOG_DEFAULT_OPTIONS, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { MatDividerModule } from '@angular/material/divider';
import { MatSliderModule } from '@angular/material/slider';
import { HtmlSafetyPipe } from './pipes/safety-html.pipe';
import { FormLayoutDemoRoutingModule } from 'src/app/demo/components/uikit/formlayout/formlayoutdemo-routing.module';
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
  MatSliderModule
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
  NbToastrModule,
  NbFormFieldModule
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
  CheckboxModule 
]

const angularModules = [
  ReactiveFormsModule,
  MatFormFieldModule,
  RxReactiveFormsModule,
  HttpClientModule,
  FlexLayoutModule,
];

@NgModule({
  declarations: [
    HtmlSafetyPipe
  ],
  imports: [
    CommonModule,
    CommonModule,
    NbAuthModule,
    NbLayoutModule,
    NbCardModule,
    NbMenuModule,
    FormsModule,
    ReactiveFormsModule,
    RxReactiveFormsModule,
    ToastModule,
    FormsModule,
    [...materialModules],
    [...nebularModules],
    [...angularModules],
    [...primengModules]
  ],
  exports: [
    [...materialModules],
    [...nebularModules],
    [...angularModules],
    [...primengModules],
    CommonModule,
    NbAuthModule,
    NbLayoutModule,
    NbCardModule,
    NbMenuModule,
    FormsModule,
    ReactiveFormsModule,
    RxReactiveFormsModule,
    ToastModule,
    HtmlSafetyPipe,
    FormsModule
  ],
  providers: [
    ...NbThemeModule.forRoot(
      {
        name: 'default',
      },
      [DEFAULT_THEME, COSMIC_THEME, CORPORATE_THEME, DARK_THEME],
    ).providers,
  ],
})
export class SharedModule { }
