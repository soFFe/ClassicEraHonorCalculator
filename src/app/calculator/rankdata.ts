export class ConversionBracket {
    private _Id!: number;
    private _MinRankNum!: number;
    private _MinRank!: Rank;
    private _MaxRankNum!: number;
    private _MaxRank!: Rank;
    private _CpToHonorRate!: number;

    //#region Property Getters & Setters
    public get MinRankNum(): number {
        return this._MinRankNum;
    }
    private set MinRankNum(value: number) {
        this._MinRankNum = value;
        if (value >= RankData.MinRankNum && value <= RankData.MaxRankNum) {
            let rankInstance = RankData.RankMap.get(value);
            if (rankInstance) {
                this.MinRank = rankInstance;
            }
        }
    }

    public get MinRank(): Rank {
        return this._MinRank;
    }
    private set MinRank(value: Rank) {
        this._MinRank = value;
    }

    public get MaxRankNum(): number {
        return this._MaxRankNum;
    }
    private set MaxRankNum(value: number) {
        this._MaxRankNum = value;

        if (value >= RankData.MinRankNum && value <= RankData.MaxRankNum) {
            let rankInstance = RankData.RankMap.get(value);
            if (rankInstance) {
                this.MaxRank = rankInstance;
            }
        }
    }

    public get MaxRank(): Rank {
        return this._MaxRank;
    }
    private set MaxRank(value: Rank) {
        this._MaxRank = value;
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

export class Rank {
    private _Num!: number;
    private _CpRequirement!: number;
    private _ChangeFactor!: number;
    private _HonorRequirement!: number;
    private _Icon!: string;

    //#region Property Getters & Setters
    public get Num(): number {
        return this._Num;
    }
    private set Num(value: number) {
        this._Num = value;
    }
    public get CpRequirement(): number {
        return this._CpRequirement;
    }
    private set CpRequirement(value: number) {
        this._CpRequirement = value;
    }
    public get ChangeFactor(): number {
        return this._ChangeFactor;
    }
    private set ChangeFactor(value: number) {
        this._ChangeFactor = value;
    }
    public get Icon(): string {
        return this._Icon;
    }
    private set Icon(value: string) {
        this._Icon = value;
    }
    public get HonorRequirement(): number {
        return this._HonorRequirement;
    }
    private set HonorRequirement(value: number) {
        this._HonorRequirement = value;
    }
    //#endregion

    constructor({ num, cpRequirement, changeFactor, honorRequirement }: { num: number; cpRequirement: number; changeFactor: number; honorRequirement: number; }) {
        this.Num = num;
        this.CpRequirement = cpRequirement;
        this.ChangeFactor = changeFactor;
        this.HonorRequirement = honorRequirement;
        this.Icon = `assets/rank-icons/${num}.webp`;
    }

    public GetConversionBracket(): ConversionBracket {
        let matchedBracket = 0;
        for (let i = 0; i < RankData.ConversionBrackets.length; i++) {
            let bracket = RankData.ConversionBrackets[i];
            if (this.Num >= bracket.MinRankNum && this.Num <= bracket.MaxRankNum) {
                matchedBracket = bracket.Id;
                break;
            }
        }

        return RankData.ConversionBrackets[matchedBracket];
    }

    public CalculateRankQualificationReward(previousRank: Rank | undefined): number {
        if (previousRank != undefined) {
            let cpReward = (this.CpRequirement - previousRank.CpRequirement) * this.ChangeFactor;
            return cpReward;
        }
        return 0;
    }

    public CalculateMinHonorForRankQualification(currentRank: Rank, highestQualifiedRank: Rank | undefined): number {
        if (highestQualifiedRank != undefined) {
            if (highestQualifiedRank.Num > this.Num + RankData.MaxRankQualifications) {
                // Can not qualify for a rank this high
                throw new Error(`Could not calculate Honor Cap for Rank ${this.Num} as the provided highest qualified Rank ${highestQualifiedRank.Num} is above the limit of ${this.Num + RankData.MaxRankNum - 1}`)
            }

            if (highestQualifiedRank.Num <= this.Num && this.Num != RankData.MaxRankNum) {
                // Qualification has to be above the current rank to not decay, except for R14.
                return 0;
            }

            // When I say "Bracket" here, I refer to the three different Conversion Rates for R1-R6, R7-R10 and R11-R14
            // For each Bracket this calculation is done only in relation to its own bracket! (thanks Lewkah & Beastinblack)
            let qualifiedConversionBracket = highestQualifiedRank.GetConversionBracket();
            if (qualifiedConversionBracket.Id == 0) {
                return highestQualifiedRank.CpRequirement * qualifiedConversionBracket.CpToHonorRate;
            }
            else if (qualifiedConversionBracket.Id == 1) {
                // magic
                return 45000 + (highestQualifiedRank.CpRequirement - 20000) * qualifiedConversionBracket.CpToHonorRate;
            }
            else {
                // more wizardry for Conversion Bracket 3 (Id:2)
                return 175000 + (highestQualifiedRank.CpRequirement - 40000) * qualifiedConversionBracket.CpToHonorRate;
            }
        }

        return 0;
    }
}

export class RankData {
    static MaxRankNum: number = 14;
    static MinRankNum: number = 1;
    static MaxHonor: number = 500000;
    static MaxCp: number = 60000;
    static MaxRankQualifications: number = 4;

    // Some of these values have been provided by blizzard in a blue post, most of these values have been reverse engineered by Beastinblack @ Firemaw-EU
    static RankMap: Map<number, Rank> = new Map([
        [1, new Rank({ num: 1, cpRequirement: 0, changeFactor: 1.0, honorRequirement: 0 })],
        [2, new Rank({ num: 2, cpRequirement: 2000, changeFactor: 1.0, honorRequirement: 4500 })],
        [3, new Rank({ num: 3, cpRequirement: 5000, changeFactor: 1.0, honorRequirement: 11250 })],
        [4, new Rank({ num: 4, cpRequirement: 10000, changeFactor: 0.8, honorRequirement: 22500 })],
        [5, new Rank({ num: 5, cpRequirement: 15000, changeFactor: 0.8, honorRequirement: 33750 })],
        [6, new Rank({ num: 6, cpRequirement: 20000, changeFactor: 0.8, honorRequirement: 45000 })],
        [7, new Rank({ num: 7, cpRequirement: 25000, changeFactor: 0.7, honorRequirement: 77510 })],
        [8, new Rank({ num: 8, cpRequirement: 30000, changeFactor: 0.7, honorRequirement: 110020 })],
        [9, new Rank({ num: 9, cpRequirement: 35000, changeFactor: 0.6, honorRequirement: 142530 })],
        [10, new Rank({ num: 10, cpRequirement: 40000, changeFactor: 0.5, honorRequirement: 175040 })],
        [11, new Rank({ num: 11, cpRequirement: 45000, changeFactor: 0.5, honorRequirement: 256250 })],
        [12, new Rank({ num: 12, cpRequirement: 50000, changeFactor: 0.4, honorRequirement: 337500 })],
        [13, new Rank({ num: 13, cpRequirement: 55000, changeFactor: 0.4, honorRequirement: 418750 })],
        [14, new Rank({ num: 14, cpRequirement: 60000, changeFactor: 0.34, honorRequirement: 500000 })]
    ]);

    static ConversionBrackets: Array<ConversionBracket> = [
        new ConversionBracket({ id: 0, minRankNum: 1, maxRankNum: 6, cpToHonorRate: 2.25 }),
        new ConversionBracket({ id: 1, minRankNum: 7, maxRankNum: 10, cpToHonorRate: 6.502 }),
        new ConversionBracket({ id: 2, minRankNum: 11, maxRankNum: 14, cpToHonorRate: 16.25 }),
    ];
}