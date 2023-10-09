import { Rank } from '../models/rank';
import { Component, Input, ViewChild } from '@angular/core';
import { Chart, ChartConfiguration, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import 'chartjs-adapter-date-fns';
import Annotation, { AnnotationOptions, BoxAnnotationOptions } from 'chartjs-plugin-annotation';
import { CalculationService } from '../services/calculation.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-progression-planning',
    templateUrl: './progression-planning.component.html',
    styleUrls: ['./progression-planning.component.scss'],
    providers: [CalculationService]
})
export class ProgressionPlanningComponent {
    //#region currentRankNum
    private _currentRankNum: number = 1;
    public get currentRankNum(): number {
        return this._currentRankNum;
    }

    @Input()
    public set currentRankNum(value: number) {
        if (isNaN(value)) {
            this._currentRankNum = Rank.MinRankNum;
        }
        else if (value < Rank.MinRankNum) {
            this._currentRankNum = Rank.MinRankNum;
        }
        else if (value > Rank.MaxRankNum) {
            this._currentRankNum = Rank.MaxRankNum;
        } else {
            this._currentRankNum = Number(value);
        }

        const rCurrent = Rank.RankMap.get(this.currentRankNum);
        if (!rCurrent) {
            throw new Error(`Could not find Rank ${this.currentRankNum} in RankMap`);
        }
        this.currentRank = rCurrent;

        this.UpdateChart();
        this.UpdateUrl();
    }
    //#endregion
    //#region rankProgress
    private _rankProgress: number = 0;
    public get rankProgress(): number {
        return this._rankProgress;
    }

    @Input()
    public set rankProgress(value: string) {
        if (value != undefined)
            value = value.replaceAll(/,/g, '.');

        if (isNaN(Number(value)))
            this._rankProgress = 0;
        else if (Number(value) < 0)
            this._rankProgress = 0;
        else if (Number(value) > 100)
            this._rankProgress = 100;
        else
            this._rankProgress = Number(value);

        this.UpdateChart();
        this.UpdateUrl();
    }
    //#endregion
    //#region numWeeks
    private _numWeeks: number = 15;
    public get numWeeks(): number {
        return this._numWeeks;
    }

    @Input()
    public set numWeeks(value: number) {
        if (isNaN(value)) {
            this._numWeeks = 15;
        } else if (value < 0) {
            this._numWeeks = 0;
        } else if (value > 50) {
            this._numWeeks = 50;
        } else {
            // make sure this is an integer
            this._numWeeks = Math.trunc(value);
        }

        this.UpdateChart();
        this.UpdateUrl();
    }
    //#endregion
    //#region honorGoal
    private _honorGoal: number = 256000;
    public get honorGoal(): number {
        return this._honorGoal;
    }

    @Input()
    public set honorGoal(value: number) {
        if (isNaN(value)) {
            this._honorGoal = 256000;
        } else if (value < 0) {
            this._honorGoal = 0;
        } else if (value > 500000) {
            this._honorGoal = 500000;
        } else {
            // make sure this is an integer
            this._honorGoal = Math.trunc(value);
        }

        this.UpdateChart();
        this.UpdateUrl();
    }
    //#endregion

    dNow: Date = new Date();
    ranks: Array<number> = Array.from(Rank.RankMap.keys()).filter(n => n <= Rank.MaxRankNum);
    currentRank: Rank;
    @ViewChild(BaseChartDirective) _chart!: BaseChartDirective;

    public progressionChartData: ChartConfiguration<'line'>['data'] = {
        labels: this.GenerateChartLabels(),
        datasets: [
            {
                data: this.GenerateChartDataMaxProgress(),
                label: 'Max Progress',
                fill: false,
                borderColor: '#950101',
                pointBackgroundColor: '#950101',
                backgroundColor: '#950101',
                yAxisID: 'CP',
                xAxisID: 'Week',
                stepped: true,
            },
            {
                data: this.GenerateChartDataHonorGoal(),
                label: 'Static Honor Goal',
                fill: false,
                borderColor: '#959501',
                pointBackgroundColor: '#959501',
                backgroundColor: '#959501',
                yAxisID: 'CP',
                xAxisID: 'Week',
                stepped: true,
            },
            {
                data: this.GenerateChartDataMinProgress(),
                label: 'Min Progress',
                fill: false,
                borderColor: '#019501',
                pointBackgroundColor: '#019501',
                backgroundColor: '#019501',
                yAxisID: 'CP',
                xAxisID: 'Week',
                stepped: true,
            }
        ]
    }
    public progressionChartOptions: ChartOptions<'line'> = {
        maintainAspectRatio: false,
        plugins: {
            legend: { display: true },
            annotation: {
                common: {
                    drawTime: 'beforeDatasetsDraw'
                },
                annotations: this.GenerateAnnotations()
            }
        },
        scales: {
            CP: {
                display: true,
                type: 'linear',
                max: 65000,
                title: {
                    display: true,
                    text: "Rating (CP)"
                }
            },
            Week: {
                display: true,
                type: 'linear',
                position: 'bottom',
                min: 0,
                suggestedMax: 8,
                title: {
                    display: true,
                    text: "# of Weeks"
                },
                ticks: {
                    stepSize: 1
                }
            }
        }
    };

