import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private apiUrl = 'http://localhost:3000/tasks';

  constructor(private http: HttpClient) {}

  updateDailyBudget(): Observable<any> {
    return this.http.post(`${this.apiUrl}/daily-update`, {});
  }

  updateProductionManually(): Observable<any> {
    return this.http.post(`${this.apiUrl}/update-production`, {});
  }

  recalculateCosts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/recalculate/costs`);
  }


  adaptiveScheduleAll(): Observable<any> {
    return this.http.post(`${this.apiUrl}/adaptive-schedule`, {});
  }



  scheduleTasks(): Observable<any> {
    return this.http.post(`${this.apiUrl}/schedule`, {});
  }

  roughCutCapacityPlanning(start: string, end: string, overTime = false, weekend = false): Observable<any> {
  const params = new HttpParams()
    .set('start', start)
    .set('end', end)
    .set('overTime', overTime.toString())
    .set('weekend', weekend.toString());

  return this.http.get(`${this.apiUrl}/analysis/rccp`, { params });
}

checkAndApplyCrisisForAllTasks(start?: string, end?: string): Observable<any> {
  let params = new HttpParams();
  if (start) params = params.set('start', start);
  if (end) params = params.set('end', end);

  return this.http.post(`${this.apiUrl}/check-crisis-all`, {}, { params });
}

}
