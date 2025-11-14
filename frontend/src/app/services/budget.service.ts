import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Budget {
  id: number;
  currency: string;
  amountAllocated: number;
  amountUsed: number;
}

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private apiUrl = 'http://localhost:3000/budgets';

  constructor(private http: HttpClient) {}

  getBudgets(): Observable<Budget[]> {
    return this.http.get<Budget[]>(this.apiUrl);
  }

  updateBudget(id: number, budget: Partial<Budget>): Observable<Budget> {
    return this.http.patch<Budget>(`${this.apiUrl}/${id}`, budget);
  }
}
