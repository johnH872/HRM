import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopoverDetailScheduleCellComponent } from './popover-detail-schedule-cell.component';

describe('PopoverDetailScheduleCellComponent', () => {
  let component: PopoverDetailScheduleCellComponent;
  let fixture: ComponentFixture<PopoverDetailScheduleCellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopoverDetailScheduleCellComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopoverDetailScheduleCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
