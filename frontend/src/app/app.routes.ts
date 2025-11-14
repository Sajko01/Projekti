import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PlanningComponent } from './planning/planning.component';
import { TasksComponent } from './tasks/tasks.component';
import { WorkersComponent } from './workers/workers.component';
import { MachinesComponent } from './machines/machines.component';
import { MethodsComponent } from './methods/methods.component';
import { CrisisPlansComponent } from './crisis-plans/crisis-plans.component';

import { ReportsComponent } from './reports/reports.component';
import { MaterialComponent } from './materials/materials.component';
import {  BudgetsComponent } from './budget/budget.component';


export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'planning', component: PlanningComponent },
  { path: 'tasks', component: TasksComponent },
  { path: 'workers', component: WorkersComponent },
  { path: 'machines', component: MachinesComponent },
  { path: 'methods', component: MethodsComponent },
  { path: 'materials', component: MaterialComponent },
  { path: 'budgets', component: BudgetsComponent },
  { path: 'crisis-plans', component: CrisisPlansComponent },
  { path: 'reports', component: ReportsComponent },
];
