import { ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';

import { CalculationService } from './calculation.service';
import { mockWeek4Data } from '../test-data/data-week4';
import { mockWeek5Data } from '../test-data/data-week5';
import { mockR9R11Data } from '../test-data/data-r9-r11';
import { Rank } from '../models/rank';

describe('CalculationServiceService', () => {
    let service: CalculationService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{ provider: ComponentFixtureAutoDetect, useValue: true }],
        });
        service = TestBed.inject(CalculationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('same rank qualification reward', () => {
        const currentRank = Rank.RankMap.get(13);
        if (!currentRank) {
            fail("CurrentRank could not be resolved for Rank 13");
            return;
        }
        const rankProgress = 0;
        const honorFarmed = 418750;

        expect(service.CalculateNextRankNum(currentRank, rankProgress, honorFarmed)).toBe(13);
        expect(service.CalculateNextRankPercentage(currentRank, rankProgress, honorFarmed)).toBeCloseTo(34);
    });

    mockWeek4Data.forEach((e, i) => {
        it('Week 4 Dataset #' + i, () => {
            const currentRankNum = e['Rank'];
            const currentRank = Rank.RankMap.get(currentRankNum);
            if (!currentRank) {
                fail("CurrentRank could not be resolved for Rank " + currentRankNum);
                return;
            }

            const rankProgress = e['Percentage'];
            const honorFarmed = e['Honor'];

            // allow -50 to +50
            const min = e['CpGain'] - 50;
            const max = e['CpGain'] + 50;

            const qualifiedRanks = service.CalculateQualifiedRanks(currentRank, honorFarmed);
            const ratingGain = service.CalculateRatingGain(currentRank, rankProgress, qualifiedRanks);

            expect(ratingGain >= min && ratingGain <= max).withContext(`Is [Predicted CP Gained] ${ratingGain} within the Range of [Actual Cp Gain ± 50] ${min} - ${max}?`).toBeTruthy();
        });
    });

    mockWeek5Data.forEach((e, i) => {
        it('Week 5 Dataset #' + i, () => {
            const currentRankNum = e['Rank'];
            const currentRank = Rank.RankMap.get(currentRankNum);
            if (!currentRank) {
                fail("CurrentRank could not be resolved for Rank " + currentRankNum);
                return;
            }

            const rankProgress = e['Percentage'];
            const honorFarmed = e['Honor'];

            // allow -50 to +50
            const min = e['CpGain'] - 50;
            const max = e['CpGain'] + 50;

            const qualifiedRanks = service.CalculateQualifiedRanks(currentRank, honorFarmed);
            const ratingGain = service.CalculateRatingGain(currentRank, rankProgress, qualifiedRanks);

            expect(ratingGain >= min && ratingGain <= max).withContext(`Is [Predicted CP Gained] ${ratingGain} within the Range of [Actual Cp Gain ± 50] ${min} - ${max}?`).toBeTruthy();
        });
    });

    mockR9R11Data.forEach((e, i) => {
        it('R9/R11 Dataset #' + i, () => {
            const currentRankNum = e['Rank'];
            const currentRank = Rank.RankMap.get(currentRankNum);
            if (!currentRank) {
                fail("CurrentRank could not be resolved for Rank " + currentRankNum);
                return;
            }

            const rankProgress = e['Percentage'];
            const honorFarmed = e['Honor'];

            // allow -50 to +50
            const min = e['CpGain'] - 50;
            const max = e['CpGain'] + 50;

            const qualifiedRanks = service.CalculateQualifiedRanks(currentRank, honorFarmed);
            const ratingGain = service.CalculateRatingGain(currentRank, rankProgress, qualifiedRanks);

            expect(ratingGain >= min && ratingGain <= max).withContext(`Is [Predicted CP Gained] ${ratingGain} within the Range of [Actual Cp Gain ± 50] ${min} - ${max}?`).toBeTruthy();
        });
    });
});
