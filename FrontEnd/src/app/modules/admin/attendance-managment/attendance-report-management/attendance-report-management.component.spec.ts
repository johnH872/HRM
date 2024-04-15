import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceReportManagementComponent } from './attendance-report-management.component';

describe('AttendanceReportManagementComponent', () => {
  let component: AttendanceReportManagementComponent;
  let fixture: ComponentFixture<AttendanceReportManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AttendanceReportManagementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttendanceReportManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
