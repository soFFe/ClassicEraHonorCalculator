import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { CalculatorComponent } from './calculator/calculator.component';
import { NgIconsModule } from '@ng-icons/core';
import { bootstrapClipboard, bootstrapDiscord, bootstrapChevronDoubleRight, bootstrapGithub, bootstrapGraphUpArrow } from '@ng-icons/bootstrap-icons';
import { simpleCurseforge } from '@ng-icons/simple-icons';

describe('AppComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({
    declarations: [AppComponent, HeaderComponent, FooterComponent, CalculatorComponent],
    imports: [ NgIconsModule.withIcons({ bootstrapClipboard, bootstrapDiscord, bootstrapChevronDoubleRight, bootstrapGithub, bootstrapGraphUpArrow, simpleCurseforge }) ]
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
