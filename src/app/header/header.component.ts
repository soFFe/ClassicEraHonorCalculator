import { Component } from '@angular/core';
import { CountdownConfig } from 'ngx-countdown';

@Component({
    selector: 'header-root',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
    euResetTimerConfig: CountdownConfig = {
        stopTime: this.GetEuResetTimestamp()
    };
    naResetTimerConfig: CountdownConfig = {
        stopTime: this.GetNaResetTimestamp()
    };

    GetEuResetTimestamp(): number {
        let dateNow = new Date();
        let dateReset = new Date(dateNow);
        dateReset.setUTCDate(dateNow.getUTCDate() + ((7 - dateNow.getUTCDay() + 3) % 7 || 7));
        dateReset.setUTCHours(4, 0, 0, 0);
        
        return dateReset.getTime();
    }

    GetNaResetTimestamp(): number {
        let dateNow = new Date();
        let dateReset = new Date(dateNow);
        dateReset.setUTCDate(dateNow.getUTCDate() + ((7 - dateNow.getUTCDay() + 2) % 7 || 7));
        dateReset.setUTCHours(15, 0, 0, 0);
        
        return dateReset.getTime();
    }
}
