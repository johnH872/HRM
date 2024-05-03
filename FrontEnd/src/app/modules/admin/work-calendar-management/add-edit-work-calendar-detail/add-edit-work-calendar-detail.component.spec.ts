import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditWorkCalendarDetailComponent } from './add-edit-work-calendar-detail.component';

describe('AddEditWorkCalendarDetailComponent', () => {
  let component: AddEditWorkCalendarDetailComponent;
  let fixture: ComponentFixture<AddEditWorkCalendarDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditWorkCalendarDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditWorkCalendarDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
