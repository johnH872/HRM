import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditLeaveRequestComponent } from './add-edit-leave-request.component';

describe('AddEditLeaveRequestComponent', () => {
  let component: AddEditLeaveRequestComponent;
  let fixture: ComponentFixture<AddEditLeaveRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditLeaveRequestComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditLeaveRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
