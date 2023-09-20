import { ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';
import { CalculatorComponent } from './calculator.component';
import { mockWeek4Data } from '../test-data/data-week4';
import { NgIconsModule } from '@ng-icons/core';
import { bootstrapClipboard, bootstrapDiscord, bootstrapChevronDoubleRight, bootstrapGithub, bootstrapGraphUpArrow } from '@ng-icons/bootstrap-icons';
import { mockWeek5Data } from '../test-data/data-week5';

describe('CalculatorComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({
    declarations: [CalculatorComponent],
    providers: [{ provider: ComponentFixtureAutoDetect, useValue: true }],
    imports: [NgIconsModule.withIcons({ bootstrapClipboard, bootstrapDiscord, bootstrapChevronDoubleRight, bootstrapGithub, bootstrapGraphUpArrow })]
  }));

  it('should create the component', () => {
    const fixture = TestBed.createComponent(CalculatorComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('same rank qualification reward', () => {
    const fixture = TestBed.createComponent(CalculatorComponent);
    const app = fixture.componentInstance;
    app.currentRankNum = 13;
    app.rankProgress = 0;
    app.honorFarmed = 418750;

    expect(app.CalculateNextRankNum()).toBe(13);
    expect(app.CalculateNextRankPercentage()).toBeCloseTo(34);
  });

  mockWeek4Data.forEach((e, i) => {
    it('Week 4 Dataset #' + i, () => {
      const fixture = TestBed.createComponent(CalculatorComponent);
      const app = fixture.componentInstance;
      app.currentRankNum = e['Rank'];
      app.rankProgress = e['Percentage'];
      app.honorFarmed = e['Honor'];

      // allow -50 to +50
      let min = e['CpGain'] - 50;
      let max = e['CpGain'] + 50;

      let qualifiedRanks = app.CalculateQualifiedRanks(app.honorFarmed);
      let ratingGain = app.CalculateRatingGain(qualifiedRanks);

      expect(ratingGain >= min && ratingGain <= max).withContext(`Is [Predicted CP Gained] ${ratingGain} within the Range of [Actual Cp Gain ± 50] ${min} - ${max}?`).toBeTruthy();
    });
  });

  mockWeek5Data.forEach((e, i) => {
    it('Week 5 Dataset #' + i, () => {
      const fixture = TestBed.createComponent(CalculatorComponent);
      const app = fixture.componentInstance;
      app.currentRankNum = e['Rank'];
      app.rankProgress = e['Percentage'];
      app.honorFarmed = e['Honor'];

      // allow -50 to +50
      let min = e['CpGain'] - 50;
      let max = e['CpGain'] + 50;

      let qualifiedRanks = app.CalculateQualifiedRanks(app.honorFarmed);
      let ratingGain = app.CalculateRatingGain(qualifiedRanks);

      expect(ratingGain >= min && ratingGain <= max).withContext(`Is [Predicted CP Gained] ${ratingGain} within the Range of [Actual Cp Gain ± 50] ${min} - ${max}?`).toBeTruthy();
    });
  });
});