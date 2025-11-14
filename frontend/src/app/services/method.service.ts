import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Method {
  id: number;
  name: string;
  description: string;
  efficiencyFactor: number;
}

@Injectable({ providedIn: 'root' })
export class MethodService {
  private apiUrl = 'http://localhost:3000/methods';

  constructor(private http: HttpClient) {}

  getAllMethods(): Observable<Method[]> {
    return this.http.get<Method[]>(this.apiUrl);
  }
}
