import { ConversionBracket } from "./conversionBracket";
import { RankName } from "./rankName";

export class Rank {
    private _Num!: number;
    private _CpRequirement!: number;
    private _ChangeFactor!: number;
    private _HonorRequirement!: number;
    private _Icon!: string;
    private _Name!: RankName;

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
    public get Name(): RankName {
        return this._Name;
    }
    public set Name(value: RankName) {
        this._Name = value;
    }
    //#endregion

    constructor({ num, cpRequirement, changeFactor, name }: { num: number; cpRequirement: number; changeFactor: number; name: RankName; }) {
        this.Num = num;
        this.CpRequirement = cpRequirement;
        this.ChangeFactor = changeFactor;
        this.Name = name;
        this.Icon = `assets/rank-icons/${num}.webp`;
        this.HonorRequirement = this._CalculateHonorRequirement();
    }

    private _CalculateHonorRequirement(): number {
        const conversionBracket = this._GetConversionBracket();
        let honorRequirement = 0;

        if (conversionBracket.Id == 0) {
            // Conversion Bracket #0: R1-R6
            honorRequirement = this.CpRequirement * conversionBracket.CpToHonorRate;
        }
        else if (conversionBracket.Id == 1) {
            // Conversion Bracket #1: R7-R10
            // this.HonorRequirement = R6.HonorRequirement + ([R7/R8/R9/R10].CpRequirement - R6.CpRequirement) * CpToHonorRate
            honorRequirement = 45000 + (this.CpRequirement - 20000) * conversionBracket.CpToHonorRate;
        }
        else {
            // Conversion Bracket #2: R11-R14
            // this.HonorRequirement = R10.HonorRequirement + ([R11/R12/R13/R14].CpRequirement - R10.CpRequirement) * CpToHonorRate
            honorRequirement = 175000 + (this.CpRequirement - 40000) * conversionBracket.CpToHonorRate;
        }
        honorRequirement = Math.min(honorRequirement, Rank.MaxHonor);

        return honorRequirement;
    }

    private _GetConversionBracket(): ConversionBracket {
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

    //#region Static Methods
    /**
     * @name GetRankFromRating
     * @description Checks rank requirements met with provided rating and returns the highest rank we met the requirements of
     */
    static GetRankFromRating(rating: number): Rank {
        const rankRequirementsMet = Array.from(Rank.RankMap.values()).filter(r => rating >= r.CpRequirement);
        if (rankRequirementsMet.length > 0) {
            return rankRequirementsMet[rankRequirementsMet.length - 1];
        }
        else {
            throw new Error(`Could not fetch rank from rating ${rating}, because we have not met any Rank Requirements. This should never happen.`);
        }
    }

    /**
     * @name GetRankPercentageFromRating
     * @description Calculates the percentage of progress into the next higher rank of the provided rating
     */
    static GetRankPercentageFromRating(rating: number): number {
        const ratingRank = this.GetRankFromRating(rating);
        const cpAboveRequirement = rating - ratingRank.CpRequirement;
        let nextRankMaxCp = 0;
        if (ratingRank.Num >= Rank.MaxRankNum) {
            nextRankMaxCp = Rank.MaxCp;
        }
        else {
            const plusOneRank = Rank.RankMap.get(ratingRank.Num + 1);
            if (!plusOneRank) {
                throw new Error(`Could not calculate rank percentage for rating ${rating}, because we could not find Rank ${ratingRank.Num + 1} in RankMap`);
            }
            nextRankMaxCp = plusOneRank.CpRequirement;
        }

        return cpAboveRequirement / (nextRankMaxCp - ratingRank.CpRequirement) * 100;
    }
    //#endregion

    //#region Static Members
    static MaxRankNum: number = 14;
    static MinRankNum: number = 1;
    static MaxHonor: number = 500000;
    static MaxCp: number = 65000;
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
        [1, new Rank({ num: 1, cpRequirement: 0, changeFactor: 1, name: { Alliance: "Private", Horde: "Scout" } })],
        [2, new Rank({ num: 2, cpRequirement: 2000, changeFactor: 1, name: { Alliance: "Corporal", Horde: "Grunt" } })],
        [3, new Rank({ num: 3, cpRequirement: 5000, changeFactor: 1, name: { Alliance: "Sergeant", Horde: "Sergeant" } })],
        [4, new Rank({ num: 4, cpRequirement: 10000, changeFactor: 0.8, name: { Alliance: "Master Sergeant", Horde: "Senior Sergeant" } })],
        [5, new Rank({ num: 5, cpRequirement: 15000, changeFactor: 0.8, name: { Alliance: "Sergeant Major", Horde: "First Sergeant" } })],
        [6, new Rank({ num: 6, cpRequirement: 20000, changeFactor: 0.8, name: { Alliance: "Knight", Horde: "Stone Guard" } })],
        [7, new Rank({ num: 7, cpRequirement: 25000, changeFactor: 0.7, name: { Alliance: "Knight-Lieutenant", Horde: "Blood Guard" } })],
        [8, new Rank({ num: 8, cpRequirement: 30000, changeFactor: 0.7, name: { Alliance: "Knight-Captain", Horde: "Legionnaire" } })],
        [9, new Rank({ num: 9, cpRequirement: 35000, changeFactor: 0.6, name: { Alliance: "Knight-Champion", Horde: "Centurion" } })],
        [10, new Rank({ num: 10, cpRequirement: 40000, changeFactor: 0.5, name: { Alliance: "Lieutenant Commander", Horde: "Champion" } })],
        [11, new Rank({ num: 11, cpRequirement: 45000, changeFactor: 0.5, name: { Alliance: "Commander", Horde: "Lieutenant General" } })],
        [12, new Rank({ num: 12, cpRequirement: 50000, changeFactor: 0.4, name: { Alliance: "Marshal", Horde: "General" } })],
        [13, new Rank({ num: 13, cpRequirement: 55000, changeFactor: 0.4, name: { Alliance: "Field Marshal", Horde: "Warlord" } })],
        [14, new Rank({ num: 14, cpRequirement: 60000, changeFactor: 0.34, name: { Alliance: "Grand Marshal", Horde: "High Warlord" } })]
    ]);

    // Experimental: My guess on Level Caps.
    // Derived from the original Level Caps reported on vanilla-wiki and their percentage change in relation to MaxRP (65000 back then)
    // Took those percentages and applied them to (presumably new?) MaxCP which could be 60000, as evidence suggested the 1-29 cap changed from 6500 to 6000.
    // Probably not accurate, but more accurate than the old caps on vanilla-wiki according to the small amount of evidence provided by the community.
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
        59: 60000, // inconsistent with my theory, however there have been confirmed lvl 59 rank 14s
        60: this.MaxCp
    }
    //#endregion
}
