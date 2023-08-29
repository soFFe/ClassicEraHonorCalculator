export class Rank {
    private _Num!: number;
    private _CpRequirement!: number;
    private _ChangeFactor!: number;
    private _HonorConversionFactor!: number;
    private _Icon!: string;

    //#region Property Getters & Setters
    public get Num(): number {
        return this._Num;
    }
    public set Num(value: number) {
        this._Num = value;
    }
    public get CpRequirement(): number {
        return this._CpRequirement;
    }
    public set CpRequirement(value: number) {
        this._CpRequirement = value;
    }
    public get ChangeFactor(): number {
        return this._ChangeFactor;
    }
    public set ChangeFactor(value: number) {
        this._ChangeFactor = value;
    }
    public get HonorConversionFactor(): number {
        return this._HonorConversionFactor;
    }
    public set HonorConversionFactor(value: number) {
        this._HonorConversionFactor = value;
    }
    public get Icon(): string {
        return this._Icon;
    }
    public set Icon(value: string) {
        this._Icon = value;
    }
    //#endregion

    constructor({ num, cpRequirement, changeFactor, honorConversionFactor }: { num: number; cpRequirement: number; changeFactor: number; honorConversionFactor: number; }) {
        this.Num = num;
        this.CpRequirement = cpRequirement;
        this.ChangeFactor = changeFactor;
        this.HonorConversionFactor = honorConversionFactor;
        this.Icon = `assets/rank-icons/${num}.webp`;
    }

    public CalculateRankQualificationReward(previousRank: Rank | undefined): number {
        if (previousRank != undefined) {
            let cpReward = (this.CpRequirement - previousRank.CpRequirement) * this.ChangeFactor;
            // console.debug("Reward for Rank %d: %d", this.Num, cpReward);
            return cpReward;
        }
        return 0;
    }
}

export class RankData {
    static MaxRankNum: number = 14;
    static MinRankNum: number = 1;
    static MaxHonor: number = 500000;
    static MaxCp: number = 65000;
    static MaxRankQualifications: number = 4;

    static RankMap: Map<number, Rank> = new Map([
        [1, new Rank({ num: 1, cpRequirement: 0, changeFactor: 1.0, honorConversionFactor: 20000 / 45000 })],
        [2, new Rank({ num: 2, cpRequirement: 2000, changeFactor: 1.0, honorConversionFactor: 20000 / 45000 })],
        [3, new Rank({ num: 3, cpRequirement: 5000, changeFactor: 1.0, honorConversionFactor: 20000 / 45000 })],
        [4, new Rank({ num: 4, cpRequirement: 10000, changeFactor: 0.8, honorConversionFactor: 20769 / 50000 })],
        [5, new Rank({ num: 5, cpRequirement: 15000, changeFactor: 0.8, honorConversionFactor: 20000 / 45000 })],
        [6, new Rank({ num: 6, cpRequirement: 20000, changeFactor: 0.8, honorConversionFactor: 20000 / 45000 })],
        [7, new Rank({ num: 7, cpRequirement: 25000, changeFactor: 0.7, honorConversionFactor: 40000 / 175000 })],
        [8, new Rank({ num: 8, cpRequirement: 30000, changeFactor: 0.7, honorConversionFactor: 40000 / 175000 })],
        [9, new Rank({ num: 9, cpRequirement: 35000, changeFactor: 0.6, honorConversionFactor: 40000 / 175000 })],
        [10, new Rank({ num: 10, cpRequirement: 40000, changeFactor: 0.5, honorConversionFactor: 40000 / 175000 })],
        [11, new Rank({ num: 11, cpRequirement: 45000, changeFactor: 0.5, honorConversionFactor: 65000 / 500000 })],
        [12, new Rank({ num: 12, cpRequirement: 50000, changeFactor: 0.4, honorConversionFactor: 65000 / 500000 })],
        [13, new Rank({ num: 13, cpRequirement: 55000, changeFactor: 0.4, honorConversionFactor: 65000 / 500000 })],
        [14, new Rank({ num: 14, cpRequirement: 60000, changeFactor: 0.34, honorConversionFactor: 65000 / 500000 })]
    ]);
}