import { Component, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { Class10Forecast } from '../entity/forecast/class10-forecast';
import { OfficeForecast } from '../entity/forecast/office-forecast';
import { Overview } from '../entity/forecast/overview';
import { AreaTemp } from '../entity/forecast/area-temp';
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
  areaTemps: Array<AreaTemp>;

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
          
          this.areaTemps = new Array<AreaTemp>();
          for (let i = 0; i < data[0].timeSeries[2].areas.length; i++) {
            let tempbase = data[0].timeSeries[2].areas[i];

            let temp = new AreaTemp();
            temp.code = tempbase.area.code;
            temp.name = tempbase.area.name;
            if(tempbase.temps.length == 2) {
              temp.todayMin = "-";
              temp.todayMax = "-";
              temp.tomorrowMin = tempbase.temps[0];
              temp.tomorrowMax = tempbase.temps[1];
            }
            if(tempbase.temps.length == 4) {
              if(tempbase.temps[0] == tempbase.temps[1]) {
                temp.todayMin = "-";
              }else{
                temp.todayMin = tempbase.temps[0];
              }
              temp.todayMax = tempbase.temps[1];
              temp.tomorrowMin = tempbase.temps[2];
              temp.tomorrowMax = tempbase.temps[3];
            }
            this.areaTemps.push(temp);
          }
          console.log(this.areaTemps);

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
