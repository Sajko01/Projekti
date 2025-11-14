import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Material {
  id: number;
  name: string;
quantityAvailable: number;
price?: number;
unit: string;
}

export interface CreateMaterialDto {
  name: string;
  quantityAvailable: number;
  price?: number;
  unit: string;
}


@Injectable({
  providedIn: 'root'
})
export class MaterialService {
  private apiUrl = 'http://localhost:3000/materials';

  constructor(private http: HttpClient) {}

  getMaterials(): Observable<Material[]> {
    return this.http.get<Material[]>(this.apiUrl);
  }

  updateMaterial(id: number, data: Partial<Material>): Observable<Material> {
    return this.http.patch<Material>(`${this.apiUrl}/${id}`, data);
  }

  add(material: CreateMaterialDto): Observable<Material> {
    return this.http.post<Material>(this.apiUrl, material);
  }
}
