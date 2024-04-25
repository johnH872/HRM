import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkCalendarManagementComponent } from './work-calendar-management.component';

describe('WorkCalendarManagementComponent', () => {
  let component: WorkCalendarManagementComponent;
  let fixture: ComponentFixture<WorkCalendarManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkCalendarManagementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkCalendarManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
