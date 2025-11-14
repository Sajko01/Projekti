
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AppWorker {
  id?: number;
  name: string;
    type:string;
  skillLevel: number;
  availability: boolean;
  capacityPerDay: number;
  maxOvertimeHours: number;
  hourlyRate: number;
  weekendHourlyRate?: number;
  overTimeHourlyRate?: number;
}

@Injectable({
  providedIn: 'root'
})
export class WorkerService {
  private apiUrl = 'http://localhost:3000/workers';

  constructor(private http: HttpClient) {}

  getWorkers(): Observable<AppWorker[]> {
    return this.http.get<AppWorker[]>(this.apiUrl);
  }

  addWorker(worker: AppWorker): Observable<AppWorker> {
    return this.http.post<AppWorker>(this.apiUrl, worker);
  }

  updateWorker(id: number, worker: Partial<AppWorker>): Observable<AppWorker> {
    return this.http.patch<AppWorker>(`${this.apiUrl}/${id}`, worker);
  }

  deleteWorker(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
