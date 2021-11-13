import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Overview } from 'src/app/entity/forecast/overview';
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json'})
};

@Injectable({
  providedIn: 'root'
})
export class ForecastService {

  constructor(private http: HttpClient) { }

  getForecastOverview(selectedOfficeId: string): Observable<Overview> {
  
    let officeId = selectedOfficeId;
    let url2 = `https://www.jma.go.jp/bosai/forecast/data/overview_forecast/${officeId}.json`;
    
    return this.http.get<Overview>(url2)
      .pipe(
        catchError(this.handleError<Overview>('getForecastOverview'))
      );
  }

  getForecast(selectedOfficeId: string): Observable<any> {
  
    let officeId = selectedOfficeId;
    let url = `https://www.jma.go.jp/bosai/forecast/data/forecast/${officeId}.json`;
    
    return this.http.get<any>(url)
      .pipe(
        catchError(this.handleError('getForecast', []))
      );
  }

  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      console.log(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
