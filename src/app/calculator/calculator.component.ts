import { Component, Input, ViewEncapsulation } from '@angular/core';
import { Rank } from '../models/rank';
import { QualificationMilestone } from '../models/qualificationMilestone';
import { Router } from '@angular/router';
import { CalculationService } from '../services/calculation.service';

@Component({
    selector: 'calculator-root',
    templateUrl: './calculator.component.html',
    styleUrls: ['./calculator.component.scss'],
    encapsulation: ViewEncapsulation.None,
    providers: [CalculationService]
})
export class CalculatorComponent {
    //#region currentRankNum
    private _currentRankNum: number = 1;
    public get currentRankNum(): number {
        return this._currentRankNum;
    }

    @Input()
    public set currentRankNum(value: number) {
        if (isNaN(value)) {
            this._currentRankNum = Rank.MinRankNum;
        }
        else if (value < Rank.MinRankNum) {
            this._currentRankNum = Rank.MinRankNum;
        }
        else if (value > Rank.MaxRankNum) {
            this._currentRankNum = Rank.MaxRankNum;
        } else {
            this._currentRankNum = Number(value);
        }

        const rCurrent = Rank.RankMap.get(this.currentRankNum);
        if (!rCurrent) {
            throw new Error(`Could not find Rank ${this.currentRankNum} in RankMap`);
        }

        this.currentRank = rCurrent;
        this.qualificationMilestones = this.DisplayQualificationMilestones();
        this.updateUrl();
    }
    //#endregion
    //#region rankProgress
    private _rankProgress: number = 0;
    public get rankProgress(): number {
        return this._rankProgress;
    }

    @Input()
    public set rankProgress(value: string) {
        if (value != undefined)
            value = value.replaceAll(/,/g, '.');

        if (isNaN(Number(value)))
            this._rankProgress = 0;
        else if (Number(value) < 0)
            this._rankProgress = 0;
        else if (Number(value) > 100)
            this._rankProgress = 100;
        else
            this._rankProgress = Number(value);

        this.updateUrl();
    }
    //#endregion
    //#region honorFarmed
    private _honorFarmed: number = 0;
    public get honorFarmed(): number {
        return this._honorFarmed;
    }

    @Input()
    public set honorFarmed(value: number) {
        if (isNaN(value))
            this._honorFarmed = 0;
        else if (value < 0)
            this._honorFarmed = 0;
        else if (value > Rank.MaxHonor)
            this._honorFarmed = Rank.MaxHonor
        else
            this._honorFarmed = Number(value);

        this.updateUrl();
    }
    //#endregion

    qualificationMilestones: QualificationMilestone[];
    ranks: Array<number> = Array.from(Rank.RankMap.keys()).filter(n => n <= Rank.MaxRankNum);
    currentRank: Rank;

    constructor(private router: Router, private calculationService: CalculationService) {
        const rCurrent = Rank.RankMap.get(this.currentRankNum);
        if (!rCurrent) {
            throw new Error(`Could not find Rank ${this.currentRankNum} in RankMap`);
        }

        this.currentRank = rCurrent;
        this.qualificationMilestones = this.DisplayQualificationMilestones();
    }

    //#region Display Methods
    DisplayMaxRatingGain(): number {
        return Math.round(this.calculationService.CalculateMaxRatingGain(this.currentRank, this.rankProgress));
    }

    DisplayNextRankIconUrl(): string {
        return this.DisplayRankIconUrl(this.calculationService.CalculateNextRankNum(this.currentRank, this.rankProgress, this.honorFarmed));
    }

    DisplayRankIconUrl(rankNum: number): string {
        const rank = Rank.RankMap.get(rankNum);
        if (!rank) {
            throw new Error(`Could not find Rank ${rankNum}} in RankMap`);
        }

        return rank.Icon;
    }

    DisplayQualifiedRank(): number {
        const qualifiedRanks = Array.from(Rank.RankMap.values())
            .filter(r => r.Num <= Math.min(this.currentRankNum + Rank.MaxRankQualifications, Rank.MaxRankNum), this);
        const initialLen = qualifiedRanks.length;

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
        return this.calculationService.CalculateNextRankPercentage(this.currentRank, this.rankProgress, this.honorFarmed).toFixed(2);
    }

    DisplayQualificationMilestones(): QualificationMilestone[] {
        const maxQualifiedRanks = Array.from(Rank.RankMap.values())
            .filter(r => r.Num >= this.currentRankNum && r.Num != this.currentRankNum + 1 && r.Num <= Math.min(this.currentRankNum + Rank.MaxRankQualifications, Rank.MaxRankNum), this);

        const milestones: QualificationMilestone[] = [];
        for (let i = 0; i < maxQualifiedRanks.length; i++) {
            const ms = new QualificationMilestone(maxQualifiedRanks[i], maxQualifiedRanks[maxQualifiedRanks.length - 1])
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

    DisplayCurrentRating(): number {
        return Math.round(this.calculationService.CalculateCurrentRating(this.currentRank, this.rankProgress));
    }

    DisplayNextRating(): number {
        return Math.round(this.calculationService.CalculateNextRating(this.currentRank, this.rankProgress, this.honorFarmed));
    }

    DisplayRatingChange(): number {
        return Math.round(this.calculationService.CalculateNextRating(this.currentRank, this.rankProgress, this.honorFarmed) - this.calculationService.CalculateCurrentRating(this.currentRank, this.rankProgress));
    }

    DisplayNextRankNum(): number {
        return this.calculationService.CalculateNextRankNum(this.currentRank, this.rankProgress, this.honorFarmed);
    }

    DisplayMaxNextRankNum(): number {
        return this.calculationService.CalculateMaxNextRankNum(this.currentRank, this.rankProgress);
    }

    DisplayMaxNextRankPercentage(): string {
        return this.calculationService.CalculateMaxNextRankPercentage(this.currentRank, this.rankProgress).toFixed(2);
    }

    DisplayMilestoneProgress(ms: QualificationMilestone, index: number): number {
        const previousRankRequirement = (index > 0 ? this.qualificationMilestones[index - 1].HonorRequirement : 0);
        return Math.max(Math.min((this.honorFarmed - previousRankRequirement) / (ms.HonorRequirement - previousRankRequirement), 1), 0) * ms.HonorRequirementPercentage;
    }

    DisplayMinimumHonorForMaxRatingGain(): number {
        return this.calculationService.CalculateMinimumHonorForMaxRatingGain(this.currentRank);
    }

    //#endregion

    //#region Copy to Clipboard
    fallbackCopyTextToClipboard(text: string): boolean {
        const textArea = document.createElement("textarea");
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
            const successful = document.execCommand('copy');
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
            const success = this.fallbackCopyTextToClipboard(text);
            if (!success) {
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

        const elInput = <HTMLInputElement>e.target;
        let nextVal = "";
        const validRegEx = allowDecimalPoint ? /^\d+(?:[,.])?(?:\d+)?$/ : /^\d+$/;

        if (elInput.selectionStart) {
            nextVal += elInput.value.substring(0, elInput.selectionStart)
        }
        nextVal += (e.data ?? "")
        if (elInput.selectionEnd) {
            nextVal += elInput.value.substring(elInput.selectionEnd);
        }

        // remove invalid inputs
        if (!validRegEx.test(nextVal)) {
            e.preventDefault();
            return;
        }
    }

    validateNumberOnChange(e: Event, min: number, max: number): void {
        const elInput = <HTMLInputElement>e.target;

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

    updateUrl(): void {
        this.router.navigate(["/calculator", this.currentRankNum, this.rankProgress, this.honorFarmed]);
    }
}
