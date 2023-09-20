import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { NgIconsModule } from '@ng-icons/core';
import { bootstrapClipboard, bootstrapDiscord, bootstrapChevronDoubleRight, bootstrapGithub, bootstrapGraphUpArrow } from '@ng-icons/bootstrap-icons';

import { AppComponent } from './app.component';
import { CalculatorComponent } from './calculator/calculator.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { simpleCurseforge } from '@ng-icons/simple-icons';

@NgModule({
  declarations: [
    AppComponent,
    CalculatorComponent,
    HeaderComponent,
    FooterComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    NgIconsModule.withIcons({ bootstrapClipboard, bootstrapDiscord, bootstrapChevronDoubleRight, bootstrapGithub, bootstrapGraphUpArrow, simpleCurseforge })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
