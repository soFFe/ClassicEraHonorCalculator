import { Rank } from "./rank";

export interface Result {
    //#region Public Members
    StartRating: number;
    StartRank: Rank;
    StartRankPercentage: number;
    EndRating: number;
    EndRank: Rank;
    EndRankPercentage: number;
    HonorTotal: number;
    //#endregion
}