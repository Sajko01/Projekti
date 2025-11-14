import { Component, OnInit } from '@angular/core';
import { WorkerService, AppWorker } from '../services/worker.service';
import { ConfirmDialogComponent } from '../planning/DeleteAlert/deleteAlert.component';
import { MatDialog } from '@angular/material/dialog';
import { AlertDialogComponent } from '../planning/alert/alert.component';

@Component({
  selector: 'app-workers',
  templateUrl: './workers.component.html',
  styleUrls: ['./workers.component.scss']
})
export class WorkersComponent implements OnInit {
  workers: AppWorker[] = [];
  newWorker: AppWorker = {
    name: '',
     type: '',
    skillLevel: 1,
    availability: true,
    capacityPerDay: 8,
    maxOvertimeHours: 2,
    hourlyRate: 10,
    weekendHourlyRate: 0,
    overTimeHourlyRate: 0
  };
 

  constructor(private workerService: WorkerService,private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadWorkers();
  }

  loadWorkers() {
    this.workerService.getWorkers().subscribe(data => {
      this.workers = data; 
    });
  }


  showAlert(title: string, message: string) {
  this.dialog.open(AlertDialogComponent, {
    data: { title, message },
  });
}




save(worker: AppWorker) {
  if (!worker.id) return;

  if (!worker.name || worker.name.trim().length < 1) {
    this.showAlert("Greška", "Naziv je obavezan (min 1 karakter).");
    return;
  }

  if (!worker.type || worker.type.trim().length < 1) {
    this.showAlert("Greška", "Tip je obavezan (min 1 karakter).");
    return;
  }

  if (worker.skillLevel !== 1 && worker.skillLevel !== 2) {
    this.showAlert("Greška", "Nivo veštine mora biti 1 ili 2.");
    return;
  }

  if (!worker.hourlyRate || worker.hourlyRate <= 0) {
    this.showAlert("Greška", "Dnevnica mora biti veća od 0.");
    return;
  }

  if (!worker.weekendHourlyRate || worker.weekendHourlyRate <= 0) {
    this.showAlert("Greška", "Dnevnica vikendom mora biti veća od 0.");
    return;
  }

  if (!worker.overTimeHourlyRate || worker.overTimeHourlyRate <= 0) {
    this.showAlert("Greška", "Dnevnica prekovremeno mora biti veća od 0.");
    return;
  }

  this.workerService.updateWorker(worker.id, worker).subscribe({
    next: () => {
      this.loadWorkers();
      this.showAlert("Uspešno", "Radnik je uspešno sačuvan!");
    },
    error: (err) => {
      console.error('❌ Greška pri čuvanju radnika:', err);
      this.showAlert("Greška", "Došlo je do greške pri čuvanju radnika.");
    }
  });
}




  delete(worker: AppWorker) {
  const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    data: { 
      title: 'Izbriši radnika', 
      message: `Da li ste sigurni da želite da izbrišete radnika: "${worker.name}"?` 
    },
    width: '400px'
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) { 
      if (worker.id) {
        this.workerService.deleteWorker(worker.id)
          .subscribe(() => this.loadWorkers());
      }
    }
  });
}




  addWorker() {
    if (!this.newWorker.name || this.newWorker.name.trim().length < 1) {
        this.showAlert("Greška", "Naziv je obavezan (min 1 karakter).");
        return;
    }

    if (!this.newWorker.type || this.newWorker.type.trim().length < 1) {
        this.showAlert("Greška", "Tip je obavezan (min 1 karakter).");
        return;
    }

    if (this.newWorker.skillLevel !== 1 && this.newWorker.skillLevel !== 2) {
        this.showAlert("Greška", "Nivo veštine mora biti 1 ili 2.");
        return;
    }

    if (!this.newWorker.hourlyRate || this.newWorker.hourlyRate <= 0) {
        this.showAlert("Greška", "Dnevnica mora biti veća od 0.");
        return;
    }

    if (!this.newWorker.weekendHourlyRate || this.newWorker.weekendHourlyRate <= 0) {
        this.showAlert("Greška", "Dnevnica vikendom mora biti veća od 0.");
        return;
    }

    if (!this.newWorker.overTimeHourlyRate || this.newWorker.overTimeHourlyRate <= 0) {
        this.showAlert("Greška", "Dnevnica prekovremeno mora biti veća od 0.");
        return;
    }

    this.workerService.addWorker(this.newWorker).subscribe(() => {
      this.loadWorkers();
      this.showAlert("Uspešno", "Radnik uspešno dodat!");

      this.newWorker = {
        name: '',
        type: '',
        skillLevel: 1,
        availability: true,
        capacityPerDay: 8,
        maxOvertimeHours: 2,
        hourlyRate: 10,
        weekendHourlyRate: 0,
        overTimeHourlyRate: 0
      };
    });
}

}
