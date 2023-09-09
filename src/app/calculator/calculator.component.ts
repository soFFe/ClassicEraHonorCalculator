import { Component, OnInit, Output } from '@angular/core';
import { RankData } from './models/rankdata';
import { Rank } from './models/rank';
import { QualificationMilestone } from './models/qualificationMilestone';

@Component({
    selector: 'calculator-root',
    templateUrl: './calculator.component.html',
    styleUrls: ['./calculator.component.scss']
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
        this.qualificationMilestones = this.DisplayQualificationMilestones();
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

    qualificationMilestones: QualificationMilestone[];
    ranks: Array<number> = Array.from(RankData.RankMap.keys()).filter(n => n <= RankData.MaxRankNum);
    currentRank: Rank;
    
    constructor() {
        let rCurrent = RankData.RankMap.get(this.currentRankNum);
        if (!rCurrent) {
            throw new Error(`Could not find Rank ${this.currentRankNum} in RankMap`);
        }

        this.currentRank = rCurrent;
        this.qualificationMilestones = this.DisplayQualificationMilestones();
    }
    ngOnInit(): void {
        
    }

    //#region Display Methods
    DisplayMaxRatingGain(): number {
        return Math.round(this.CalculateMaxRatingGain());
    }

    DisplayNextRankIconUrl(): string {
        return this.DisplayRankIconUrl(this.CalculateNextRankNum());
    }

    DisplayRankIconUrl(rankNum: number): string {
        let rank = RankData.RankMap.get(rankNum);
        if(!rank)
        {
            throw new Error(`Could not find Rank ${rankNum}} in RankMap`);
        }

        return rank.Icon;
    }

    DisplayQualifiedRank(): number {
        let qualifiedRanks = Array.from(RankData.RankMap.values())
            .filter(r => r.Num <= Math.min(this.currentRankNum + RankData.MaxRankQualifications, RankData.MaxRankNum), this);
        let initialLen = qualifiedRanks.length;

        for (let i = initialLen - 1; i >= 0; i--) {
            // double check if honor qualification checks out
            if (this.honorFarmed < qualifiedRanks[i].HonorRequirement) {
                // get outta here
                qualifiedRanks.pop();
            }
        }

        if (qualifiedRanks.length > 0)
            return qualifiedRanks[qualifiedRanks.length - 1].Num;
        else
            return 1; // you are always qualified for Rank 1
    }

    DisplayNextRankPercentage(): string {
        return this.CalculateNextRankPercentage().toFixed(2);
    }

    DisplayQualificationMilestones(): QualificationMilestone[] {
        let maxQualifiedRanks = Array.from(RankData.RankMap.values())
            .filter(r => r.Num >= this.currentRankNum && r.Num <= Math.min(this.currentRankNum + RankData.MaxRankQualifications, RankData.MaxRankNum), this);

        let milestones: QualificationMilestone[] = new Array();
        for (let i = 0; i < maxQualifiedRanks.length; i++) {
            let ms = new QualificationMilestone(maxQualifiedRanks[i], maxQualifiedRanks[maxQualifiedRanks.length - 1])
            milestones.push(ms);
        }

        // due to how flexboxes work, we need to adjust the percentages to only include the difference from the current honor requirement.
        let percentageSum = 0;
        for (let i = 0; i < milestones.length; i++) {
            milestones[i].HonorRequirementPercentage = milestones[i].HonorRequirementPercentage - percentageSum;
            percentageSum += milestones[i].HonorRequirementPercentage;
        }

        return milestones;
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

        for (let i = initialLen - 1; i >= 0; i--) {
            // check if honor qualification checks out
            if (honor < maxQualifiedRanks[i].HonorRequirement) {
                // get outta here
                maxQualifiedRanks.pop();
            }
        }

        return maxQualifiedRanks;
    }

    CalculateMinimumHonorForMaxRatingGain(): number {
        let maxQualifiedRanks = Array.from(RankData.RankMap.values())
            .filter(r => r.Num > this.currentRankNum && r.Num <= Math.min(this.currentRankNum + RankData.MaxRankQualifications, RankData.MaxRankNum), this);
        if (maxQualifiedRanks.length > 0) {
            return this.currentRank.CalculateMinHonorForRankQualification(maxQualifiedRanks[maxQualifiedRanks.length - 1]);
        }
        else {
            // most likely rank 14
            return this.currentRank.CalculateMinHonorForRankQualification(this.currentRank);
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
            let nNext = Number(this.currentRankNum) + 1;
            let rNext = RankData.RankMap.get(nNext);
            if (!rNext) {
                throw new Error(`Could not find Rank ${nNext} in RankMap`);
            }
            return (this.currentRank.CpRequirement + ((rNext.CpRequirement - this.currentRank.CpRequirement) * this.rankProgress / 100));
        }
    }

    CalculateMaxRatingGain(): number {
        let maxQualifiedRanks = this.CalculateQualifiedRanks(this.CalculateMinimumHonorForMaxRatingGain());
        return this.CalculateRatingGain(maxQualifiedRanks);
    }
    //#endregion

    //#region Next Week
    CalculateRatingGain(qualifiedRanks: Rank[]): number {
        let cpSum = 0;

        for (let i = 0; i < qualifiedRanks.length; i++) {
            let rank = qualifiedRanks[i];
            if (rank.Num == this.currentRankNum) {
                // we get the same amount of reward of the next rank by only qualifying for the current rank
                if(qualifiedRanks.length == 1)
                {
                    let nextRank = RankData.RankMap.get(rank.Num + 1);
                    if(!nextRank)
                    {
                        throw new Error(`Could not find Rank ${rank.Num + 1} in RankMap`);
                    }
                    
                    cpSum += nextRank.CalculateRankQualificationReward(this.currentRankNum, this.rankProgress, rank);
                }
                continue;
            }

            let previousRank = RankData.RankMap.get(rank.Num - 1);
            if (!previousRank) {
                if(rank.Num > 1)
                {
                    throw new Error(`Could not find Rank ${rank.Num - 1} in RankMap`);
                }
                else
                {
                    // Rank 1s Reward is 0 anyway, no need to calculate anything
                    continue;
                }
            }

            cpSum += rank.CalculateRankQualificationReward(this.currentRankNum, this.rankProgress, previousRank);
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
        if (rankRequirementsMet.length > 0) {
            return rankRequirementsMet[rankRequirementsMet.length - 1].Num;
        }
        else {
            throw new Error("Could not calculate next rank, as we have not met any Rank Requirements. This should never happen.");
        }
    }

    CalculateNextRankPercentage(): number {
        let nextRating = this.CalculateNextRating();

        let rankRequirementsMet = Array.from(RankData.RankMap.values()).filter(r => nextRating >= r.CpRequirement);
        if (rankRequirementsMet.length > 0) {
            let nextRank = rankRequirementsMet[rankRequirementsMet.length - 1];
            let cpAboveRequirement = nextRating - nextRank.CpRequirement;
            let nextRankMaxCp = 0;
            if (nextRank.Num >= RankData.MaxRankNum) {
                nextRankMaxCp = RankData.MaxCp;
            }
            else {
                let plusOneRank = RankData.RankMap.get(nextRank.Num + 1);
                if (!plusOneRank) {
                    throw new Error(`Could not calculate next ranks maximum CP, because we could not find Rank ${nextRank.Num + 1} in RankMap`);
                }
                nextRankMaxCp = plusOneRank.CpRequirement;
            }

            return cpAboveRequirement / (nextRankMaxCp - nextRank.CpRequirement) * 100;
        }
        else {
            throw new Error("Could not calculate next rank percentage, as we have not met any Rank Requirements. This should never happen.")
        }
    }

    CalculateMaxNextRankNum(): number {
        let nextRating = this.CalculateCurrentRating() + this.CalculateMaxRatingGain();

        let rankRequirementsMet = Array.from(RankData.RankMap.values()).filter(r => nextRating >= r.CpRequirement);
        if (rankRequirementsMet.length > 0) {
            return rankRequirementsMet[rankRequirementsMet.length - 1].Num;
        }
        else {
            throw new Error("Could not calculate next maximum rank, as we have not met any Rank Requirements. This should never happen.");
        }
    }
    //#endregion
    //#endregion

    //#region Copy to Clipboard
    fallbackCopyTextToClipboard(text: string): boolean {
        var textArea = document.createElement("textarea");
        textArea.value = text;

        // Avoid scrolling to bottom
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        let retVal = false;
        try {
            var successful = document.execCommand('copy');
            retVal = successful;
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
            retVal = false;
        }

        document.body.removeChild(textArea);
        return retVal;
    }

    copyTextToClipboard(text: string): void {
        if (!navigator.clipboard) {
            let success = this.fallbackCopyTextToClipboard(text);
            if(!success)
            {
                throw new Error("Could not copy text");
            }
        }

        navigator.clipboard.writeText(text).then(function () {
            // success
            
        }, function (err) {
            throw new Error('Could not copy text: ', err);
        });
    }
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

        let validRegEx = allowDecimalPoint ? /^[\d.]+$/ : /^\d+$/;

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
