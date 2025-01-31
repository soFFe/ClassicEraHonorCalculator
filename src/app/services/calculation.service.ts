import { Injectable } from '@angular/core';
import { Rank } from '../models/rank';

@Injectable({
    providedIn: 'root'
})
export class CalculationService {
    constructor() { }

    CalculateHonorFarmProgress(currentRank: Rank, honorFarmed: number): number {
        const honorProgressPercentage = honorFarmed / this.CalculateMinimumHonorForMaxRatingGain(currentRank) * 100;
        return Math.min(honorProgressPercentage, 100);
    }

    CalculateQualifiedRanks(currentRank: Rank, honor: number): Rank[] {
        const maxQualifiedRanks = Array.from(Rank.RankMap.values())
            .filter(r => r.Num >= currentRank.Num && r.Num <= Math.min(currentRank.Num + Rank.MaxRankQualifications, Rank.MaxRankNum));
        const initialLen = maxQualifiedRanks.length;

        for (let i = initialLen - 1; i >= 0; i--) {
            // check if honor qualification checks out
            if (honor < maxQualifiedRanks[i].HonorRequirement) {
                // get outta here
                maxQualifiedRanks.pop();
            }
        }

        return maxQualifiedRanks;
    }

    CalculateMinimumHonorForMaxRatingGain(currentRank: Rank): number {
        const maxQualifiedRanks = Array.from(Rank.RankMap.values())
            .filter(r => r.Num > currentRank.Num && r.Num <= Math.min(currentRank.Num + Rank.MaxRankQualifications, Rank.MaxRankNum));
        
        if (maxQualifiedRanks.length > 1) {
            return maxQualifiedRanks[maxQualifiedRanks.length - 1].HonorRequirement
        }
        else { // R14 or R13
            // due to how qualifying for the same rank will give you the same amount of progress as qualifying for the next higher rank,
            // the minimum for R13 here is 418750, not 500k
            return currentRank.HonorRequirement;
        }
    }

    /**
     * @name CalculateCurrentRating
     * @description Calculates the current amount of CP
     */
    CalculateCurrentRating(currentRank: Rank, rankProgress: number): number {
        if (currentRank.Num == Rank.MaxRankNum) {
            return (currentRank.CpRequirement + ((Rank.MaxCp + 5000 - currentRank.CpRequirement) * rankProgress / 100));
        }
        else {
            const nNext = Number(currentRank.Num) + 1;
            const rNext = Rank.RankMap.get(nNext);
            if (!rNext) {
                throw new Error(`Could not find Rank ${nNext} in RankMap`);
            }
            return (currentRank.CpRequirement + ((rNext.CpRequirement - currentRank.CpRequirement) * rankProgress / 100));
        }
    }

    /**
     * @name CalculateRankQualificationReward
     * @description Calculates the amount of CP awarded for qualifying for a single rank. With special cases for R9 and R11s first bucket
     * @param qualifiedRankHigh This is usually the Qualified Rank, except in the case of the "Decay Prevention Hop". Its change Factor will be used.
     * @param qualifiedRankLow This is one Rank lower than qualifiedRankHigh
     */
    public CalculateRankQualificationReward(currentRankNum: number, currentRankProgressPercentage: number, qualifiedRankLow: Rank, qualifiedRankHigh: Rank): number {
        let cpReward = (qualifiedRankHigh.CpRequirement - qualifiedRankLow.CpRequirement) * qualifiedRankHigh.ChangeFactor;
        if (currentRankNum == qualifiedRankLow.Num) { // first bucket
            // "V4 Calculation"
            // This calculation has been introduced to prevent gaming the system by farming Dishonorable Kills
            let cpCutOff = (qualifiedRankHigh.CpRequirement - qualifiedRankLow.CpRequirement) * qualifiedRankHigh.ChangeFactor;
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
                (qualifiedRankHigh.CpRequirement - qualifiedRankLow.CpRequirement) * (100 - currentRankProgressPercentage) / 100
            );
        }

