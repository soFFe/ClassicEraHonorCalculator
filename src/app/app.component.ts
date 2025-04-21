import { Component } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './footer/footer.component';
import { provideIcons } from '@ng-icons/core';
import { bootstrapClipboard, bootstrapDiscord, bootstrapChevronDoubleRight, bootstrapGithub, bootstrapGraphUpArrow, bootstrapPlus, bootstrapDash, bootstrapArrowDownCircleFill, bootstrapQuestionCircle, bootstrapExclamationTriangleFill, bootstrap123, bootstrapInfoCircleFill, bootstrapArrowBarRight } from '@ng-icons/bootstrap-icons';
import { simpleCurseforge } from '@ng-icons/simple-icons';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [HeaderComponent, RouterOutlet, FooterComponent],
    viewProviders: [provideIcons({ bootstrapClipboard, bootstrapDiscord, bootstrapChevronDoubleRight, bootstrapGithub, bootstrapGraphUpArrow, simpleCurseforge, bootstrapPlus, bootstrapDash, bootstrapArrowDownCircleFill, bootstrapQuestionCircle, bootstrapExclamationTriangleFill, bootstrap123, bootstrapInfoCircleFill, bootstrapArrowBarRight })]
})
export class AppComponent {
}
