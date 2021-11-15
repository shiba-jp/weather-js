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

    toLocaleString( date: Date )
    {
        return [
            date.getFullYear(),
            date.getMonth() + 1,
            date.getDate()
            ].join( '/' ) + ' '
            + date.toLocaleTimeString("ja-JP");
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
          this.publishingOffice = data[0].publishingOffice ?? '';
          let reportDate: Date = new Date(data[0].reportDatetime);
          this.reportDatetime = this.toLocaleString(reportDate);
          
          console.log(data[1]);

          for(let i = 0; i < data[0].timeSeries[0].areas.length; i++) {
            console.log(data[0].timeSeries[0].areas[i]);
            console.log(data[1].timeSeries[1].areas[i]);

            let class10Forecast = new Class10Forecast();
            class10Forecast.targetArea = data[0].timeSeries[0].areas[i].area.name ?? '';
            class10Forecast.today = data[0].timeSeries[0].areas[i].weathers[0] ?? '';
            class10Forecast.tomorrow = data[0].timeSeries[0].areas[i].weathers[1] ?? '';
            if(data[0].timeSeries[0].areas[i].weathers.length > 2) {
              class10Forecast.dayAfterTomorrow = data[0].timeSeries[0].areas[i].weathers[2] ?? '';
            }else{
              class10Forecast.dayAfterTomorrow = '-';
            }

            let tempbase = data[0].timeSeries[2].areas[i];
            let temp = "朝の最低：" + tempbase.temps[0] + "　日中の最高：" +  tempbase.temps[1];
            class10Forecast.temp = temp;

            console.log(class10Forecast);
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
