import { Component, OnInit } from '@angular/core';
import { CrisisPlanService } from '../services/crisisplan.service';
import { MatDialog } from '@angular/material/dialog';
import { AlertDialogComponent } from '../planning/alert/alert.component';


export interface CrisisPlan {
  id: number;
  description: string;
  triggerCondition: string;
  action: string;

    tempTriggerNumber?: number;
}

@Component({
  selector: 'app-crisis-plans',
  templateUrl: './crisis-plans.component.html',
  styleUrls: ['./crisis-plans.component.scss']
})
export class CrisisPlansComponent implements OnInit {
  crisisPlans: CrisisPlan[] = [];

  constructor(private crisisPlanService: CrisisPlanService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadCrisisPlans();
  }

  loadCrisisPlans() {
    this.crisisPlanService.getAll().subscribe(data => {
      this.crisisPlans = data;
       this.crisisPlans.forEach(plan => {
      plan.tempTriggerNumber = this.getTriggerNumber(plan.triggerCondition);
    });
    });
  }


  showAlert(title: string, message: string) {
  this.dialog.open(AlertDialogComponent, {
    data: { title, message },
  });
}




getTriggerNumber(triggerCondition: string): number {
  const match = triggerCondition.match(/([<>]=?)\s*(\d+(\.\d+)?)/);
  if (match) {
    return parseFloat(match[2]);
  }
  return 0; 
}


validateTriggerNumber(value: any): number | null {
  const num = parseFloat(value);
  if (isNaN(num) || num < 0) {
    this.showAlert('Greška', 'Broj mora biti 0 ili veći.');
    return null;
  }
  return num;
}


saveTriggerNumber(plan: CrisisPlan) {
  const validNumber = this.validateTriggerNumber(plan.tempTriggerNumber);
  if (validNumber === null) return;

 
  const updatedCondition = plan.triggerCondition.replace(/([<>]=?)\s*\d+(\.\d+)?/, `$1 ${validNumber}`);

  this.crisisPlanService.update(plan.id, { triggerCondition: updatedCondition }).subscribe({
    next: () => {
      plan.triggerCondition = updatedCondition; 
      this.showAlert('✅ Uspešno', 'Uslov okidanja je uspešno sačuvan!');
    },
    error: (err) => {
      console.error('❌ Greška pri čuvanju:', err);
      this.showAlert('❌ Greška', 'Došlo je do greške pri čuvanju uslova.');
    }
  });
}






save(plan: CrisisPlan) {

  const validNumber = this.validateTriggerNumber(plan.tempTriggerNumber);
  if (validNumber === null) return;

 
  const updatedCondition = plan.triggerCondition.replace(
    /([<>]=?)\s*\d+(\.\d+)?/,
    `$1 ${validNumber}`
  );


  this.crisisPlanService.update(plan.id, { triggerCondition: updatedCondition }).subscribe({
    next: (updated) => {
      plan.triggerCondition = updatedCondition; 
      this.showAlert('✅ Uspešno', 'Uslov okidanja je uspešno sačuvan!');
    },
    error: (err) => {
      console.error('❌ Greška pri čuvanju:', err);
      this.showAlert('❌ Greška', 'Došlo je do greške pri čuvanju uslova.');
    }
  });
}


}
