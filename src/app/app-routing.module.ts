import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CalculatorComponent } from './calculator/calculator.component';
import { ProgressionPlanningComponent } from './progression-planning/progression-planning.component';
import { FaqComponent } from './faq/faq.component';

const appRoutes: Routes = [
    {
        path: 'calculator',
        component: CalculatorComponent
    },
    {
        path: 'calculator/:currentRankNum/:rankProgress/:honorFarmed',
        component: CalculatorComponent
    },
    {
        path: 'calculator/:currentRankNum/:rankProgress/:honorFarmed/:characterLevel',
        component: CalculatorComponent
    },
    {
        path: 'progression-planning',
        component: ProgressionPlanningComponent
    },
    {
        path: 'progression-planning/:currentRankNum/:rankProgress/:numWeeks/:targetRankNum',
        component: ProgressionPlanningComponent
    },
    {
        path: 'faq',
        component: FaqComponent
    },
    { pathMatch: 'full', path: '', redirectTo: '/calculator' },
    { path: '**', redirectTo: '/calculator' }
];

@NgModule({
    declarations: [],
    imports: [
        RouterModule.forRoot(
            appRoutes,
            {
                bindToComponentInputs: true,
                onSameUrlNavigation: 'reload',
                enableTracing: false // true = debug routing
            }
        )
    ],
    exports: [
        RouterModule
    ]
})
export class AppRoutingModule { }
