import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeSearchingComponent } from './employee-searching.component';

describe('EmployeeSearchingComponent', () => {
  let component: EmployeeSearchingComponent;
  let fixture: ComponentFixture<EmployeeSearchingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeSearchingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeSearchingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
