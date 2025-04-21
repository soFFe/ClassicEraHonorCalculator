import { Rank } from "./rank";
import { RankingResult } from "./rankingResult";
import { Result } from "./result";

export class RankingResultTotal implements Result {
    constructor(stepsTaken: Array<RankingResult>, honorTotal: number, weeksTotal: number)
    {
        this.StepsTaken = stepsTaken;
        this.HonorTotal = honorTotal;
        this.WeeksTotal = weeksTotal;

        if(stepsTaken.length > 0)
        {
            this.StartRating = stepsTaken[0].StartRating;
            this.StartRank = stepsTaken[0].StartRank;
            this.StartRankPercentage = stepsTaken[0].StartRankPercentage;
            
            this.EndRating = stepsTaken[stepsTaken.length - 1].EndRating;
            this.EndRank = stepsTaken[stepsTaken.length - 1].EndRank;
            this.EndRankPercentage = stepsTaken[stepsTaken.length - 1].EndRankPercentage;
        }
        else
        {
            throw new Error("Instance of RankingResultTotal cannot be created with an empty stepsTaken Array");
        }
    }
    
    //#region Public Members
    StepsTaken: Array<RankingResult>;
    StartRating: number;
    StartRank: Rank;
    StartRankPercentage: number;
    EndRating: number;
    EndRank: Rank;
    EndRankPercentage: number;
    HonorTotal: number;
    WeeksTotal: number;
    //#endregion
}