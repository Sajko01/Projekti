
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-methods',
  templateUrl: './methods.component.html',
  styleUrls: ['./methods.component.scss']
})
export class MethodsComponent implements OnInit {
  methods: any[] = [];
  displayedColumns: string[] = ['id', 'name', 'description', 'efficiencyFactor'];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadMethods();
  }

  loadMethods() {
    this.http.get<any[]>('http://localhost:3000/methods').subscribe({
      next: data => this.methods = data,
      error: err => console.error(err)
    });
  }
}

