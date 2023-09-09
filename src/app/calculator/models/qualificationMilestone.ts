import { Rank } from "./rank";

export class QualificationMilestone {
    HonorRequirement: number;
    HonorRequirementPercentage: number;

    constructor(qualifiedRank: Rank, maxQualifiedRank: Rank) {
        this.HonorRequirement = qualifiedRank.HonorRequirement;
        this.HonorRequirementPercentage = qualifiedRank.HonorRequirement / maxQualifiedRank.HonorRequirement * 100;
    }
}