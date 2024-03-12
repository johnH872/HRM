import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditLeaveEntitlementComponent } from './add-edit-leave-entitlement.component';

describe('AddEditLeaveEntitlementComponent', () => {
  let component: AddEditLeaveEntitlementComponent;
  let fixture: ComponentFixture<AddEditLeaveEntitlementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditLeaveEntitlementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditLeaveEntitlementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
