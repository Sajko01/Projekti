import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task } from '../interfaces/task'; // tipizacija za Task

@Injectable({
  providedIn: 'root'
})
export class TasksService {


  private apiUrl = 'http://localhost:3000/tasks';  

  constructor(private http: HttpClient) { }


  getAll(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl);
  }


  getById(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`);
  }

  
  create(task: Task): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task);
  }

  update(id: number, task: Task): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${id}`, task);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
