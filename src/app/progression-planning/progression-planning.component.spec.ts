import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressionPlanningComponent } from './progression-planning.component';

describe('ProgressionPlanningComponent', () => {
  let component: ProgressionPlanningComponent;
  let fixture: ComponentFixture<ProgressionPlanningComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProgressionPlanningComponent]
    });
    fixture = TestBed.createComponent(ProgressionPlanningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
