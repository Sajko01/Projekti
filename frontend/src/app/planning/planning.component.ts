
import { Component, OnInit } from '@angular/core';
import { TaskAssignment, TaskAssignmentService } from '../services/task-assignment.service';
import { TaskService } from '../services/planning.service';

import { MatDialog } from '@angular/material/dialog';
import { AlertDialogComponent } from './alert/alert.component';
import { DialogRef } from '@angular/cdk/dialog';
import { ConfirmDialogComponent } from './DeleteAlert/deleteAlert.component';

@Component({
  selector: 'app-task-assignment',
  templateUrl: './planning.component.html',
  styleUrl: './planning.component.scss'
})
export class PlanningComponent implements OnInit {
  assignments: TaskAssignment[] = [];




   rccpStart: string = '';
  rccpEnd: string = '';
  overTime: boolean = false;
  weekend: boolean = false;

  crisisStart: string = '';
  crisisEnd: string = '';





  constructor(private assignmentService: TaskAssignmentService, private taskService: TaskService, private dialog: MatDialog) {}

ngOnInit(): void {
  this.loadAssignments();
}

loadAssignments() {
  this.assignmentService.getAll().subscribe({
    next: (data) => {

      this.assignments = data.map(a => ({
        ...a,
        startDate: this.formatDate(a.startDate),
        endDate: this.formatDate(a.endDate),
      }));

      console.log("✅ Dodeljeni zadaci uspešno učitani:", this.assignments);
    },
    error: (err) => {
      console.error("❌ Greška pri učitavanju dodeljenih zadataka:", err);
      this.assignments = []; 
    }
  });
}



formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
}


onUpdateDailyBudget() {
  this.taskService.updateDailyBudget().subscribe({
    next: (res: any) => {
      console.log(res);
      this.showAlert(
        '✅ Budžet ažuriran',
        res.message || 'Dnevni budžet je uspešno ažuriran!'
      );
    },
    error: (err) => {
      console.error(err);
      this.showAlert(
        '❌ Greška',
        'Došlo je do greške pri ažuriranju dnevnog budžeta.'
      );
    }
  });
}

onUpdateProduction() {
  this.taskService.updateProductionManually().subscribe({
    next: (res: any) => {
      console.log(res);
      this.showAlert(
        '✅ Proizvodnja ažurirana',
        res.message || 'Dnevna proizvodnja je uspešno ažurirana!'
      );
    },
    error: (err) => {
      console.error(err);
      this.showAlert(
        '❌ Greška',
        'Došlo je do greške pri ažuriranju proizvodnje.'
      );
    }
  });
}


  onRecalculateCosts() {
  this.taskService.recalculateCosts().subscribe({
    next: (res: any) => {
      console.log(res);
      this.showAlert(
        '✅ Troškovi ažurirani',
         'Troškovi svih zadataka izračunati i snimljeni.'
      );
      this.loadAssignments();
    },
    error: (err) => {
      console.error(err);
      this.showAlert(
        '❌ Greška',
        'Došlo je do greške pri izračunavanju troškova.'
      );
    }
  });
}

onAdaptiveSchedule() {
  this.taskService.adaptiveScheduleAll().subscribe({
    next: (res: any) => {
      console.log(res);
      this.showAlert(
        '✅ Adaptivno raspoređivanje',
         'Adaptivno raspoređivanje izvršeno uspešno.'
      );
      this.loadAssignments(); 
    },
    error: (err) => {
      console.error(err);
      this.showAlert(
        '❌ Greška',
        'Došlo je do greške pri adaptivnom raspoređivanju.'
      );
    }
  });
}

onScheduleTasks() {
  this.taskService.scheduleTasks().subscribe({
    next: (res: any) => {
      console.log(res);
      this.showAlert(
        '✅ Raspodela zadataka',
        res?.message || 'Raspodela izvršena uspešno.'
      );
      this.loadAssignments(); 
    },
    error: (err) => {
      console.error(err);
      this.showAlert(
        '❌ Greška',
        'Došlo je do greške pri planiranju zadataka.'
      );
    }
  });
}

  onRCCP() { 
  if (!this.rccpStart || !this.rccpEnd) {
    return this.showAlert(
      '⚠️ Greška',
      'Molimo popunite oba datuma pre pokretanja RCCP analize.'
    );
  }

  this.taskService
    .roughCutCapacityPlanning(this.rccpStart, this.rccpEnd, this.overTime, this.weekend)
    .subscribe({
      next: (res) => {
        console.log('📊 RCCP rezultat:', res);

         let anyAlert = false; 

        if (res.machineCapacityOk === false) {
            anyAlert = true;
          this.showAlert(
            '⚠️ Nedovoljno mašina',
            `✅ Potrebno: <b>${res.totalRequiredMachineHours}h</b><br>
             🛠️ Dostupno: <b>${res.totalAvailableMachineHours}h</b><br>
             💡 Predlog: Dodaj još mašina.`
          );
        }

        
        if (res.workerCapacityOk === false) {
            anyAlert = true;
          this.showAlert(
            '⚠️ Nedovoljno radnika',
            `✅ Potrebno: <b>${res.totalRequiredWorkerHours}h</b><br>
             👷‍♂️ Dostupno: <b>${res.totalAvailableWorkerHours}h</b><br>
             💡 Predlog: Dodaj još radnika.`
          );
        }

         if (res.budgetOk === false) {
          anyAlert = true;
          this.showAlert(
            '⚠️ Nedovoljan budžet',
            `💡 Predlog: Povećaj budžet ili smanji obim posla.`
          );
        }

       

        if (!anyAlert) {
          this.showAlert(
            '✅ Sve u redu!',
            'Ima dovoljno mašina, radnika i budžeta za zadati period.'
          );
        }
      }
      ,
      error: (err) => {
        console.error('❌ RCCP greška:', err);
        this.showAlert(
          '❌ Greška',
          'Došlo je do greške pri izvođenju RCCP analize.'
        );
      }
    });
}



  onCrisis() {
  if (!this.crisisStart || !this.crisisEnd) {
    return this.showAlert('⚠️ Greška', 'Molimo popunite oba datuma!');
  }

  this.taskService.checkAndApplyCrisisForAllTasks(this.crisisStart, this.crisisEnd)
    .subscribe({
      next: (res) => {
        console.log('📊 Rezultat kriznog plana', res);

        if (res.messages && res.messages.length > 0) {
          const messageString = res.messages.join('<br>'); 
          this.showAlert('📊 Rezultat kriznog plana', messageString);
        } else {
          this.showAlert('📊 Rezultat kriznog plana', 'Nema poruka za prikaz.');
        }
      },
      error: (err) => {
        console.error('❌ Greška:', err);
        this.showAlert('❌ Greška', 'Došlo je do greške pri izvođenju Kriznog plana.');
      }
    });
}



    showAlert(title: string, message: string) {
    this.dialog.open(AlertDialogComponent, {
      data: { title, message },
      width: '400px'
    });
  }


delete(assignment: TaskAssignment): void {
  const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    data: { 
      title: 'Obriši dodelu', 
      message: `Da li ste sigurni da želite da obrišete dodelu #${assignment.id}?` 
    },
    width: '400px'
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) { 
      this.assignmentService.delete(assignment.id)
        .subscribe(() => this.loadAssignments());
    }
  });
}


}
