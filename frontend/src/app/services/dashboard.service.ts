import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface DashboardStats {
  totalBudget: number;
  totalTasks: number;
  rccpAlerts: number;
  totalWorkers: number;
  totalMachines: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private http: HttpClient) {}

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>('http://localhost:3000/tasks/stats/stats'); // endpoint backend-a
  }
}
