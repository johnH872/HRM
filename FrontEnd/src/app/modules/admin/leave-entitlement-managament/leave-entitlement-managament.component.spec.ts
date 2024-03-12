import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveEntitlementManagamentComponent } from './leave-entitlement-managament.component';

describe('LeaveEntitlementManagamentComponent', () => {
  let component: LeaveEntitlementManagamentComponent;
  let fixture: ComponentFixture<LeaveEntitlementManagamentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeaveEntitlementManagamentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaveEntitlementManagamentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
