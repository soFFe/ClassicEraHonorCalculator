import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgIconsModule } from '@ng-icons/core';
import { bootstrapClipboard, bootstrapDiscord, bootstrapChevronDoubleRight, bootstrapGithub, bootstrapGraphUpArrow, bootstrapPlus, bootstrapDash, bootstrapArrowDownCircleFill, bootstrapQuestionCircle, bootstrapExclamationTriangleFill } from '@ng-icons/bootstrap-icons';
import { AppComponent } from './app.component';
import { CalculatorComponent } from './calculator/calculator.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { simpleCurseforge } from '@ng-icons/simple-icons';
import { AppRoutingModule } from './app-routing.module';
import { ProgressionPlanningComponent } from './progression-planning/progression-planning.component';
import { CountdownModule } from 'ngx-countdown';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  providers: [provideCharts(withDefaultRegisterables())],
  declarations: [
    AppComponent,
    CalculatorComponent,
    HeaderComponent,
    FooterComponent,
    ProgressionPlanningComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    NgIconsModule.withIcons({ bootstrapClipboard, bootstrapDiscord, bootstrapChevronDoubleRight, bootstrapGithub, bootstrapGraphUpArrow, simpleCurseforge, bootstrapPlus, bootstrapDash, bootstrapArrowDownCircleFill, bootstrapQuestionCircle, bootstrapExclamationTriangleFill }),
    CountdownModule,
    AppRoutingModule,
    BaseChartDirective,
    NgbModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
