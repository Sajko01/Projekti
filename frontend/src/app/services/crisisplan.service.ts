import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CrisisPlan {
  id: number;
  description: string;
  triggerCondition: string;
  action: string;

  tempTriggerNumber?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CrisisPlanService {
  private apiUrl = 'http://localhost:3000/crisis-plans';

  constructor(private http: HttpClient) {}


  getAll(): Observable<CrisisPlan[]> {
    return this.http.get<CrisisPlan[]>(this.apiUrl);
  }


  update(id: number, data: Partial<CrisisPlan>): Observable<CrisisPlan> {
    return this.http.patch<CrisisPlan>(`${this.apiUrl}/${id}`, data);
  }
}
