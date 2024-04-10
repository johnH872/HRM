import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportAttendanceDialogComponent } from './report-attendance-dialog.component';

describe('ReportAttendanceDialogComponent', () => {
  let component: ReportAttendanceDialogComponent;
  let fixture: ComponentFixture<ReportAttendanceDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportAttendanceDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportAttendanceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
