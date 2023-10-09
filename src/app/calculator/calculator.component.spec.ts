import { ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';
import { CalculatorComponent } from './calculator.component';
import { NgIconsModule } from '@ng-icons/core';
import { bootstrapClipboard, bootstrapDiscord, bootstrapChevronDoubleRight, bootstrapGithub, bootstrapGraphUpArrow } from '@ng-icons/bootstrap-icons';

describe('CalculatorComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({
    declarations: [CalculatorComponent],
    providers: [{ provider: ComponentFixtureAutoDetect, useValue: true }],
    imports: [NgIconsModule.withIcons({ bootstrapClipboard, bootstrapDiscord, bootstrapChevronDoubleRight, bootstrapGithub, bootstrapGraphUpArrow })]
  }));

  it('should create the component', () => {
    const fixture = TestBed.createComponent(CalculatorComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});