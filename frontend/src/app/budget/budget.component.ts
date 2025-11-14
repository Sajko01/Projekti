import { Component, OnInit } from '@angular/core';
import { Budget, BudgetService } from '../services/budget.service';
import { MatDialog } from '@angular/material/dialog';
import { AlertDialogComponent } from '../planning/alert/alert.component';

@Component({
  selector: 'app-reports',
  templateUrl: './budget.component.html',
  styleUrl: './budget.component.scss'
})

export class BudgetsComponent implements OnInit {
  budgets: Budget[] = [];

  constructor(private budgetService: BudgetService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadBudgets();
  }

  loadBudgets() {
    this.budgetService.getBudgets().subscribe(data => {
      this.budgets = data;
    });
  }

 
  showAlert(title: string, message: string) {
  this.dialog.open(AlertDialogComponent, {
    data: { title, message },
  });
}

save(budget: Budget) {

    if (!budget.currency || budget.currency.trim().length < 1) {
    this.showAlert("Greška", "Valuta je obavezna (npr. RSD, EUR, USD).");
    return;
  }

  this.budgetService.updateBudget(budget.id, budget).subscribe({
    next: () => {
      this.loadBudgets();
      this.showAlert('✅ Uspešno', 'Budžet je uspešno sačuvan!');
    },
    error: (err) => {
      console.error('❌ Greška pri čuvanju budžeta:', err);
      this.showAlert('❌ Greška', 'Došlo je do greške pri čuvanju budžeta.');
    }
  });
}


}
