# Classic Era Honor Calculator
![Build](https://github.com/soFFe/ClassicEraHonorCalculator/actions/workflows/angular-gh-pages.yml/badge.svg)

A simple Angular Web-App intended for World of Warcraft Classic Era / Season Of Discovery PvP players.
The 1.14.4 PvP System Update indirectly introduced limits to the amount of Rank Progress you can gain in one week.
This Calculator is meant for people who want to min/max these limits.

## Terminology
"Contribution Points" as explained by Blizzard, is a term that was very confusing to everyone I spoke to, as Blizzard uses the term Contribution Points for 2 very different things.
That's why I have decided to rephrase this to two different phrases:
1. Rating / Rating Points that represent your actual rank and your Progress within this rank. These are rewarded at specific milestones you qualify for.
2. Qualification Points that represent the rank you have qualified for by farming a specific amount of Honor within 1 week.

## Ranking information used in this Calculator
| Rank | Rating Required for Rank | Change factor for Rank |
|:----:|:------------------------:|:----------------------:|
| 1    | 0                        | 1.0                    |
| 2    | 2000                     | 1.0                    |
| 3    | 5000                     | 1.0                    |
| 4    | 10000                    | 0.8                    |
| 5    | 15000                    | 0.8                    |
| 6    | 20000                    | 0.8                    |
| 7    | 25000                    | 0.7                    |
| 8    | 30000                    | 0.7                    |
| 9    | 35000                    | 0.6                    |
| 10   | 40000                    | 0.5                    |
| 11   | 45000                    | 0.5                    |
| 12   | 50000                    | 0.4                    |
| 13   | 55000                    | 0.4                    |
| 14   | 60000                    | 0.34                   |

## Honor Conversion Brackets
What I call Conversion Brackets are the Ranges of Ranks that have different QP/Honor Conversion Rates, as stated in Blizzards Bluepost.
These are equal for all Ranks within the Bracket.

| BracketId | MinimumRank | MaximumRank | QP to Honor Conversion Rate |
|:---------:|:-----------:|:-----------:|:-------------------------------------:|
| 0         | 1           | 6           | 45000/20000 = 2.25                    |
| 1         | 7           | 10          | (175000-45000)/(40000-20000) = 6.5    |
| 2         | 11          | 14          | (500000-175000)/(60000-40000) = 16.25 |

## Decay
Decay has been removed completely. The only way you can lose Rank or Progress is by killing Civilian NPCs.

## Bonus CP + R9 and R11s Special Cases
Don't know why these exist, but you get bonus CP for these cases.
"Buckets" refers to the Qualified Ranks within this week. So the amount of additional ranks you qualified for (above the current rank) is the amount of Buckets.
| Current Rank | Bucket 1 Bonus CP | Bucket 2 Bonus CP | Bucket 3 BonusCP | Bucket 4 BonusCP |
|:------------:|:-----------------:|:-----------------:|:----------------:|:----------------:|
|           R6 | 0                 | 0                 | 0                | 500              |
|           R7 | 0                 | 0                 | 500              | 500              |
|           R8 | 0                 | 500               | 500              | 1000             |
|           R9 | 0                 | 0                 | 500              | 500              |
|          R10 | 0                 | 500               | 500              | 500              |

This might be a semantic error which I could not solve yet. However, the results are accurate using this method.

Additionally, the Rank Reward Calculation for R9 and R11 specifically changed when Blizzard introduced a patch after players gamed the system by farming Dishonorable Kills.

Special Case: R9s First Bucket Reward is capped to 3000

Special Case: R11s First Bucket Reward is capped to 2500

## Decay Prevention Hop
If you only qualify for the same Rank you currently are, you get the Reward of the next-higher Rank instead.

For example if you are currently Rank 7 and qualify only for Rank 7, you will receive the Reward for Rank 8.
If you qualify for Rank 8 however, you still only receive the Reward for Rank 8.

This behavior results in Rank 1 being skipped over entirely, as if you only hit Rank 1s requirement (15 Honorable Kills), you get Rank 2's Reward CP (Rating) awarded to you, which in turn is the minimum requirement to be Rank 2.

## References
- [1.15 Decay Removal Announcement](https://us.forums.blizzard.com/en/wow/t/classic-era-pvp-update-december-5/1724481)
- [Dishonorable Kills Change](https://us.forums.blizzard.com/en/wow/t/so-how-does-this-dishonorable-kill-system-work/1664598/38)
- [WoW Classic Era 1.14.4 PvP Ranking Update Examples](https://eu.forums.blizzard.com/en/wow/t/wow-classic-era-1144-pvp-ranking-update-examples/463646)
- [Classic Era 1.14.4 PvP Update](https://eu.forums.blizzard.com/en/wow/t/classic-era-1144-pvp-update/457615)
- [Beastinblack-Firemaw's Calculation Google Doc](https://docs.google.com/spreadsheets/d/1vX1eXeDflKf7mC1PHm_5OhSKv6LjjjZEe3DzWHqyCKM/copy)

## Build Dependencies
- Angular 19
- node
- npm
