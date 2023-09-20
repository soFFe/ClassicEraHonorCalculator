import { Rank } from "./rank";
import { ConversionBracket } from "./conversionBracket";

export class RankData {
    static MaxRankNum: number = 14;
    static MinRankNum: number = 1;
    static MaxHonor: number = 500000;
    static MaxCp: number = 60000;
    static MaxDecayCp: number = 2500;
    static MaxRankQualifications: number = 4;

    // Reverse engineered Conversion Rates
    static ConversionBrackets: Array<ConversionBracket> = [
        new ConversionBracket({ id: 0, minRankNum: 1, maxRankNum: 6, cpToHonorRate: 2.25 }),
        new ConversionBracket({ id: 1, minRankNum: 7, maxRankNum: 10, cpToHonorRate: 6.5 }),
        new ConversionBracket({ id: 2, minRankNum: 11, maxRankNum: 14, cpToHonorRate: 16.25 }),
    ];

    // These values have been provided by blizzard in a blue post
    static RankMap: Map<number, Rank> = new Map([
        [1, new Rank({ num: 1, cpRequirement: 0, changeFactor: 1.0 })],
        [2, new Rank({ num: 2, cpRequirement: 2000, changeFactor: 1.0 })],
        [3, new Rank({ num: 3, cpRequirement: 5000, changeFactor: 1.0 })],
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

    static BonusCpMatrix: Record<'<=40Percent' | '>=50Percent', Record<number | 6 | 7 | 8 | 9 | 10 | 11, Array<number>>> = {
        "<=40Percent": {
            6:  [ 0,   0,   0,    500 ],
            7:  [ 0,   0,   500,  500 ],
            8:  [ 0,   500, 500,  1000 ],
            9:  [ 500, 500, 1000, 1000 ],
            10: [ 0,   500, 500,  500 ],
            11: [ 0,   500, 500 ]
        },
        ">=50Percent": {
            6:  [ 0,   0,   0,    500 ],
            7:  [ 0,   0,   500,  500 ],
            8:  [ 0,   500, 500,  1000 ],
            9:  [ 0,   500, 500,  500 ],
            10: [ 0,   500, 500,  500 ],
            11: [ 0,   0,   0 ]
        }
    };
}