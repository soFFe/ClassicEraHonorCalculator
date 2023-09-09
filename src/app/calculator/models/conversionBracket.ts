import { Rank } from "./rank";
import { RankData } from "./rankdata";

export class ConversionBracket {
    private _Id!: number;
    private _MinRankNum!: number;
    private _MaxRankNum!: number;
    private _CpToHonorRate!: number;

    //#region Property Getters & Setters
    public get MinRankNum(): number {
        return this._MinRankNum;
    }
    private set MinRankNum(value: number) {
        this._MinRankNum = value;
    }
    
    public get MaxRankNum(): number {
        return this._MaxRankNum;
    }
    private set MaxRankNum(value: number) {
        this._MaxRankNum = value;
    }

    public get Id(): number {
        return this._Id;
    }
    private set Id(value: number) {
        this._Id = value;
    }

    public get CpToHonorRate(): number {
        return this._CpToHonorRate;
    }
    private set CpToHonorRate(value: number) {
        this._CpToHonorRate = value;
    }
    //#endregion

    constructor({ id, minRankNum, maxRankNum, cpToHonorRate }: { id: number; minRankNum: number; maxRankNum: number; cpToHonorRate: number; }) {
        this.Id = id;
        this.MinRankNum = minRankNum;
        this.MaxRankNum = maxRankNum;
        this.CpToHonorRate = cpToHonorRate;
    }
}