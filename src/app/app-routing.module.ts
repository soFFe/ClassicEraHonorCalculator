import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CalculatorComponent } from './calculator/calculator.component';
import { ProgressionPlanningComponent } from './progression-planning/progression-planning.component';

const appRoutes: Routes = [
    {
        pathMatch: 'prefix',
        path: 'calculator/:currentRankNum/:rankProgress/:honorFarmed',
        component: CalculatorComponent
    },
    {
        path: 'progression-planning',
        component: ProgressionPlanningComponent
    },
    { path: '', redirectTo: '/calculator/1/0/0', pathMatch: 'full' },
    // { path: '**', redirectTo: '/calculator/1/0/0' }
];

@NgModule({
    declarations: [],
    imports: [
        RouterModule.forRoot(
            appRoutes,
            {
                bindToComponentInputs: true,
                enableTracing: false // true = debug routing
            }
        )
    ],
    exports: [
        RouterModule
    ]
})
export class AppRoutingModule { }
