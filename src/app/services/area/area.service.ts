import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, Subject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json'})
};

@Injectable({
  providedIn: 'root'
})
export class AreaService {
  private sharedDataSource = new Subject<string>();
  public sharedDataSource$ = this.sharedDataSource.asObservable();

  public onNotifySharedDataChanged(updateed: string) {
    console.log('[AreaService] onNotifySharedDataChanged fired.');
    this.sharedDataSource.next(updateed);
  }

  private url = 'https://www.jma.go.jp/bosai/common/const/area.json';

  constructor(private http: HttpClient) {}

  getCenters(): Observable<any> {
    return this.http.get<any>(this.url)
      .pipe(
        catchError(this.handleError('getCenters', []))
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
