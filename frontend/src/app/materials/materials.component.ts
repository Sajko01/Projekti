import { Component, OnInit } from '@angular/core';
import { CreateMaterialDto, Material, MaterialService } from '../services/material.service';
import { AlertDialogComponent } from '../planning/alert/alert.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-materials',
  templateUrl: './materials.component.html',
  styleUrl: './materials.component.scss'
})
export class MaterialComponent implements OnInit{
  materials: Material[] = [];
  displayedColumns = ['name', 'quantityAvailable', 'price', 'unit', 'actions'];
  newMaterial: CreateMaterialDto = { name: '', quantityAvailable: 0, unit: '', price: 0 };


  constructor(private materialService: MaterialService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadMaterials();
  }

  loadMaterials() {
    this.materialService.getMaterials().subscribe(data => {
      this.materials = data;
    });
  }



save(material: Material) {
  if (!material.price || material.price <= 0) {
    this.showAlert("Greška", "Cena mora biti veća od 0.");
    return;
  }


  material.quantityAvailable = 999999999;

  const { id, quantityAvailable, price } = material;

  this.materialService.updateMaterial(id, { quantityAvailable, price }).subscribe({
    next: (updated) => {
      console.log('✅ Ažurirano:', updated);
      this.showAlert("Uspešno", "Materijal je uspešno sačuvan!");
    },
    error: (err) => {
      console.error('❌ Greška pri čuvanju:', err);
      this.showAlert("Greška", "Došlo je do greške pri čuvanju materijala.");
    }
  });
}



  showAlert(title: string, message: string) {
  this.dialog.open(AlertDialogComponent, {
    data: { title, message },
  });
}



addMaterial() {

  if (!this.newMaterial.name || this.newMaterial.name.trim().length < 1) {
    this.showAlert("Greška", "Naziv je obavezan (min 1 karakter).");
    return;
  }


  const exists = this.materials.some(
    m => m.name.trim().toLowerCase() === this.newMaterial.name.trim().toLowerCase()
  );

  if (exists) {
    this.showAlert("Greška", "Materijal sa ovim nazivom već postoji!");
    return;
  }

 
  if (!this.newMaterial.price || this.newMaterial.price <= 0) {
    this.showAlert("Greška", "Cena mora biti veća od 0.");
    return;
  }


  this.newMaterial.quantityAvailable = 999999999; 
  if (!this.newMaterial.unit) this.newMaterial.unit = "komad";

 
  this.materialService.add(this.newMaterial).subscribe(() => {
    this.loadMaterials();
    this.showAlert("Uspešno", "Materijal je dodat!");
    this.newMaterial = { name: '', quantityAvailable: 0, unit: '', price: 0 };
  });
}


}