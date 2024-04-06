import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PunchInOutWebcamComponent } from './punch-in-out-webcam.component';

describe('PunchInOutWebcamComponent', () => {
  let component: PunchInOutWebcamComponent;
  let fixture: ComponentFixture<PunchInOutWebcamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PunchInOutWebcamComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PunchInOutWebcamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
