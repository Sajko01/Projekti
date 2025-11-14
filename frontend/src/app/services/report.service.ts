// src/app/services/task-report.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface WorkerDto {
  id: number;
  name: string;
  capacityPerDay: number;
}
export interface MaterialDto {
  id: number;
  name: string;
  used: number;
  price: number;

}

export interface MachineDto {
  id: number;
  name: string;
  capacityPerDay: number;
}

export interface TaskReportDto {
  id: number;
  name: string;
  priority: number;
  status: string;
  totalProducts: number;
  produced: number;
  hoursPerProduct: number;
  plannedStart: string | null; 
  plannedEnd: string | null;   
  delayDays: number;
  delayed: 'YES' | 'NO';
  workers: WorkerDto[];
  materials: MaterialDto[];

  machines: MachineDto[];
  method: string | null;
}

export interface SummaryDto {
  totalTasks: number;
  planned: number;
  inProgress: number;
  completed: number;
  delayed: number;
  onTime: number;
  delayedPercentage: string;
}

export interface ProductionReportDto {
  period: { startDate: string; endDate: string };
  summary: SummaryDto;
  tasks: TaskReportDto[];
}

@Injectable({
  providedIn: 'root'
})
export class TaskReportService {
  private base = 'http://localhost:3000/tasks/report/production';

  constructor(private http: HttpClient) {}

  getProductionReport(start: string, end: string): Observable<ProductionReportDto> {
    const params = new HttpParams().set('start', start).set('end', end);
    return this.http.get<ProductionReportDto>(this.base, { params });
  }
}
