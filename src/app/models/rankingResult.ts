import { Rank } from "./rank";
import { Result } from "./result";

export class RankingResult implements Result {
    constructor(startRating: number, endRating: number, honorTotal: number) {
        this.StartRating = startRating;
        this.EndRating = endRating;
        this.HonorTotal = honorTotal;
        
        this.StartRank = Rank.GetRankFromRating(startRating);
        this.StartRankPercentage = Rank.GetRankPercentageFromRating(startRating);
        this.EndRank = Rank.GetRankFromRating(endRating);
        this.EndRankPercentage = Rank.GetRankPercentageFromRating(endRating);
    }
    HonorTotal: number;
    StartRating: number;
    StartRank: Rank;
    StartRankPercentage: number;
    EndRating: number;
    EndRank: Rank;
    EndRankPercentage: number;
}