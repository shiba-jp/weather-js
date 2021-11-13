import { Component, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { Class10Forecast } from '../entity/forecast/class10-forecast';
import { OfficeForecast } from '../entity/forecast/office-forecast';
import { Overview } from '../entity/forecast/overview';
import { CommonService } from '../services/common.service';
import { ForecastService } from '../services/forecast/forecast.service';

@Component({
  selector: 'app-forecast',
  templateUrl: './forecast.component.html',
  styleUrls: ['./forecast.component.css']
})
export class ForecastComponent implements OnInit  {
  public serviceProp: String = "";

  publishingOffice: string;
  reportDatetime: string;
  officeForecast: OfficeForecast;
  overview: Overview;

  /**
   * subscribe を保持するための Subscription
   *
   * @private
   * @type {Subscription}
   * @memberof Sample1Component
   */
   private subscription!: Subscription;

  constructor(
    private commonService: CommonService,
    private forecastService: ForecastService
    ) { 
    }

  ngOnInit(): void {
    this.subscription = this.commonService.sharedDataSource$.subscribe(
      selectedOfficeId => {
        console.log('[ForecastComponent]' + selectedOfficeId);

        this.forecastService.getForecastOverview(selectedOfficeId).subscribe(res => {
          this.overview = res;
        });
        
        this.officeForecast = new OfficeForecast();
        this.officeForecast.class10s = new Array<Class10Forecast>();

        this.forecastService.getForecast(selectedOfficeId).subscribe(data => {
          this.publishingOffice = data[0].publishingOffice;
          this.reportDatetime = data[0].reportDatetime;

          for(let i = 0; i < data[0].timeSeries[0].areas.length; i++) {
            console.log(data[0].timeSeries[0].areas[i]);

            let class10Forecast = new Class10Forecast();
            class10Forecast.targetArea = data[0].timeSeries[0].areas[i].area.name;
            class10Forecast.today = data[0].timeSeries[0].areas[i].weathers[0];
            class10Forecast.tomorrow = data[0].timeSeries[0].areas[i].weathers[1];
            class10Forecast.dayAfterTomorrow = data[0].timeSeries[0].areas[i].weathers[2];
            class10Forecast.tempAverageMin = data[1].tempAverage.areas[i].min;
            class10Forecast.tempAverageMax = data[1].tempAverage.areas[i].max;

            this.officeForecast.class10s.push(class10Forecast);
          }

          console.log(this.officeForecast);
        });
      }
    );
  }

  ngOnDestroy() {
    //  リソースリーク防止のため CommonService から subcribe したオブジェクトを破棄する
    this.subscription.unsubscribe();
  }
}
