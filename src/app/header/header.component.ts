import { APP_BASE_HREF, PlatformLocation } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { CountdownConfig } from 'ngx-countdown';

@Component({
    selector: 'header-root',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    providers: [{
        provide: APP_BASE_HREF,
        useFactory: (pl: PlatformLocation) => pl.getBaseHrefFromDOM(),
        deps: [PlatformLocation]
    }]
})
export class HeaderComponent {
    euResetTimerConfig: CountdownConfig = {
        stopTime: this.GetEuResetTimestamp(),
        timezone: "UTC",
        format: 'd\'d\' HH\'h \'mm\'m\' ss\'s\''
    };
    naResetTimerConfig: CountdownConfig = {
        stopTime: this.GetNaResetTimestamp(),
        timezone: "UTC",
        format: 'd\'d\' HH\'h \'mm\'m\' ss\'s\''
    };

    constructor(@Inject(APP_BASE_HREF) public baseHref: string) {

    }

    GetEuResetTimestamp(): number {
        const dateNow = new Date();
        const dateReset = new Date(dateNow);
        dateReset.setUTCDate(dateNow.getUTCDate() + ((7 - dateNow.getUTCDay() + 3) % 7 || 7));
        dateReset.setUTCHours(4, 0, 0, 0);

        console.log("🇪🇺", dateReset);
        return dateReset.getTime();
    }

    GetNaResetTimestamp(): number {
        const dateNow = new Date();
        const dateReset = new Date(dateNow);
        dateReset.setUTCDate(dateNow.getUTCDate() + ((7 - dateNow.getUTCDay() + 2) % 7 || 7));
        dateReset.setUTCHours(15, 0, 0, 0);

        console.log("🇺🇸", dateReset);
        return dateReset.getTime();
    }
}
