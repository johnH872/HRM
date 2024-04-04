import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportScheduleManagementComponent } from './report-schedule-management.component';

describe('ReportScheduleManagementComponent', () => {
  let component: ReportScheduleManagementComponent;
  let fixture: ComponentFixture<ReportScheduleManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportScheduleManagementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportScheduleManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
