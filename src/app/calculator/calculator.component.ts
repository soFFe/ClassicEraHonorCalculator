import { Component, OnInit } from '@angular/core';
import { Rank, RankData } from './rankdata';

@Component({
    selector: 'calculator-root',
    templateUrl: './calculator.component.html',
    styleUrls: []
})
export class CalculatorComponent implements OnInit {
    //#region currentRankNum
    private _currentRankNum: number = 1;
    public get currentRankNum(): number {
        return this._currentRankNum;
    }
    public set currentRankNum(value: number) {
        if (isNaN(value)) {
            this._currentRankNum = RankData.MinRankNum;
        }
        else if (value < RankData.MinRankNum) {
            this._currentRankNum = RankData.MinRankNum;
        }
        else if (value > RankData.MaxRankNum) {
            this._currentRankNum = RankData.MaxRankNum;
        } else {
            this._currentRankNum = Number(value);
        }

        let rCurrent = RankData.RankMap.get(this.currentRankNum);
        if (!rCurrent) {
            throw new Error(`Could not find Rank ${this.currentRankNum} in RankMap`);
        }

        this.currentRank = rCurrent;
    }
    //#endregion
    //#region rankProgress
    private _rankProgress: number = 0;
    public get rankProgress(): number {
        return this._rankProgress;
    }
    public set rankProgress(value: number) {
        if (isNaN(value))
            this._rankProgress = 0;
        else if (value < 0)
            this._rankProgress = 0;
        else if (value > 100)
            this._rankProgress = 100;
        else
            this._rankProgress = Number(value);
    }
    //#endregion
    //#region honorFarmed
    private _honorFarmed: number = 0;
    public get honorFarmed(): number {
        return this._honorFarmed;
    }
    public set honorFarmed(value: number) {
        if (isNaN(value))
            this._honorFarmed = 0;
        else if (value < 0)
            this._honorFarmed = 0;
        else if (value > RankData.MaxHonor)
            this._honorFarmed = RankData.MaxHonor
        else
            this._honorFarmed = Number(value);
    }
    //#endregion

    ranks: Map<number, Rank> = RankData.RankMap;
    currentRank: Rank;

    constructor() {
        let rCurrent = RankData.RankMap.get(this.currentRankNum);
        if (!rCurrent) {
            throw new Error(`Could not find Rank ${this.currentRankNum} in RankMap`);
        }

        this.currentRank = rCurrent;
    }
    ngOnInit(): void { }

    //#region Calculation Methods
    CalculateHonorFarmProgress(): number {
        let honorProgressPercentage = this.honorFarmed / this.CalculateMinimumHonorForMaxRatingGain() * 100;
        return Math.min(honorProgressPercentage, 100);
    }

    CalculateMinimumHonorForMaxRatingGain(): number {
        let maxQualifiedRanks = Array.from(RankData.RankMap.values())
            .filter(r => r.Num > this.currentRankNum && r.Num <= (this.currentRankNum + RankData.MaxRankQualifications));
        let minCpRequirement = maxQualifiedRanks[maxQualifiedRanks.length - 1].CpRequirement;

        return Math.round(minCpRequirement / this.currentRank.HonorConversionFactor);
    }

    //#region This Week
    /**
     * @name CalculateCurrentRating
     * @description Calculates the current amount of CP
     */
    CalculateCurrentRating(): number {
        if (this.currentRankNum == RankData.MaxRankNum) {
            return (this.currentRank.CpRequirement + ((RankData.MaxCp - this.currentRank.CpRequirement) * this.rankProgress / 100));
        }
        else {
            let nNext: number = Number(this.currentRankNum) + 1;
            let rNext: Rank | undefined = RankData.RankMap.get(nNext);
            if (!rNext) {
                throw new Error(`Could not find Rank ${nNext} in RankMap`);
            }
            return (this.currentRank.CpRequirement + ((rNext.CpRequirement - this.currentRank.CpRequirement) * this.rankProgress / 100));
        }
    }

    CalculateCpFarmed(): number {
        let CP = Math.min(this.honorFarmed * this.currentRank.HonorConversionFactor, RankData.MaxCp);
        return Math.round(CP);
    }

    CalculateMaxRatingGain(): number {
        return this.CalculateRatingGain(RankData.MaxCp);
    }
    //#endregion

    //#region Next Week
    CalculateRatingGain(cp: number): number {
        let cpSum = 0;
        let qualifiedRanks = Array.from(RankData.RankMap.values())
            .filter(r => cp >= r.CpRequirement && r.Num > this.currentRankNum && r.Num <= (this.currentRankNum + RankData.MaxRankQualifications));

        // console.debug(`User qualified for ${qualifiedRanks.length} ranks this week:`, qualifiedRanks);

        qualifiedRanks.forEach(rank => {
                let previousRank = RankData.RankMap.get(rank.Num - 1);
                if(!previousRank)
                {
                    console.debug(`Could not find previous Rank of Rank ${rank.Num}. Tried to get Rank ${rank.Num - 1}`);
                    return; // continue
                }

                cpSum += rank.CalculateRankQualificationReward(previousRank);
        });
        
        return Math.round(cpSum);
    }
    CalculateNextRating(): number {
        let nextRating = this.CalculateCurrentRating() + this.CalculateRatingGain(this.CalculateCpFarmed());

        return nextRating;
    }

    CalculateNextRankNum(): number {
        let nextRating = this.CalculateNextRating();

        let rankRequirementsMet = Array.from(RankData.RankMap.values()).filter(r => nextRating >= r.CpRequirement);
        if(rankRequirementsMet.length > 0)
        {
            return rankRequirementsMet[rankRequirementsMet.length - 1].Num;
        }
        else
        {
            console.debug("Could not calculate next rank");
            return 0;
        }
    }

    CalculateMaxNextRankNum(): number {
        let nextRating = this.CalculateCurrentRating() + this.CalculateMaxRatingGain();

        let rankRequirementsMet = Array.from(RankData.RankMap.values()).filter(r => nextRating >= r.CpRequirement);
        if(rankRequirementsMet.length > 0)
        {
            return rankRequirementsMet[rankRequirementsMet.length - 1].Num;
        }
        else
        {
            throw new Error("Could not calculate next maximum rank");
        }
    }
    //#endregion
    //#endregion

    //#region Form Input Validation Methods
    /**
     * Validate that only numbers can be typed into an input of type "text" where it's intended to only represent numbers
     * @param e Input Event
     * @param allowDecimalPoint Allow Decimal Points as input or not
     */
    validateNumberBeforeInput(e: InputEvent, allowDecimalPoint: boolean): void {
        if (e.data == null)
            return;

        let validRegEx = allowDecimalPoint ? /^[\d.]$/ : /^[\d]$/;

        // remove invalid inputs
        if (!validRegEx.test(e.data)) {
            e.preventDefault();
            return;
        }
    }

    validateNumberOnChange(e: Event, min: number, max: number): void {
        let elInput = <HTMLInputElement>e.target;

        // check if value is a valid number or NaN
        if (isNaN(Number(elInput.value))) {
            elInput.value = min.toString();
            return;
        }

        // replace min/max values
        if (Number(elInput.value) < min) {
            elInput.value = min.toString();
            return;
        }
        else if (Number(elInput.value) > max) {
            elInput.value = max.toString();
            return;
        }
    }
    //#endregion
}
