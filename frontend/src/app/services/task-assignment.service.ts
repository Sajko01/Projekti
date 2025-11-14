import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TaskAssignment {
  id: number;
  taskId: number;
  workerId?: number;
  machineId?: number;
  startDate: string;
  endDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class TaskAssignmentService {
  private apiUrl = 'http://localhost:3000/task-assignments';

  constructor(private http: HttpClient) {}

  getAll(): Observable<TaskAssignment[]> {
    return this.http.get<TaskAssignment[]>(this.apiUrl);
  }

  
 delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

}
