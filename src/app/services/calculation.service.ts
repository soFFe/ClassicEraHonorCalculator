import { Injectable } from '@angular/core';
import { Rank } from '../models/rank';

@Injectable({
    providedIn: 'root'
})
export class CalculationService {
    constructor() { }

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

    CalculateMinimumHonorForRatingGain(currentRank: Rank, currentRankProgress: number, gainedRating: number): number {
        if(gainedRating > 0)
        {
            const maxQualifiedRanks = Array.from(Rank.RankMap.values())
            .filter(r => r.Num >= currentRank.Num && r.Num <= Math.min(currentRank.Num + Rank.MaxRankQualifications, Rank.MaxRankNum));
        
            if (maxQualifiedRanks.length > 0) {
                let highestGain = 0;
                for(let i = 0; i < maxQualifiedRanks.length; i++)
                {
                    const gain = this.CalculateRatingGain(currentRank, currentRankProgress, maxQualifiedRanks.slice(0, i + 1));
                    if(gain > highestGain)
                    {
                        highestGain = gain;
                    }

                    if(gain >= gainedRating)
                    {
                        return maxQualifiedRanks[i].HonorRequirement;
                    }
                }

                // could not reach the desired rating gain
                throw new Error(`A Rating Gain of ${gainedRating} is unreachable for Rank ${currentRank.Num}. Highest gain possible is ${highestGain}`);
            }
            else
            {
                // can't gain any more rating                
                throw new Error(`A Rating Gain of ${gainedRating} is unreachable for Rank ${currentRank.Num}, because we can't gain any more rating`);
            }
        }
        else
        {
            // no gain, no pain
            return 0;
        }
    }

    CalculateMinimumHonorForRank(currentRank: Rank, currentRankProgress: number, targetRank: Rank): number {
        if(targetRank.Num > currentRank.Num)
        {
            const maxQualifiedRanks = Array.from(Rank.RankMap.values())
            .filter(r => r.Num >= currentRank.Num && r.Num <= Math.min(currentRank.Num + Rank.MaxRankQualifications, Rank.MaxRankNum));
        
            if (maxQualifiedRanks.length > 0) {
                let highestRankNum = 0;
                for(let i = 0; i < maxQualifiedRanks.length; i++)
                {
                    const nextRating = this.CalculateNextRating(currentRank, currentRankProgress, maxQualifiedRanks[i].HonorRequirement, 60);
                    const nextRank = Rank.GetRankFromRating(nextRating);
                    
                    if(nextRank.Num > currentRank.Num)
                    {
                        highestRankNum = nextRank.Num;
                    }

                    if(nextRank.Num >= targetRank.Num)
                    {
                        return maxQualifiedRanks[i].HonorRequirement;
                    }
                }

                // could not reach the desired rating gain
                throw new Error(`Rank ${targetRank.Num} is unreachable for Rank ${currentRank.Num}/${currentRankProgress}%. Highest rank possible is ${highestRankNum}`);
            }
            else
            {
                // can't rank up anymore                
                throw new Error(`Rank ${targetRank.Num} is unreachable for Rank ${currentRank.Num}/${currentRankProgress}%, because we can't gain any rating anymore`);
            }
        }
        else
        {
            // no gain, no pain
            return 0;
        }
    }

    /**
     * @name CalculateCurrentRating
     * @description Calculates the current amount of CP
     */
    CalculateCurrentRating(currentRank: Rank, rankProgress: number): number {
        if (currentRank.Num == Rank.MaxRankNum) {
            return (currentRank.CpRequirement + ((Rank.MaxCp - currentRank.CpRequirement) * rankProgress / 100));
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
}
