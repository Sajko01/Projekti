import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AppTask {
  id?: number;
  name: string;
    type:string;
  description?: string;
  status?: 'planned' | 'in-progress' | 'delayed' | 'completed' | 'blocked-by-budget' | 'blocked-by-delayed';
  deadline?: string;
  priority?: number;
  totalCost?: number;
  pricePerProduct?: number;
  revenue?: number;
  totalProducts?: number;
  producedProducts?: number;
  hoursPerProduct?: number;
  delayDays?: number;
  methodId?: number;
  materials?: { id: number; name: string; quantity: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:3000/tasks';

  constructor(private http: HttpClient) {}

  getTasks(): Observable<AppTask[]> {
    return this.http.get<AppTask[]>(this.apiUrl);
  }

  addTask(task: AppTask): Observable<AppTask> {
    return this.http.post<AppTask>(this.apiUrl, task);
  }

  updateTask(id: number, task: Partial<AppTask>): Observable<AppTask> {
    return this.http.patch<AppTask>(`${this.apiUrl}/${id}`, task);
  }

  deleteTask(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
