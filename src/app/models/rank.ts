import { ConversionBracket } from "./conversionBracket";

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

    constructor({ num, cpRequirement, changeFactor }: { num: number; cpRequirement: number; changeFactor: number; }) {
        this.Num = num;
        this.CpRequirement = cpRequirement;
        this.ChangeFactor = changeFactor;
        const conversionBracket = this.GetConversionBracket();

        if (conversionBracket.Id == 0) {
            this.HonorRequirement = this.CpRequirement * conversionBracket.CpToHonorRate;
        }
        else if (conversionBracket.Id == 1) {
            this.HonorRequirement = 45000 + (this.CpRequirement - 20000) * conversionBracket.CpToHonorRate;
        }
        else {
            this.HonorRequirement = 175000 + (this.CpRequirement - 40000) * conversionBracket.CpToHonorRate;
        }
        this.HonorRequirement = Math.min(this.HonorRequirement, Rank.MaxHonor);

        this.Icon = `assets/rank-icons/${num}.webp`;
    }

    public GetConversionBracket(): ConversionBracket {
        let matchedBracket = 0;
        for (let i = 0; i < Rank.ConversionBrackets.length; i++) {
            const bracket = Rank.ConversionBrackets[i];
            if (this.Num >= bracket.MinRankNum && this.Num <= bracket.MaxRankNum) {
                matchedBracket = bracket.Id;
                break;
            }
        }

        return Rank.ConversionBrackets[matchedBracket];
    }

    //#region Calculation Methods
    public CalculateRankQualificationReward(currentRankNum: number, currentRankProgressPercentage: number, previousRank: Rank): number {
        let cpReward = (this.CpRequirement - previousRank.CpRequirement) * this.ChangeFactor;
        if (currentRankNum == previousRank.Num) { // first bucket
            // "V4 Calculation"
            // This calculation has been introduced to prevent gaming the system by farming Dishonorable Kills
            let cpCutOff = (this.CpRequirement - previousRank.CpRequirement) * this.ChangeFactor;
            switch (currentRankNum) {
                // special cases for the first bucket calculations of R9 and R11
                case 9:
                    cpCutOff = 3000;
                    break;
                case 11:
                    cpCutOff = 2500;
                    break;
            }

            cpReward = Math.min(
                cpCutOff,
                (this.CpRequirement - previousRank.CpRequirement) * (100 - currentRankProgressPercentage) / 100
            );
        }

        return cpReward;
    }

    public CalculateMinHonorForRankQualification(highestQualifiedRank: Rank | undefined): number {
        if (highestQualifiedRank != undefined) {
            if (highestQualifiedRank.Num > this.Num + Rank.MaxRankQualifications) {
                // Can not qualify for a rank this high
                throw new Error(`Could not calculate Honor Cap for Rank ${this.Num} as the provided highest qualified Rank ${highestQualifiedRank.Num} is above the limit of ${this.Num + Rank.MaxRankQualifications}`)
            }
            else if (highestQualifiedRank.Num < this.Num) {
                // Qualification has to match the current rank in order to gain any progress
                return 0;
            }

            // When I say "Bracket" here, I refer to the three different Conversion Rates for R1-R6, R7-R10 and R11-R14
            // For each Bracket this calculation is done only in relation to its own bracket! (thanks Lewkah & Beastinblack)
            const targetConversionBracket = highestQualifiedRank.GetConversionBracket();
            if (targetConversionBracket.Id == 0) {
                return highestQualifiedRank.CpRequirement * targetConversionBracket.CpToHonorRate;
            }
            else if (targetConversionBracket.Id == 1) {
                // magic
                return 45000 + (highestQualifiedRank.CpRequirement - 20000) * targetConversionBracket.CpToHonorRate;
            }
            else {
                // more wizardry for Conversion Bracket 3 (Id:2)
                return 175000 + (highestQualifiedRank.CpRequirement - 40000) * targetConversionBracket.CpToHonorRate;
            }
        }

        return 0;
    }
    //#endregion

    //#region Static Members
    static MaxRankNum: number = 14;
    static MinRankNum: number = 1;
    static MaxHonor: number = 500000;
    static MaxCp: number = 60000;
    static MaxDecayCp: number = 2500;
    static MaxRankQualifications: number = 4;

    static BonusCpMatrix: {[rank: number]: Array<number>} = {
        6: [0, 0, 0, 500],
        7: [0, 0, 500, 500],
        8: [0, 500, 500, 1000],
        9: [0, 0, 500, 500],
        10: [0, 500, 500, 500]
    };

    // Reverse engineered Conversion Rates
    static ConversionBrackets: Array<ConversionBracket> = [
        new ConversionBracket({ id: 0, minRankNum: 1, maxRankNum: 6, cpToHonorRate: 2.25 }),
        new ConversionBracket({ id: 1, minRankNum: 7, maxRankNum: 10, cpToHonorRate: 6.5 }),
        new ConversionBracket({ id: 2, minRankNum: 11, maxRankNum: 14, cpToHonorRate: 16.25 }),
    ];

    // These values have been provided by blizzard in a blue post
    static RankMap: Map<number, Rank> = new Map([
        [1, new Rank({ num: 1, cpRequirement: 0, changeFactor: 1 })],
        [2, new Rank({ num: 2, cpRequirement: 2000, changeFactor: 1 })],
        [3, new Rank({ num: 3, cpRequirement: 5000, changeFactor: 1 })],
        [4, new Rank({ num: 4, cpRequirement: 10000, changeFactor: 0.8 })],
        [5, new Rank({ num: 5, cpRequirement: 15000, changeFactor: 0.8 })],
        [6, new Rank({ num: 6, cpRequirement: 20000, changeFactor: 0.8 })],
        [7, new Rank({ num: 7, cpRequirement: 25000, changeFactor: 0.7 })],
        [8, new Rank({ num: 8, cpRequirement: 30000, changeFactor: 0.7 })],
        [9, new Rank({ num: 9, cpRequirement: 35000, changeFactor: 0.6 })],
        [10, new Rank({ num: 10, cpRequirement: 40000, changeFactor: 0.5 })],
        [11, new Rank({ num: 11, cpRequirement: 45000, changeFactor: 0.5 })],
        [12, new Rank({ num: 12, cpRequirement: 50000, changeFactor: 0.4 })],
        [13, new Rank({ num: 13, cpRequirement: 55000, changeFactor: 0.4 })],
        [14, new Rank({ num: 14, cpRequirement: 60000, changeFactor: 0.34 })]
    ]);

    // Experimental: My guess on Level Caps
    static LevelCpCaps: {[level: number]: number} = {
        1: 6000,
        2: 6000,
        3: 6000,
        4: 6000,
        5: 6000,
        6: 6000,
        7: 6000,
        8: 6000,
        9: 6000,
        10: 6000,
        11: 6000,
        12: 6000,
        13: 6000,
        14: 6000,
        15: 6000,
        16: 6000,
        17: 6000,
        18: 6000,
        19: 6000,
        20: 6000,
        21: 6000,
        22: 6000,
        23: 6000,
        24: 6000,
        25: 6000,
        26: 6000,
        27: 6000,
        28: 6000,
        29: 6000,
        30: 6600,
        31: 7500,
        32: 8400,
        33: 9300,
        34: 10200,
        35: 11100,
        36: 12300,
        37: 13500,
        38: 14700,
        39: 15900,
        40: 17400,
        41: 18900,
        42: 20400,
        43: 21900,
        44: 24000,
        45: 26100,
        46: 28200,
        47: 30300,
        48: 32400,
        49: 34500,
        50: 36600,
        51: 38700,
        52: 40800,
        53: 43200,
        54: 45600,
        55: 48000,
        56: 50400,
        57: 52800,
        58: 55200,
        59: 57600,
        60: this.MaxCp
    }
    //#endregion
}
