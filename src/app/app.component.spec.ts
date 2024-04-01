import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { CalculatorComponent } from './calculator/calculator.component';
import { NgIconsModule } from '@ng-icons/core';
import { bootstrapClipboard, bootstrapDiscord, bootstrapChevronDoubleRight, bootstrapGithub, bootstrapGraphUpArrow, bootstrapArrowDownCircleFill, bootstrapDash, bootstrapPlus, bootstrapQuestionCircle } from '@ng-icons/bootstrap-icons';
import { simpleCurseforge } from '@ng-icons/simple-icons';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { CountdownModule } from 'ngx-countdown';
import { AppRoutingModule } from './app-routing.module';
import { ProgressionPlanningComponent } from './progression-planning/progression-planning.component';

describe('AppComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({
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
      NgIconsModule.withIcons({ bootstrapClipboard, bootstrapDiscord, bootstrapChevronDoubleRight, bootstrapGithub, bootstrapGraphUpArrow, simpleCurseforge, bootstrapPlus, bootstrapDash, bootstrapArrowDownCircleFill, bootstrapQuestionCircle }),
      CountdownModule,
      AppRoutingModule,
      BaseChartDirective
    ],
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
