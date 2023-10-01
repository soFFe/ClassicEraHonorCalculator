import { ConversionBracket } from "./conversionBracket";
import { RankData } from "./rankdata";

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
        let conversionBracket = this.GetConversionBracket();

        if (conversionBracket.Id == 0) {
            this.HonorRequirement = this.CpRequirement * conversionBracket.CpToHonorRate;
        }
        else if (conversionBracket.Id == 1) {
            this.HonorRequirement = 45000 + (this.CpRequirement - 20000) * conversionBracket.CpToHonorRate;
        }
        else {
            this.HonorRequirement = 175000 + (this.CpRequirement - 40000) * conversionBracket.CpToHonorRate;
        }
        this.HonorRequirement = Math.min(this.HonorRequirement, RankData.MaxHonor);

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
            if (highestQualifiedRank.Num > this.Num + RankData.MaxRankQualifications) {
                // Can not qualify for a rank this high
                throw new Error(`Could not calculate Honor Cap for Rank ${this.Num} as the provided highest qualified Rank ${highestQualifiedRank.Num} is above the limit of ${this.Num + RankData.MaxRankQualifications}`)
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