# Classic Era Honor Calculator
![Build](https://github.com/soFFe/ClassicEraHonorCalculator/actions/workflows/angular-gh-pages.yml/badge.svg)

A simple Angular Web-App intended for World of Warcraft Classic Era PvP players.
The 1.14.4 PvP System Update indirectly introduced limits to the amount of Rank Progress you can gain in one week.
This Calculator is meant for people who want to min/max these limits.

## Ranking information used in this Calculator
| Rank | CP Required for Rank | Change factor for Rank | Honor to CP Conversion Rate |
|:----:|:--------------------:|:----------------------:|:---------------------------:|
| 1    | 0                    | 1.0                    | 20000 / 45000               |
| 2    | 2000                 | 1.0                    | 20000 / 45000               |
| 3    | 5000                 | 1.0                    | 20000 / 45000               |
| 4    | 10000                | 0.8                    | 20769 / 50000               |
| 5    | 15000                | 0.8                    | 20000 / 45000               |
| 6    | 20000                | 0.8                    | 20000 / 45000               |
| 7    | 25000                | 0.7                    | 40000 / 175000               |
| 8    | 30000                | 0.7                    | 40000 / 175000               |
| 9    | 35000                | 0.6                    | 40000 / 175000               |
| 10   | 40000                | 0.5                    | 40000 / 175000               |
| 11   | 45000                | 0.5                    | 65000 / 500000               |
| 12   | 50000                | 0.4                    | 65000 / 500000               |
| 13   | 55000                | 0.4                    | 65000 / 500000               |
| 14   | 60000                | 0.34                   | 65000 / 500000               |

## Inaccuracies
There will most likely be inaccuracies in the Honor values displayed, due to inconsistencies in data provided by Blizzard.
Inaccurate Information:
- R14 Minimum CP Requirement = 60k(defined in table) or 65k(derived from text)? I chose 60k.
- Honor to CP Conversion Rates: Blizzard did not seem to want to release this rate for each Rank+Level. They have provided rough data points for R1-R6, R7-R10 and R11-R14. They provided seemingly more accurate(?) data for R4. I chose to include every data point provided (including the more specific R4 Conversion Rate).

We probably will end up reverse engineering these, if Blizzard does not release accurate information.
Until then, I advise you to use this as a rough estimation on the minimum amount of effort you need to maximize your gains.

## References
- [WoW Classic Era 1.14.4 PvP Ranking Update Examples](https://eu.forums.blizzard.com/en/wow/t/wow-classic-era-1144-pvp-ranking-update-examples/463646)
- [Classic Era 1.14.4 PvP Update](https://eu.forums.blizzard.com/en/wow/t/classic-era-1144-pvp-update/457615)

## Project Dependencies
- Angular 16.2
- node
- npm
- Bootstrap 5.3.1
