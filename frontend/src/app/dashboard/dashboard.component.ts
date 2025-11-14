

import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../services/dashboard.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  stats: { label: string; value: number | string }[] = [];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadStats();
  }

 
  loadStats() {
  this.dashboardService.getStats().subscribe({
    next: (data) => {
      if (!data) {
        console.warn('⚠️ Nema podataka sa backenda – koristi se dummy vrednosti');
        data = {
          totalBudget: 0,
          totalTasks: 0,
          rccpAlerts: 0,
          totalWorkers: 0,
          totalMachines: 0
        };
      }

      this.stats = [
        { label: 'Ukupni budžet', value: data.totalBudget },
        { label: 'Ukupno poslova', value: data.totalTasks },
        { label: 'Krizne situacije', value: data.rccpAlerts },
        { label: 'Ukupno radnika', value: data.totalWorkers },
        { label: 'Ukupno mašina', value: data.totalMachines }
      ];
    },
    error: (err) => {
      console.error('❌ Greška sa backendom:', err);

      this.stats = [
        { label: 'Ukupni budžet', value: 0 },
        { label: 'Ukupno poslova', value: 0 },
        { label: 'Krizne situacije', value: 0 },
        { label: 'Ukupno radnika', value: 0 },
        { label:  'Ukupno mašina', value: 0 }
      ];
    }
  });
}

}

