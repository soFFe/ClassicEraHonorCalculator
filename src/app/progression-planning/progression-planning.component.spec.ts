import { ComponentFixture, ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';

import { ProgressionPlanningComponent } from './progression-planning.component';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgChartsModule } from 'ng2-charts';
import { CountdownModule } from 'ngx-countdown';
import { AppRoutingModule } from '../app-routing.module';
import { bootstrapDash, bootstrapPlus } from '@ng-icons/bootstrap-icons';
import { NgIconsModule } from '@ng-icons/core';

describe('ProgressionPlanningComponent', () => {
  let component: ProgressionPlanningComponent;
  let fixture: ComponentFixture<ProgressionPlanningComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProgressionPlanningComponent],
      providers: [{ provider: ComponentFixtureAutoDetect, useValue: true }],
      imports: [
        BrowserModule,
        FormsModule,
        CountdownModule,
        AppRoutingModule,
        NgChartsModule,
        NgIconsModule.withIcons({ bootstrapDash, bootstrapPlus})
      ],
    });
    fixture = TestBed.createComponent(ProgressionPlanningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
