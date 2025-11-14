import { Component, OnInit } from '@angular/core';
import { Machine, MachineService } from '../services/machine.service';
import { ConfirmDialogComponent } from '../planning/DeleteAlert/deleteAlert.component';
import { MatDialog } from '@angular/material/dialog';
import { AlertDialogComponent } from '../planning/alert/alert.component';

@Component({
  selector: 'app-machines',
  templateUrl: './machines.component.html',
  styleUrls: ['./machines.component.scss']
})
export class MachinesComponent implements OnInit {
  machines: Machine[] = [];
  newMachine: Machine = {
    name: '',
    type:'',
    efficiency: 1.0,
    capacityPerDay: 8,
    maxWorkers: 1,
  
    availability: true,
    maxOvertimeHours: 2
  };

  constructor(private machineService: MachineService,private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadMachines();
  }

  loadMachines() {
    this.machineService.getMachines().subscribe(data => this.machines = data);
  }



  showAlert(title: string, message: string) {
  this.dialog.open(AlertDialogComponent, {
    data: { title, message },
  });
}

save(machine: Machine) {
   if (!machine.id) return;
  if (!machine.name || machine.name.trim().length < 1) {
    this.showAlert("Greška", "Naziv mašine je obavezan (min 1 karakter).");
    return;
  }

  if (!machine.type || machine.type.trim().length < 1) {
    this.showAlert("Greška", "Tip mašine je obavezan (min 1 karakter).");
    return;
  }

  if (!machine.capacityPerDay || machine.capacityPerDay <= 0) {
    this.showAlert("Greška", "Dnevni kapacitet mora biti veći od 0.");
    return;
  }

  if (!machine.maxWorkers || machine.maxWorkers <= 0) {
    this.showAlert("Greška", "Maksimalan broj radnika mora biti veći od 0.");
    return;
  }

  if (machine.maxOvertimeHours === null || machine.maxOvertimeHours === undefined || machine.maxOvertimeHours < 0) {
    this.showAlert("Greška", "Prekovremeni sati moraju biti 0 ili više.");
    return;
  }

  this.machineService.updateMachine(machine.id, machine).subscribe({
    next: () => {
      this.loadMachines();
      this.showAlert("Uspešno", "Mašina je uspešno sačuvana!");
    },
    error: (err) => {
      console.error('❌ Greška pri čuvanju mašine:', err);
      this.showAlert("Greška", "Došlo je do greške pri čuvanju mašine.");
    }
  });
}



  
  delete(machine: Machine) {
  const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    data: { 
      title: 'Izbriši mašinu', 
      message: `Da li ste sigurni da želite da izbrišete mašinu "${machine.name}"?` 
    },
    width: '400px'
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) { 
      if (machine.id) {
        this.machineService.deleteMachine(machine.id)
          .subscribe(() => this.loadMachines());
      }
    }
  });
}

addMachine() {
  if (!this.newMachine.name || this.newMachine.name.trim().length < 1) {
    this.showAlert("Greška", "Naziv mašine je obavezan (min 1 karakter).");
    return;
  }

  if (!this.newMachine.type || this.newMachine.type.trim().length < 1) {
    this.showAlert("Greška", "Tip mašine je obavezan (min 1 karakter).");
    return;
  }

  if (!this.newMachine.capacityPerDay || this.newMachine.capacityPerDay <= 0) {
    this.showAlert("Greška", "Dnevni kapacitet mora biti veći od 0.");
    return;
  }

  if (!this.newMachine.maxWorkers || this.newMachine.maxWorkers <= 0) {
    this.showAlert("Greška", "Maksimalan broj radnika mora biti veći od 0.");
    return;
  }

  if (this.newMachine.maxOvertimeHours === null || this.newMachine.maxOvertimeHours === undefined || this.newMachine.maxOvertimeHours < 0) {
    this.showAlert("Greška", "Prekovremeni sati moraju biti 0 ili više.");
    return;
  }

  this.machineService.addMachine(this.newMachine).subscribe(() => {
    this.loadMachines();
    this.showAlert("Uspešno", "Mašina je dodata!");

    this.newMachine = {
      name: '',
      type: '',
      efficiency: 1.0,
      capacityPerDay: 8,
      maxWorkers: 1,
      availability: true,
      maxOvertimeHours: 2
    };
  });
}


}
