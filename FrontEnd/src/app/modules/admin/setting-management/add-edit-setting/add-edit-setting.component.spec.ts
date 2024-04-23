import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditSettingComponent } from './add-edit-setting.component';

describe('AddEditSettingComponent', () => {
  let component: AddEditSettingComponent;
  let fixture: ComponentFixture<AddEditSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditSettingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
