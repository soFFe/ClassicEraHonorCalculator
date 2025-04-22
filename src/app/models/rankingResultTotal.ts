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

            // build StepsTakenHash
            this.StepsTakenHash = "";
            this.StepsTaken.forEach((st, i) => {
                if(i > 0)
                {
                    this.StepsTakenHash += "-";
                }
                this.StepsTakenHash += st.HonorTotal;
            });
        }
        else
        {
            throw new Error("Instance of RankingResultTotal cannot be created with an empty stepsTaken Array");
        }
    }
    
    //#region Public Members
    StepsTaken: Array<RankingResult>;
    HasBeenExplored: boolean = false; // flag if we already iterated over this path in the Optimal Path Calculation
    StepsTakenHash: string;
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