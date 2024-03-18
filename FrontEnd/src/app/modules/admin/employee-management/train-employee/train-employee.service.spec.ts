import { TestBed } from '@angular/core/testing';

import { TrainEmployeeService } from './train-employee.service';

describe('TrainEmployeeService', () => {
  let service: TrainEmployeeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrainEmployeeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
