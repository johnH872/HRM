import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PunchInOutComponent } from './punch-in-out.component';

describe('PunchInOutComponent', () => {
  let component: PunchInOutComponent;
  let fixture: ComponentFixture<PunchInOutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PunchInOutComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PunchInOutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
