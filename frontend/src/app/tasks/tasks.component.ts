import { Component, OnInit } from '@angular/core';
import { TaskService, AppTask } from '../services/task.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../planning/DeleteAlert/deleteAlert.component';
import { AlertDialogComponent } from '../planning/alert/alert.component';
import { Material, MaterialService } from '../services/material.service';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent implements OnInit {
  tasks: AppTask[] = [];
    materials: Material[] = []; // <-- lista materijala iz baze
  newTask: AppTask = {
    name: '',
     type: '',
    description: '',
    status: 'planned',
    deadline: new Date().toISOString().split('T')[0],
    priority: 3,
    materials: []
  };

  statusLabels: Record<string, string> = {
  'planned': 'Planiran',
  'in-progress': 'U toku',
  'delayed': 'Odložen',
  'completed': 'Završen',
  'blocked-by-budget': 'Blokiran zbog budžeta',
  'blocked-by-delayed': 'Blokiran zbog kašnjenja'
};

translateStatus(status: string | undefined): string {
  if (!status) return '';
  return this.statusLabels[status] || status;
}


  constructor(private taskService: TaskService,private dialog: MatDialog,private materialService: MaterialService) {}

  ngOnInit(): void {
    this.loadTasks();
      this.loadMaterials(); 
  }
  
  loadMaterials() {
    this.materialService.getMaterials().subscribe(materials => {
      this.materials = materials;
    });
  }

  loadTasks() {
    this.taskService.getTasks().subscribe(data => this.tasks = data);
  }



  showAlert(title: string, message: string) {
  this.dialog.open(AlertDialogComponent, {
    data: { title, message },
  });
}


save(task: AppTask) {
  if (!task.id) return;

 
  if (!task.name || task.name.trim().length < 1) {
    this.showAlert("Greška", "Naziv je obavezan (min 1 karakter).");
    return;
  }


  if (!task.type || task.type.trim().length < 1) {
  this.showAlert("Greška", "Tip je obavezan (min 1 karakter).");
    return;
  }

  
  if (!task.pricePerProduct || task.pricePerProduct <= 0) {
this.showAlert("Greška", "Cena po proizvodu mora biti veća od 0.");
    return;
  }


  if (!task.totalProducts || task.totalProducts <= 0) {
this.showAlert("Greška", "Ukupno proizvoda mora biti veće od 0.");
    return;
  }

 
  if (!task.hoursPerProduct || task.hoursPerProduct <= 0) {
this.showAlert("Greška", "Sati po proizvodu mora biti veće od 0.");
    return;
  }

 
  if (!task.methodId) {
    task.methodId = 1;
  }

   if (task.materials?.length) {
    const missingMaterials = task.materials.filter(
      m => !this.materials.some(
        dbM => dbM.name.trim().toLowerCase() === m.name.trim().toLowerCase()
      )
    );

    if (missingMaterials.length > 0) {
      const names = missingMaterials.map(m => m.name).join(', ');
      this.showAlert("Greška", `Sledeći materijali ne postoje u bazi: ${names}`);
      return;
    }
  }

 
  this.taskService.updateTask(task.id, task).subscribe({
    next: () => {
      this.loadTasks();
      this.showAlert('✅ Uspešno', 'Zadatak je uspešno sačuvan!');
    },
    error: (err) => {
      console.error('❌ Greška pri čuvanju zadatka:', err);
      this.showAlert('❌ Greška', 'Došlo je do greške pri čuvanju zadatka.');
    }
  });
}



  delete(task: AppTask) {
  const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    data: { 
      title: 'Izbriši zadatak', 
      message: `Da li ste sigurni da želite da izbrišete zadatak: "${task.name}"?` 
    },
    width: '400px'
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) { 
      if (task.id) {
        this.taskService.deleteTask(task.id)
          .subscribe(() => this.loadTasks());
      }
    }
  });
}



addTask() {
 
  if (!this.newTask.name || this.newTask.name.trim().length < 1) {
      this.showAlert("Greška","Naziv je obavezan (min 1 karakter).");
      return;
  }

  if (!this.newTask.type || this.newTask.type.trim().length < 1) {
      this.showAlert("Greška","Tip je obavezan (min 1 karakter).");
      return;
  }

  if (!this.newTask.pricePerProduct || this.newTask.pricePerProduct <= 0) {
      this.showAlert("Greška","Cena po proizvodu mora biti veća od 0.");
      return;
  }

  if (!this.newTask.totalProducts || this.newTask.totalProducts <= 0) {
      this.showAlert("Greška","Ukupno proizvoda mora biti veće od 0.");
      return;
  }

  if (!this.newTask.hoursPerProduct || this.newTask.hoursPerProduct <= 0) {
      this.showAlert("Greška","Sati po proizvodu mora biti veće od 0.");
      return;
  }

  if (!this.newTask.methodId) {
      this.newTask.methodId = 1;
  }

 
  if (this.newTask.materials?.length) {
    const missingMaterials = this.newTask.materials.filter(
      m => !this.materials.some(
        dbM => dbM.name.trim().toLowerCase() === m.name.trim().toLowerCase()
      )
    );

    if (missingMaterials.length > 0) {
        const names = missingMaterials.map(m => m.name).join(', ');
        this.showAlert("Greška", `Sledeći materijali ne postoje u bazi: ${names}`);
        return;
    }
  }

  
    this.taskService.addTask(this.newTask).subscribe(() => {
        this.loadTasks();

        this.showAlert("Uspešno","Zadatak uspešno dodat!");


        this.newTask = { 
          name: '', 
          type: '', 
          description: '', 
          status: 'planned', 
          deadline: new Date().toISOString().split('T')[0], 
          priority: 3, 
          materials: [], 
          methodId: 1
        };
    });
}

 

  addMaterialToTask(task: AppTask) {
    task.materials = task.materials || [];
    task.materials.push({ id: 0, name: '', quantity: 0 });
  }

  removeMaterialFromTask(task: AppTask, index: number) {
    task.materials?.splice(index, 1);
  }
}
