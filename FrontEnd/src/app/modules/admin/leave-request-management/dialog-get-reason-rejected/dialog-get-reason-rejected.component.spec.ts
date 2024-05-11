import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogGetReasonRejectedComponent } from './dialog-get-reason-rejected.component';

describe('DialogGetReasonRejectedComponent', () => {
  let component: DialogGetReasonRejectedComponent;
  let fixture: ComponentFixture<DialogGetReasonRejectedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogGetReasonRejectedComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogGetReasonRejectedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