    constructor(private calculationService: CalculationService, private router: Router) {
        Chart.register(Annotation);
        const rCurrent = Rank.RankMap.get(this.currentRankNum);
        if (!rCurrent) {
            throw new Error(`Could not find Rank ${this.currentRankNum} in RankMap`);
        }

        this.currentRank = rCurrent;
    }

    private GenerateChartLabels(): string[] {
        const labels: string[] = [];

        for (let i = 0; i < this.numWeeks; i++) {
            labels.push(String(i));
        }

        return labels;
    }

    //#region Data Generation
    private GenerateChartDataMaxProgress(): number[] {
        if (this.currentRank == undefined) {
            const rCurrent = Rank.RankMap.get(this.currentRankNum);
            if (!rCurrent) {
                throw new Error(`Could not find Rank ${this.currentRankNum} in RankMap`);
            }

            this.currentRank = rCurrent;
        }

        const data: number[] = [this.calculationService.CalculateCurrentRating(this.currentRank, this.rankProgress)];
        let lastRank = this.currentRank;
        let lastProgress = this.rankProgress;

        for (let i = 0; i < this.numWeeks; i++) {
            const nextRankNum = this.calculationService.CalculateNextRankNum(lastRank, lastProgress, Rank.MaxHonor);
            const nextRank = Rank.RankMap.get(nextRankNum);
            if (!nextRank) {
                throw new Error(`Could not find Rank ${nextRankNum} in RankMap`);
            }
            const nextProgress = this.calculationService.CalculateNextRankPercentage(lastRank, lastProgress, Rank.MaxHonor);

            data.push(this.calculationService.CalculateNextRating(lastRank, lastProgress, Rank.MaxHonor));

            lastRank = nextRank;
            lastProgress = nextProgress;
        }

        return data;
    }

    private GenerateChartDataHonorGoal(): number[] {
        if (this.currentRank == undefined) {
            const rCurrent = Rank.RankMap.get(this.currentRankNum);
            if (!rCurrent) {
                throw new Error(`Could not find Rank ${this.currentRankNum} in RankMap`);
            }

            this.currentRank = rCurrent;
        }

        const data: number[] = [this.calculationService.CalculateCurrentRating(this.currentRank, this.rankProgress)];
        let lastRank = this.currentRank;
        let lastProgress = this.rankProgress;

        for (let i = 0; i < this.numWeeks; i++) {
            const nextRankNum = this.calculationService.CalculateNextRankNum(lastRank, lastProgress, this.honorGoal);
            const nextRank = Rank.RankMap.get(nextRankNum);
            if (!nextRank) {
                throw new Error(`Could not find Rank ${nextRankNum} in RankMap`);
            }
            const nextProgress = this.calculationService.CalculateNextRankPercentage(lastRank, lastProgress, this.honorGoal);

            data.push(this.calculationService.CalculateNextRating(lastRank, lastProgress, this.honorGoal));

            lastRank = nextRank;
            lastProgress = nextProgress;
        }

        return data;
    }

    private GenerateChartDataMinProgress(): number[] {
        if (this.currentRank == undefined) {
            const rCurrent = Rank.RankMap.get(this.currentRankNum);
            if (!rCurrent) {
                throw new Error(`Could not find Rank ${this.currentRankNum} in RankMap`);
            }

            this.currentRank = rCurrent;
        }

        const data: number[] = [this.calculationService.CalculateCurrentRating(this.currentRank, this.rankProgress)];
        let lastRank = this.currentRank;
        let lastProgress = this.rankProgress;

        for (let i = 0; i < this.numWeeks; i++) {
            const nextRankNum = this.calculationService.CalculateNextRankNum(lastRank, lastProgress, lastRank.HonorRequirement);
            const nextRank = Rank.RankMap.get(nextRankNum);
            if (!nextRank) {
                throw new Error(`Could not find Rank ${nextRankNum} in RankMap`);
            }
            const nextProgress = this.calculationService.CalculateNextRankPercentage(lastRank, lastProgress, lastRank.HonorRequirement);

            data.push(this.calculationService.CalculateNextRating(lastRank, lastProgress, lastRank.HonorRequirement));

            lastRank = nextRank;
            lastProgress = nextProgress;
        }

        return data;
    }
    //#endregion

