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
        if (maxQualifiedRanks.length > 0) {
            return currentRank.CalculateMinHonorForRankQualification(maxQualifiedRanks[maxQualifiedRanks.length - 1]);
        }
        else {
            // most likely rank 14
            return currentRank.CalculateMinHonorForRankQualification(currentRank);
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

    CalculateMaxRatingGain(currentRank: Rank, rankProgress: number): number {
        const maxQualifiedRanks = this.CalculateQualifiedRanks(currentRank, Rank.MaxHonor);
        return this.CalculateRatingGain(currentRank, rankProgress, maxQualifiedRanks);
    }

    CalculateRatingGain(currentRank: Rank, rankProgress: number, qualifiedRanks: Rank[]): number {
        let cpSum = 0;

        if (qualifiedRanks.length > 0) {

            for (let i = 0; i < qualifiedRanks.length; i++) {
                const rank = qualifiedRanks[i];
                if (rank.Num == currentRank.Num) {
                    // we get the same amount of reward of the next rank by only qualifying for the current rank
                    if (qualifiedRanks.length == 1) {
                        const nextRank = Rank.RankMap.get(Math.min(Rank.MaxRankNum, rank.Num + 1));
                        if (!nextRank) {
                            throw new Error(`Could not find Rank ${rank.Num + 1} in RankMap`);
                        }

                        cpSum += nextRank.CalculateRankQualificationReward(currentRank.Num, rankProgress, rank);
                    }
                    continue;
                }

                const previousRank = Rank.RankMap.get(rank.Num - 1);
                if (!previousRank) {
                    if (rank.Num > 1) {
                        throw new Error(`Could not find Rank ${rank.Num - 1} in RankMap`);
                    }
                    else {
                        // Rank 1s Reward is 0 anyway, no need to calculate anything
                        continue;
                    }
                }

                cpSum += rank.CalculateRankQualificationReward(currentRank.Num, rankProgress, previousRank);
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

    CalculateNextRating(currentRank: Rank, rankProgress: number, honorFarmed: number): number {
        let nextRating = this.CalculateCurrentRating(currentRank, rankProgress) + this.CalculateRatingGain(currentRank, rankProgress, this.CalculateQualifiedRanks(currentRank, honorFarmed));

        // Prevent Derank from Decay
        if (nextRating < currentRank.CpRequirement)
            nextRating = currentRank.CpRequirement;

        return nextRating;
    }

    CalculateNextRankNum(currentRank: Rank, rankProgress: number, honorFarmed: number): number {
        const nextRating = this.CalculateNextRating(currentRank, rankProgress, honorFarmed);

        const rankRequirementsMet = Array.from(Rank.RankMap.values()).filter(r => nextRating >= r.CpRequirement);
        if (rankRequirementsMet.length > 0) {
            return rankRequirementsMet[rankRequirementsMet.length - 1].Num;
        }
        else {
            throw new Error("Could not calculate next rank, as we have not met any Rank Requirements. This should never happen.");
        }
    }

    CalculateNextRankPercentage(currentRank: Rank, rankProgress: number, honorFarmed: number): number {
        const nextRating = this.CalculateNextRating(currentRank, rankProgress, honorFarmed);

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
}
