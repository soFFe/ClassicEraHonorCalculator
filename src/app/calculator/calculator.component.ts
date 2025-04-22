import { Component, Input, ViewEncapsulation } from '@angular/core';
import { Rank } from '../models/rank';
import { QualificationMilestone } from '../models/qualificationMilestone';
import { Router } from '@angular/router';
import { CalculationService } from '../services/calculation.service';
import { RankingResult } from '../models/rankingResult';
import { NgbCollapseModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgIcon } from '@ng-icons/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RankingResultTotal } from '../models/rankingResultTotal';

@Component({
    selector: 'calculator-root',
    templateUrl: './calculator.component.html',
    styleUrls: ['./calculator.component.scss'],
    imports: [
        FormsModule,
        CommonModule,
        NgIcon,
        NgbModule,
        NgbCollapseModule
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [CalculationService]
})
export class CalculatorComponent {
    //#region characterLevel
    private _characterLevel: number = 60;
    public get characterLevel(): number {
        return this._characterLevel;
    }

    @Input()
    public set characterLevel(value: number) {
        if(isNaN(value))
        {
            this._characterLevel = 60;
        }
        else if (value < 1) {
            this._characterLevel = 1;
        }
        else if(value > 60) {
            this._characterLevel = 60;
        }
        else {
            this._characterLevel = Number(value);
        }

        this.updateUrl();
        this.CalculateResults();
    }
    //#endregion
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
            this.rankProgress = "0";
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

        if(this.currentRankNum > this.targetRankNum)
        {
            this.targetRankNum = this.currentRankNum;
        }
        this.qualificationMilestones = this.DisplayQualificationMilestones();
        this.updateUrl();
        this.CalculateResults();
        this.TriggerOptimalPathCalculation();
    }
    //#endregion
    //#region targetRankNum
    private _targetRankNum: number = 14;
    public get targetRankNum(): number {
        return this._targetRankNum;
    }

    @Input()
    public set targetRankNum(value: number) {
        if (isNaN(value)) {
            this._targetRankNum = Rank.MaxRankNum;
        }
        else if (value < this.currentRankNum) {
            this._targetRankNum = this.currentRankNum;
        }
        else if (value > Rank.MaxRankNum) {
            this._targetRankNum = Rank.MaxRankNum;
        } else {
            this._targetRankNum = Number(value);
        }

        const rTarget = Rank.RankMap.get(this._targetRankNum);
        if (!rTarget) {
            throw new Error(`Could not find Rank ${this._targetRankNum} in RankMap`);
        }

        this.targetRank = rTarget;
        this.TriggerOptimalPathCalculation();
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
        this.CalculateResults();
        this.TriggerOptimalPathCalculation();
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

        if(!this.bIsDraggingRangeInput)
        {
            this.updateUrl();
        }

        this.CalculateResults();
    }
    //#endregion
    //#region factionNames
    private _factionNames: number = 0;
    public get factionNames(): number {
        return this._factionNames;
    }

    @Input()
    public set factionNames(value: number) {
        if (isNaN(value))
            this._factionNames = 0;
        else if(value < 0)
            this._factionNames = 0;
        else if(value > 3)
            this._factionNames = 0;
        else
            this._factionNames = Number(value);
    }
    //#endregion
    bIsDraggingRangeInput = false; // save performance by updating the Url only when we stop dragging the range input
    detailedInfoIsCollapsed = true;

    qualificationMilestones: QualificationMilestone[];
    ranks: Array<Rank> = Array.from(Rank.RankMap.values());
    currentRank: Rank;
    targetRank: Rank;
    rankingResult!: RankingResult;
    maxRankingResult!: RankingResult;
    optimalPath!: RankingResultTotal;
    numExploredPaths!: number;

    constructor(private router: Router, private calculationService: CalculationService) {
        const rCurrent = Rank.RankMap.get(this.currentRankNum);
        if (!rCurrent) {
            throw new Error(`Could not find Rank ${this.currentRankNum} in RankMap`);
        }
        this.currentRank = rCurrent;

        const rTarget = Rank.RankMap.get(this.targetRankNum);
        if (!rTarget) {
            throw new Error(`Could not find Rank ${this.targetRankNum} in RankMap`);
        }
        this.targetRank = rTarget;

        this.qualificationMilestones = this.DisplayQualificationMilestones();
        this.CalculateResults();
        this.TriggerOptimalPathCalculation();
    }

    CalculateResults() {
        this.rankingResult = new RankingResult(
            this.calculationService.CalculateCurrentRating(this.currentRank, this.rankProgress),
            this.calculationService.CalculateNextRating(this.currentRank, this.rankProgress, this.honorFarmed, this.characterLevel),
            this.honorFarmed
        );
        this.maxRankingResult = new RankingResult(
            this.calculationService.CalculateCurrentRating(this.currentRank, this.rankProgress),
            this.calculationService.CalculateCurrentRating(this.currentRank, this.rankProgress) + this.calculationService.CalculateMaxRatingGain(this.currentRank, this.rankProgress),
            this.calculationService.CalculateMinimumHonorForRatingGain(this.currentRank, this.rankProgress, this.calculationService.CalculateMaxRatingGain(this.currentRank, this.rankProgress))
        );
    }

    TriggerOptimalPathCalculation() { // save performance where possible
        this.optimalPath = this.CalculateOptimalPath(this.currentRank, this.rankProgress, this.targetRank);
    }

    //#region Optimal Path
    CalculateOptimalPath(startRank: Rank, startRankProgress: number, endRank: Rank) {
        const stepsTaken: Array<RankingResult> = [];
        let honorTotal = 0;
        let currentRank = startRank;
        let currentRankProgress = startRankProgress;
        let currentRating = this.calculationService.CalculateCurrentRating(currentRank, currentRankProgress);
        let i = 0;
        if(currentRating >= endRank.CpRequirement)
        {
            return new RankingResultTotal([new RankingResult(currentRating, currentRating, 0)], 0, 0);
        }

        // just iterate through the weeks to find the lowest amount of weeks possible, as this is our first priority
        for(; i < 20; i++)
        {
            const maxRatingGain = this.calculationService.CalculateMaxRatingGain(currentRank, currentRankProgress); // go for the highest available milestone every week
            const minHonor = this.calculationService.CalculateMinimumHonorForRatingGain(currentRank, currentRankProgress, maxRatingGain); // make sure we're making use of the decay prevention hop, bonusCP and R9/R11 special cases

            const result = new RankingResult(currentRating, currentRating + maxRatingGain, minHonor);
            stepsTaken.push(result);
            honorTotal += minHonor;

            if(currentRating + maxRatingGain >= endRank.CpRequirement)
            {
                break;
            }

            currentRating += maxRatingGain;
            currentRank = Rank.GetRankFromRating(currentRating);
            currentRankProgress = Rank.GetRankPercentageFromRating(currentRating);
        }

        const firstTry = new RankingResultTotal(stepsTaken, honorTotal, i);
        
        // okay we found the lowest amount of weeks possible. now try to minimize the honor necessary to reach our goal by exploring other possibilities
        const allPaths = this.ExploreAllPathOptions(endRank, firstTry);

        // repeat process until we explored every possible path
        let unexploredPaths = Array.from(allPaths.filter(p => p.HasBeenExplored == false)); // copy array of unexplored paths
        if(unexploredPaths.length > 0)
        {
            while(unexploredPaths.length > 0)
            {
                for(let j = unexploredPaths.length - 1; j >= 0; j--)
                {
                    const path = unexploredPaths[j];
                    const pathIndex = allPaths.findIndex(p => p.StepsTakenHash == path.StepsTakenHash);
                    const pathAlreadyExplored = path.HasBeenExplored || (pathIndex !== -1 && allPaths[pathIndex].HasBeenExplored);

                    if(pathAlreadyExplored)
                    {
                        // double double check so we don't end up in an infinite loop
                        console.warn("We already explored this path: ", path.StepsTakenHash);
                        // we already know this path, pop it from unexploredPaths and skip
                        unexploredPaths.pop();
                        continue;
                    }

                    const newPaths = this.ExploreAllPathOptions(endRank, path);
                    
                    // any new paths that havent been explored?
                    newPaths.filter(np => !np.HasBeenExplored).forEach(np => {
                        const newPathIndex = allPaths.findIndex(ap => ap.StepsTakenHash == np.StepsTakenHash);
                        if(newPathIndex === -1) // make sure we only add new paths (to possibly explore) to allPaths
                        {
                            allPaths.push(np); // add new discovery to allPaths
                        }
                    });

                    unexploredPaths.pop(); // pop this now explored path from the array
                }

                // we emptied previos unexplored paths, lets see if there's new ones and if yes, repeat this process
                unexploredPaths = allPaths.filter(p => p.HasBeenExplored == false);
            }
        }

        this.numExploredPaths = allPaths.length;

        return this.ChooseBestPathOption(allPaths);
    }

    ExploreAllPathOptions(endRank: Rank, firstTry: RankingResultTotal)
    {
        const allPossiblePaths: Array<RankingResultTotal> = [firstTry];
        
        for(let i = 0; i < firstTry.StepsTaken.length; i++)
        {
            // are there any alternative options for this step?
            const stepRanksQualified = this.calculationService.CalculateQualifiedRanks(firstTry.StepsTaken[i].StartRank, firstTry.StepsTaken[i].HonorTotal);
            if(stepRanksQualified.length < 1)
            {
                throw new Error("Something went incredibly wrong");
            }
            else if(stepRanksQualified.length == 1 || stepRanksQualified.length == 2) // first two qualifications are basically one and the same due to the decay prevention hop
            {
                // there was only one possibility - skip this step, as it is undeniably an essential amount of honor
                continue;
            }
            else // length is 3, 4 or 5 (qualified for starting Rank +2, +3 or +4)
            {
                // there are other options
                stepRanksQualified.pop(); // last time we hit the highest milestone here, so let's delete that from the array
                const numAlternativeOptions = stepRanksQualified.length - 1; // -1 as the second milestone is worthless because of the decay prevention hop, so it's not a real option.
                
                for(let option = numAlternativeOptions; option > 0; option--) // loop through options as long as there are options (> 0)
                {
                    const stepsTaken = firstTry.StepsTaken.slice(0, i); // copy firstTry's path up until here, since we only wanna start departing from here
                    let honorTotal = 0;
                    stepsTaken.forEach(step => honorTotal += step.HonorTotal); // sum honorTotal up until here
                    if(numAlternativeOptions == 1)
                    {
                        // we want to use the decay prevention hop ideally, so we pop the useless milestone to minimize our honor (only happens if the original stepRanksQualified length was 3)
                        stepRanksQualified.pop();
                    }
                    
                    // go through the motions otherwise and see where we end up
                    let reachedGoalInTime = false;
                    let currentRank = firstTry.StepsTaken[i].StartRank;
                    let currentRankProgress = firstTry.StepsTaken[i].StartRankPercentage;
                    let currentRating = this.calculationService.CalculateCurrentRating(currentRank, currentRankProgress);
                    let weekIndex = i;
                    for(; weekIndex < firstTry.StepsTaken.length; weekIndex++)
                    {
                        let maxRatingGain = this.calculationService.CalculateMaxRatingGain(currentRank, currentRankProgress); // go for the highest available milestone every week
                        if(weekIndex == i) // except for the week we wanna change
                        {
                            maxRatingGain = this.calculationService.CalculateRatingGain(currentRank, currentRankProgress, stepRanksQualified.slice(0, option + 1));
                        }
                        const minHonor = this.calculationService.CalculateMinimumHonorForRatingGain(currentRank, currentRankProgress, maxRatingGain); // make sure we're making use of the decay prevention hop, bonusCP and R9/R11 special cases

                        const result = new RankingResult(currentRating, currentRating + maxRatingGain, minHonor);
                        stepsTaken.push(result);
                        honorTotal += minHonor;

                        if(currentRating + maxRatingGain >= endRank.CpRequirement)
                        {
                            reachedGoalInTime = true;
                            break;
                        }

                        currentRating += maxRatingGain;
                        currentRank = Rank.GetRankFromRating(currentRating);
                        currentRankProgress = Rank.GetRankPercentageFromRating(currentRating);
                    }

                    if(reachedGoalInTime)
                    {
                        // this is a possible path, save it
                        allPossiblePaths.push(new RankingResultTotal(stepsTaken, honorTotal, weekIndex));
                    }

                    stepRanksQualified.pop(); // remove our used alternative from the array
                }
            }
        }

        firstTry.HasBeenExplored = true; // setting this here thankfully propagates back to allPossiblePaths
        
        return allPossiblePaths;
    }

    ChooseBestPathOption(results: RankingResultTotal[]): RankingResultTotal
    {
        if(results.length <= 0)
        {
            throw new Error("ChooseBestPathOption was given an empty array");
        }
        else if(results.length > 1)
        {
            let bestResult = results[0];

            for(let i = 1; i < results.length; i++)
            {
                const currentEntry = results[i];
                if(currentEntry.WeeksTotal < bestResult.WeeksTotal) // priority 1: fastest way
                    bestResult = currentEntry;
                else if(currentEntry.WeeksTotal == bestResult.WeeksTotal && currentEntry.HonorTotal < bestResult.HonorTotal) // priority 2: least amount of honor
                    bestResult = currentEntry;
                else if(currentEntry.WeeksTotal == bestResult.WeeksTotal && currentEntry.HonorTotal <= bestResult.HonorTotal && currentEntry.EndRank.Num > bestResult.EndRank.Num) // priority 3: least amount of honor, highest ranknum
                    bestResult = currentEntry;
            }

            return bestResult;
        }
        
        // results.length is 1
        return results[0]; // nothing to choose, our only option is the best option
    }
    //#endregion

    //#region Display Methods
    DisplayMaxRatingGain(): number {
        return Math.round(this.calculationService.CalculateMaxRatingGain(this.currentRank, this.rankProgress));
    }

    DisplayNextRankIconUrl(): string {
        return this.DisplayRankIconUrl(this.rankingResult.EndRank.Num);
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
        return Math.round(this.rankingResult.StartRating);
    }

    DisplayNextRating(): number {
        return Math.round(this.rankingResult.EndRating);
    }

    DisplayRatingChange(): number {
        return Math.round(this.rankingResult.EndRating - this.rankingResult.StartRating);
    }

    DisplayMilestoneProgress(ms: QualificationMilestone, index: number): number {
        const previousRankRequirement = (index > 0 ? this.qualificationMilestones[index - 1].HonorRequirement : 0);
        return Math.max(Math.min((this.honorFarmed - previousRankRequirement) / (ms.HonorRequirement - previousRankRequirement), 1), 0) * ms.HonorRequirementPercentage;
    }

    DisplayMinimumHonorForMaxRatingGain(): number {
        return this.calculationService.CalculateMinimumHonorForRatingGain(this.currentRank, this.rankProgress, this.calculationService.CalculateMaxRatingGain(this.currentRank, this.rankProgress));
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
        this.router.navigate(["/calculator", this.currentRankNum, this.rankProgress, this.honorFarmed, this.characterLevel]);
    }
}
