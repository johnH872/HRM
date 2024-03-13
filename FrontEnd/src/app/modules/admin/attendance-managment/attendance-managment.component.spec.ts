import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceManagmentComponent } from './attendance-managment.component';

describe('AttendanceManagmentComponent', () => {
  let component: AttendanceManagmentComponent;
  let fixture: ComponentFixture<AttendanceManagmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AttendanceManagmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttendanceManagmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
