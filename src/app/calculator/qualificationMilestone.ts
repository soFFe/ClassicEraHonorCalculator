import { Rank } from "./rankdata";

export class QualificationMilestone {
    HonorRequirement: number;
    HonorRequirementPercentage: number;

    constructor(qualifiedRank: Rank, maxQualifiedRank: Rank) {
        this.HonorRequirement = qualifiedRank.HonorRequirement;
        this.HonorRequirementPercentage = qualifiedRank.HonorRequirement / maxQualifiedRank.HonorRequirement * 100;
    }
}