        return cpReward;
    }

    CalculateMaxRatingGain(currentRank: Rank, rankProgress: number): number {
        const maxQualifiedRanks = this.CalculateQualifiedRanks(currentRank, Rank.MaxHonor);
        return this.CalculateRatingGain(currentRank, rankProgress, maxQualifiedRanks);
    }

    /**
     * @name CalculateRatingGain
     * @description Predicts the amount of CP Gained within a Week by adding up Qualification Rewards for the qualified Ranks and adds the Bonus CP if necessary
     */
    CalculateRatingGain(currentRank: Rank, rankProgress: number, qualifiedRanks: Rank[]): number {
        let cpSum = 0;

        if (qualifiedRanks.length > 0) {

            for (let i = 0; i < qualifiedRanks.length; i++) {
                const rank = qualifiedRanks[i];
                if (rank.Num == currentRank.Num) {
                    if (qualifiedRanks.length == 1) {
                        // "Decay Prevention Hop"
                        // we get the same amount of reward of the next rank by exclusively qualifying for the current rank
                        // why, blizzard?
                        const nextRank = Rank.RankMap.get(Math.min(Rank.MaxRankNum, rank.Num + 1));
                        if (!nextRank) {
                            throw new Error(`Could not find Rank ${rank.Num + 1} in RankMap`);
                        }

                        cpSum += this.CalculateRankQualificationReward(currentRank.Num, rankProgress, rank, nextRank);
                    }

                    // we skip adding the same-rank reward if we qualified for at least the next higher rank.
                    // this is just my method of making sure the "Decay Prevention Hop" gets calculated in the special case above
                    // but not in any other case.
                    continue;
                }

                const previousRank = Rank.RankMap.get(rank.Num - 1);
                if (!previousRank) {
                    if (rank.Num > 1) {
                        throw new Error(`Could not find Rank ${rank.Num - 1} in RankMap`);
                    }
                    else {
                        // Because Rank 1s Reward is 0, no need to calculate anything
                        continue;
                    }
                }

                cpSum += this.CalculateRankQualificationReward(currentRank.Num, rankProgress, previousRank, rank);
            }

            cpSum += this.CalculateBonusCp(currentRank, qualifiedRanks);
        }
        // else {
        //     // Decay Calculation
        //     cpSum -= Math.min(Rank.MaxDecayCp, this.CalculateCurrentRating(currentRank, rankProgress) - currentRank.CpRequirement);
        // }

        return cpSum;
    }

    /**
     * This calculation has been introduced when Blizzard updated their calculations to prevent gaming the system by farming Dishonorable Kills
     * It probably serves the purpose to stay true to the original goal of "8 weeks from R0 to R14"
     */
    CalculateBonusCp(currentRank: Rank, qualifiedRanks: Rank[]): number {
        if (qualifiedRanks.length > 0 && currentRank.Num >= 6 && currentRank.Num <= 10) {
            // qualifying for current rank grants you the first bucket for free, so the minimum amount of buckets here is 1
            // because we have qualified at least for the current rank (qualifiedRanks.length > 0)
            const numBuckets = Math.max(qualifiedRanks.length - 1, 1);
            let bonusCp = 0;
            const bonusBuckets = Rank.BonusCpMatrix[currentRank.Num];
            bonusCp = bonusBuckets[numBuckets - 1];

            return bonusCp;
        }

        return 0;
    }

    CalculateNextRating(currentRank: Rank, rankProgress: number, honorFarmed: number, characterLevel: number): number {
        let nextRating = this.CalculateCurrentRating(currentRank, rankProgress) + this.CalculateRatingGain(currentRank, rankProgress, this.CalculateQualifiedRanks(currentRank, honorFarmed));

        // Level Cap
        if(nextRating > Rank.LevelCpCaps[characterLevel])
        {
            nextRating = Rank.LevelCpCaps[characterLevel];
        }

        // Prevent Derank from Decay
        if (nextRating < currentRank.CpRequirement)
            nextRating = currentRank.CpRequirement;

        return nextRating;
    }

    CalculateNextRankNum(currentRank: Rank, rankProgress: number, honorFarmed: number, characterLevel: number): number {
        const nextRating = this.CalculateNextRating(currentRank, rankProgress, honorFarmed, characterLevel);

        const rankRequirementsMet = Array.from(Rank.RankMap.values()).filter(r => nextRating >= r.CpRequirement);
        if (rankRequirementsMet.length > 0) {
            return rankRequirementsMet[rankRequirementsMet.length - 1].Num;
        }
        else {
            throw new Error("Could not calculate next rank, as we have not met any Rank Requirements. This should never happen.");
        }
    }

    CalculateNextRankPercentage(currentRank: Rank, rankProgress: number, honorFarmed: number, characterLevel: number): number {
        const nextRating = this.CalculateNextRating(currentRank, rankProgress, honorFarmed, characterLevel);

        const rankRequirementsMet = Array.from(Rank.RankMap.values()).filter(r => nextRating >= r.CpRequirement);
        if (rankRequirementsMet.length > 0) {
            const nextRank = rankRequirementsMet[rankRequirementsMet.length - 1];
            const cpAboveRequirement = nextRating - nextRank.CpRequirement;
            let nextRankMaxCp = 0;
            if (nextRank.Num >= Rank.MaxRankNum) {
                nextRankMaxCp = Rank.MaxCp + 5000;
            }
            else {
                const plusOneRank = Rank.RankMap.get(nextRank.Num + 1);
                if (!plusOneRank) {
                    throw new Error(`Could not calculate next ranks maximum CP, because we could not find Rank ${nextRank.Num + 1} in RankMap`);
                }
                nextRankMaxCp = plusOneRank.CpRequirement;
            }

            return cpAboveRequirement / (nextRankMaxCp - nextRank.CpRequirement) * 100;
        }
        else {
            throw new Error("Could not calculate next rank percentage, as we have not met any Rank Requirements. This should never happen.")
        }
    }

    CalculateMaxNextRankNum(currentRank: Rank, rankProgress: number): number {
        const nextRating = this.CalculateCurrentRating(currentRank, rankProgress) + this.CalculateMaxRatingGain(currentRank, rankProgress);

        const rankRequirementsMet = Array.from(Rank.RankMap.values()).filter(r => nextRating >= r.CpRequirement);
        if (rankRequirementsMet.length > 0) {
            return rankRequirementsMet[rankRequirementsMet.length - 1].Num;
        }
        else {
            throw new Error("Could not calculate next maximum rank, as we have not met any Rank Requirements. This should never happen.");
        }
    }

    CalculateMaxNextRankPercentage(currentRank: Rank, rankProgress: number): number {
        const nextRating = this.CalculateCurrentRating(currentRank, rankProgress) + this.CalculateMaxRatingGain(currentRank, rankProgress);

        const rankRequirementsMet = Array.from(Rank.RankMap.values()).filter(r => nextRating >= r.CpRequirement);
        if (rankRequirementsMet.length > 0) {
            const nextRank = rankRequirementsMet[rankRequirementsMet.length - 1];
            const cpAboveRequirement = nextRating - nextRank.CpRequirement;
            let nextRankMaxCp = 0;
            if (nextRank.Num >= Rank.MaxRankNum) {
                nextRankMaxCp = Rank.MaxCp + 5000;
            }
            else {
                const plusOneRank = Rank.RankMap.get(nextRank.Num + 1);
                if (!plusOneRank) {
                    throw new Error(`Could not calculate next ranks maximum CP, because we could not find Rank ${nextRank.Num + 1} in RankMap`);
                }
                nextRankMaxCp = plusOneRank.CpRequirement;
            }

            return cpAboveRequirement / (nextRankMaxCp - nextRank.CpRequirement) * 100;
        }
        else {
            throw new Error("Could not calculate next maximum rank, as we have not met any Rank Requirements. This should never happen.");
        }
    }
}
