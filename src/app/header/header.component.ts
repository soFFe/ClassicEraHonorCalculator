import { APP_BASE_HREF, PlatformLocation } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { CountdownConfig } from 'ngx-countdown';

const CountdownTimeUnits: Array<[string, number]> = [
    ['D', 1000 * 60 * 60 * 24], // days
    ['H', 1000 * 60 * 60], // hours
    ['m', 1000 * 60], // minutes
    ['s', 1000], // seconds
    ['S', 1], // milliseconds
];

@Component({
    selector: 'header-root',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    providers: [{
            provide: APP_BASE_HREF,
            useFactory: (pl: PlatformLocation) => pl.getBaseHrefFromDOM(),
            deps: [PlatformLocation]
        }],
    standalone: false
})
export class HeaderComponent {
    euResetTimerConfig: CountdownConfig = {
        stopTime: this.GetEuResetTimestamp(),
        //timezone: "UTC",
        format: 'DHH:mm:ss',
        formatDate: ({ date, formatStr }) => {
            let duration = Number(date || 0);

            return CountdownTimeUnits.reduce((current, [name, unit]) => {
                if (current.indexOf(name) !== -1) {
                    const v = Math.floor(duration / unit);
                    duration -= v * unit;
                    return current.replace(new RegExp(`${name}+`, 'g'), (match: string) => {
                        // When days is empty
                        if (name === 'D' && v <= 0) {
                            return '';
                        }
                        if (name === 'D' && v > 0) {
                            return v.toString().padStart(match.length, '0').concat("d ");
                        }
                        return v.toString().padStart(match.length, '0');
                    });
                }
                return current;
            }, formatStr);
        }
    };
    naResetTimerConfig: CountdownConfig = {
        stopTime: this.GetNaResetTimestamp(),
        //timezone: "UTC",
        format: 'DHH:mm:ss',
        formatDate: ({ date, formatStr }) => {
            let duration = Number(date || 0);

            return CountdownTimeUnits.reduce((current, [name, unit]) => {
                if (current.indexOf(name) !== -1) {
                    const v = Math.floor(duration / unit);
                    duration -= v * unit;
                    return current.replace(new RegExp(`${name}+`, 'g'), (match: string) => {
                        // When days is empty
                        if (name === 'D' && v <= 0) {
                            return '';
                        }
                        if (name === 'D' && v > 0) {
                            return v.toString().padStart(match.length, '0').concat("d ");
                        }
                        return v.toString().padStart(match.length, '0');
                    });
                }
                return current;
            }, formatStr);
        }
    };

    constructor(@Inject(APP_BASE_HREF) public baseHref: string) {

    }

    GetEuResetTimestamp(): number {
        const dateNow = new Date();
        const dateNowTimestamp = dateNow.getTime();

        const dateLastReset = new Date(dateNow);
        const lastResetDayOffset = 3 - dateNow.getUTCDay();
        dateLastReset.setUTCDate(dateNow.getUTCDate() + lastResetDayOffset)
        dateLastReset.setUTCHours(4, 0, 0, 0);
        const dateLastResetDayTimestamp = dateLastReset.getTime();

        const dateNextReset = new Date(dateNow);
        const nextResetDayOffset = ((7 - dateNow.getUTCDay() + 3) % 7) || 7;
        dateNextReset.setUTCDate(dateNow.getUTCDate() + nextResetDayOffset);
        dateNextReset.setUTCHours(4, 0, 0, 0);
        const nextResetDayTimestamp = dateNextReset.getTime();


        if (dateNowTimestamp >= dateLastResetDayTimestamp && dateNowTimestamp <= nextResetDayTimestamp) {
            console.log("[N🇪🇺] ", dateNextReset);
            return dateNextReset.getTime();
        }
        else {
            console.log("[L🇪🇺] ", dateLastReset);
            return dateLastReset.getTime();
        }
    }

    GetNaResetTimestamp(): number {
        const dateNow = new Date();
        const dateNowTimestamp = dateNow.getTime();

        const dateLastReset = new Date(dateNow);
        const lastResetDayOffset = 2 - dateNow.getUTCDay();
        dateLastReset.setUTCDate(dateNow.getUTCDate() + lastResetDayOffset)
        dateLastReset.setUTCHours(15, 0, 0, 0);
        const dateLastResetDayTimestamp = dateLastReset.getTime();

        const dateNextReset = new Date(dateNow);
        const nextResetDayOffset = ((7 - dateNow.getUTCDay() + 2) % 7) || 7;
        dateNextReset.setUTCDate(dateNow.getUTCDate() + nextResetDayOffset);
        dateNextReset.setUTCHours(15, 0, 0, 0);
        const nextResetDayTimestamp = dateNextReset.getTime();


        if (dateNowTimestamp >= dateLastResetDayTimestamp && dateNowTimestamp <= nextResetDayTimestamp) {
            console.log("[N🇺🇸] ", dateNextReset);
            return dateNextReset.getTime();
        }
        else {
            console.log("[L🇺🇸] ", dateLastReset);
            return dateLastReset.getTime();
        }
    }
}
