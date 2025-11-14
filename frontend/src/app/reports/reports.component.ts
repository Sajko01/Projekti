
import { Component, OnInit } from '@angular/core';
import { ProductionReportDto, TaskReportDto, TaskReportService } from '../services/report.service';


@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  startDate: string;
  endDate: string;
  loading = false;
  error: string | null = null;
  report: ProductionReportDto | null = null;

  constructor(private reportSvc: TaskReportService) {
  
    const now = new Date();
    const prev = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30);
    this.startDate = prev.toISOString().slice(0, 10);
    this.endDate = now.toISOString().slice(0, 10);
  }

  ngOnInit(): void {}

  generateReport() {
    this.error = null;
    this.report = null;

    if (!this.startDate || !this.endDate) {
      this.error = 'Popuni oba datuma.';
      return;
    }

    this.loading = true;
    this.reportSvc.getProductionReport(this.startDate, this.endDate).subscribe({
      next: (r) => {
        this.report = r;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Greška pri učitavanju izveštaja.';
        this.loading = false;
      }
    });
  }

  fmtDate(iso: string | null): string {
    return iso ? new Date(iso).toLocaleString() : '—';
  }

  fmtStatus(status: string): string {
    const map: Record<string, string> = {
      'planned': 'Planirano',
      'in-progress': 'U toku',
      'completed': 'Završeno',
      'delayed': 'Odložen',
      'blocked-by-budget': 'Blokiran zbog budžeta',
      'blocked-by-delayed': 'Odložen do daljnjeg zbog kašnjenja'
    };
    return map[status] || status;
  }

  delayedLabel(task: TaskReportDto) {
    return task.delayed === 'YES' || task.delayDays > 0 ? `Kašnjenje: DA (${task.delayDays}d)` : 'Kašnjenje: NE';
  }
}
