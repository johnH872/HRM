import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditLeaveTypeComponent } from './add-edit-leave-type.component';

describe('AddEditLeaveTypeComponent', () => {
  let component: AddEditLeaveTypeComponent;
  let fixture: ComponentFixture<AddEditLeaveTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditLeaveTypeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditLeaveTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
