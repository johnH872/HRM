import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainEmployeeComponent } from './train-employee.component';

describe('TrainEmployeeComponent', () => {
  let component: TrainEmployeeComponent;
  let fixture: ComponentFixture<TrainEmployeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrainEmployeeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainEmployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
