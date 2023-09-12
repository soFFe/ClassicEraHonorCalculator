import { TestBed } from '@angular/core/testing';
import { CalculatorComponent } from './calculator.component';

describe('CalculatorComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({
    declarations: [CalculatorComponent]
  }));

  it('should create the component', () => {
    const fixture = TestBed.createComponent(CalculatorComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('honor screenshot #1', () => {
    const fixture = TestBed.createComponent(CalculatorComponent);
    const app = fixture.componentInstance;
    app.currentRankNum = 10;
    app.rankProgress = 46;
    app.honorFarmed = 264691;

    expect(app.CalculateNextRankNum()).toBe(10);
    expect(app.CalculateNextRankPercentage()).toBeCloseTo(94);
  });

  it('same rank qualification reward', () => {
    const fixture = TestBed.createComponent(CalculatorComponent);
    const app = fixture.componentInstance;
    app.currentRankNum = 13;
    app.rankProgress = 0;
    app.honorFarmed = 418750;

    expect(app.CalculateNextRankNum()).toBe(13);
    expect(app.CalculateNextRankPercentage()).toBeCloseTo(33);
  });
});
