import { Component, OnInit } from '@angular/core';
import { ConversionBracket, Rank, RankData } from './rankdata';

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

    //#region Display Methods
    DisplayCpFarmed(): number {
        return Math.round(this.CalculateCpFarmed());
    }

    DisplayMaxRatingGain(): number {
        return Math.round(this.CalculateMaxRatingGain());
    }

    DisplayQualifiedRank(): number {
        let qualifiedRanks = this.CalculateQualifiedRanks(this.honorFarmed);
        if(qualifiedRanks.length > 0)
            return qualifiedRanks[qualifiedRanks.length - 1].Num;
        else
            return 1;
    }

    DisplayNextRankPercentage(): number {
        return Math.round(this.CalculateNextRankPercentage());
    }
    //#endregion

    //#region Calculation Methods
    CalculateHonorFarmProgress(): number {
        let honorProgressPercentage = this.honorFarmed / this.CalculateMinimumHonorForMaxRatingGain() * 100;
        return Math.min(honorProgressPercentage, 100);
    }

    CalculateQualifiedRanks(honor: number): Rank[] {
        let maxQualifiedRanks = Array.from(RankData.RankMap.values())
            .filter(r => r.Num >= this.currentRankNum && r.Num <= Math.min(this.currentRankNum + RankData.MaxRankQualifications, RankData.MaxRankNum), this);
        let initialLen = maxQualifiedRanks.length;

        for(let i = initialLen - 1; i >= 0; i--)
        {
            // check if honor qualification checks out
            if(honor < maxQualifiedRanks[i].HonorRequirement)
            {
                // get outta here
                maxQualifiedRanks.pop();
            }
        }

        return maxQualifiedRanks;
    }

    CalculateMinimumHonorForMaxRatingGain(): number {
        let maxQualifiedRanks = Array.from(RankData.RankMap.values())
            .filter(r => r.Num > this.currentRankNum && r.Num <= Math.min(this.currentRankNum + RankData.MaxRankQualifications, RankData.MaxRankNum));
        if(maxQualifiedRanks.length > 0)
        {
            return this.currentRank.CalculateMinHonorForRankQualification(this.currentRank, maxQualifiedRanks[maxQualifiedRanks.length - 1]);
        }
        else
        {
            // most likely rank 14
            return this.currentRank.CalculateMinHonorForRankQualification(this.currentRank, this.currentRank);
        }
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
        let conversionRate = this.currentRank.GetConversionBracket().CpToHonorRate;
        let CP = Math.min(this.honorFarmed / conversionRate, RankData.MaxCp);

        return CP;
    }

    CalculateMaxRatingGain(): number {
        let maxQualifiedRanks = this.CalculateQualifiedRanks(this.CalculateMinimumHonorForMaxRatingGain());
        return this.CalculateRatingGain(maxQualifiedRanks);
    }
    //#endregion

    //#region Next Week
    CalculateRatingGain(qualifiedRanks: Rank[]): number {
        let cpSum = 0;

        for(let i = 0; i < qualifiedRanks.length; i++)
        {
            let rank = qualifiedRanks[i];
            if(rank.Num == this.currentRankNum)
            {
                // we don't gain Rating for qualifying for the same rank
                continue;
            }

            let previousRank = RankData.RankMap.get(rank.Num - 1);
            if(!previousRank)
            {
                // R14?
                continue;
            }

            cpSum += rank.CalculateRankQualificationReward(previousRank);
        }
        
        return cpSum;
    }
    CalculateNextRating(): number {
        let nextRating = this.CalculateCurrentRating() + this.CalculateRatingGain(this.CalculateQualifiedRanks(this.honorFarmed));

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
            throw new Error("Could not calculate next rank");
        }
    }

    CalculateNextRankPercentage(): number {
        let nextRating = this.CalculateNextRating();
        let rankRequirementsMet = Array.from(RankData.RankMap.values()).filter(r => nextRating >= r.CpRequirement);
        if(rankRequirementsMet.length > 0)
        {
            let nextRank = rankRequirementsMet[rankRequirementsMet.length - 1];
            let cpAboveRequirement = nextRating - nextRank.CpRequirement;
            let nextRankMaxCp = 0;
            if(nextRank.Num == RankData.MaxRankNum)
            {
                nextRankMaxCp = RankData.MaxCp;
            }
            else
            {
                let plusOneRank = RankData.RankMap.get(nextRank.Num + 1);
                if(!plusOneRank)
                {
                    throw new Error("Could not calculate next ranks maximum CP");
                }
                nextRankMaxCp = plusOneRank.CpRequirement;
            }
            
            return cpAboveRequirement / (nextRankMaxCp - nextRank.CpRequirement) * 100;
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
