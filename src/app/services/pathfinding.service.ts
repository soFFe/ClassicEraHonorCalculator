import { Injectable } from '@angular/core';
import { Rank } from '../models/rank';
import { RankingResult } from '../models/rankingResult';
import { RankingResultTotal } from '../models/rankingResultTotal';
import { CalculationService } from './calculation.service';

@Injectable({
    providedIn: 'root'
})
export class PathfindingService {
    constructor(private calculationService: CalculationService) { } // Inject CalculationService

    FindOptimalPath(startRank: Rank, startRankProgress: number, endRank: Rank) {
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

                // we emptied previous unexplored paths, lets see if there's new ones and if yes, repeat this process
                unexploredPaths = allPaths.filter(p => p.HasBeenExplored == false);
            }
        }

        return this.ChooseBestPathOption(allPaths);
    }

    private ExploreAllPathOptions(endRank: Rank, firstTry: RankingResultTotal)
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

    private ChooseBestPathOption(results: RankingResultTotal[]): RankingResultTotal
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
}