import { ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';
import { CalculatorComponent } from './calculator.component';
import { NgIconsModule } from '@ng-icons/core';
import { bootstrapClipboard, bootstrapDiscord, bootstrapChevronDoubleRight, bootstrapGithub, bootstrapGraphUpArrow, bootstrapArrowDownCircleFill, bootstrapDash, bootstrapPlus, bootstrapQuestionCircle } from '@ng-icons/bootstrap-icons';
import { simpleCurseforge } from '@ng-icons/simple-icons';

describe('CalculatorComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [{ provider: ComponentFixtureAutoDetect, useValue: true }],
    imports: [NgIconsModule.withIcons({ bootstrapClipboard, bootstrapDiscord, bootstrapChevronDoubleRight, bootstrapGithub, bootstrapGraphUpArrow, simpleCurseforge, bootstrapPlus, bootstrapDash, bootstrapArrowDownCircleFill, bootstrapQuestionCircle }), CalculatorComponent]
}));

  it('should create the component', () => {
    const fixture = TestBed.createComponent(CalculatorComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});