    private GenerateAnnotations(): AnnotationOptions[] {
        const annotations: AnnotationOptions[] = [];
        if (this.progressionChartData) {
            this.progressionChartData.datasets.forEach(set => {
                if (set.data != null) {
                    const data = set.data.map(d => Number(d));
                    const maxValue = Math.max(...data);
                    console.log(data);
                    const maxValIndex = data.indexOf(maxValue);

                    annotations.push({
                        type: 'line',
                        scaleID: 'Week',
                        yScaleID: 'CP',
                        value: maxValIndex,
                        yMin: 0,
                        yMax: maxValue,
                        borderColor: set.borderColor?.toString() ?? "white",
                        drawTime: 'afterDatasetsDraw',
                        borderWidth: 2,
                        borderDash: [5, 10]
                    });
                    console.log(maxValIndex);
                }
            });
        }

        for (let i = 1; i <= Rank.MaxRankNum; i++) {
            const thisRank = Rank.RankMap.get(i);
            if (thisRank) {
                const nextRank = Rank.RankMap.get(i + 1);
                annotations.push({
                    type: 'box',
                    yScaleID: 'CP',
                    xScaleID: 'Week',
                    yMin: thisRank.CpRequirement,
                    yMax: i == Rank.MaxRankNum ? 65000 : (nextRank?.CpRequirement ?? 0) - 1,
                    borderColor: "#27374D",
                    borderWidth: 1,
                    backgroundColor: 'rgba(39,55,77,.1)',
                    label: {
                        display: false,
                        drawTime: 'afterDatasetsDraw',
                        content: `Rank ${i} (${thisRank.CpRequirement} - ${i == Rank.MaxRankNum ? 65000 : (nextRank?.CpRequirement ?? 0) - 1})`,
                        position: 'end',
                        color: '#dee2e6'
                    },
                    enter({ element }) {
                        const label = element.label;
                        if (label) {
                            (element.options as BoxAnnotationOptions).backgroundColor = 'rgba(39,55,77,.6)';
                            label.options.display = true;
                            return true;
                        }
                        return false;
                    },
                    leave({ element }) {
                        const label = element.label;
                        if (label) {
                            (element.options as BoxAnnotationOptions).backgroundColor = 'rgba(39,55,77,.1)';
                            label.options.display = false;
                            return true;
                        }
                        return false;
                    }
                });
            }
        }

        return annotations;
    }

    UpdateChart(): void {
        this.progressionChartData.labels = this.GenerateChartLabels();
        this.progressionChartData.datasets[0].data = this.GenerateChartDataMaxProgress();
        this.progressionChartData.datasets[1].data = this.GenerateChartDataHonorGoal();
        this.progressionChartData.datasets[2].data = this.GenerateChartDataMinProgress();
        if (this._chart?.chart) {
            if(this._chart.chart.options.plugins?.annotation?.annotations) {
                this._chart.chart.options.plugins.annotation.annotations = this.GenerateAnnotations();
            }

            this._chart.chart.update();
        }
    }

    UpdateUrl(): void {
        this.router.navigate([ "/progression-planning", this.currentRankNum, this.rankProgress, this.numWeeks, this.honorGoal ]);
    }

    //#region Form Input Validation Methods
    /**
     * Validate that only numbers can be typed into an input of type "text" where it's intended to only represent numbers
     * @param e Input Event
     * @param allowDecimalPoint Allow Decimal Points as input or not
     */
    validateNumberBeforeInput(e: InputEvent, allowDecimalPoint: boolean): void {
        if (e.data == null)
            return;

        const elInput = <HTMLInputElement>e.target;
        let nextVal = "";
        const validRegEx = allowDecimalPoint ? /^\d+(?:[,.])?(?:\d+)?$/ : /^\d+$/;

        if (elInput.selectionStart) {
            nextVal += elInput.value.substring(0, elInput.selectionStart)
        }
        nextVal += (e.data ?? "")
        if (elInput.selectionEnd) {
            nextVal += elInput.value.substring(elInput.selectionEnd);
        }

        // remove invalid inputs
        if (!validRegEx.test(nextVal)) {
            e.preventDefault();
            return;
        }
    }

    validateNumberOnChange(e: Event, min: number, max: number): void {
        const elInput = <HTMLInputElement>e.target;

        // check if value is a valid number or NaN
        if (isNaN(Number(elInput.value))) {
            elInput.value = min.toString();
            return;
        }

        // replace min/max values
        if (Number(elInput.value) < min) {
            elInput.value = min.toString();
            return;
        }
        else if (Number(elInput.value) > max) {
            elInput.value = max.toString();
            return;
        }
    }
    //#endregion
}