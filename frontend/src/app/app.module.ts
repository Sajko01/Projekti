import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { TopbarComponent } from './core/topbar/topbar.component';
import { SidebarComponent } from './core/sidebar/sidebar.component';
import { routes } from './app.routes';
import { RouterModule } from '@angular/router';
import { DashboardModule } from './dashboard/dashboard.module';
import { MethodsModule } from './methods/methods.module';
import { MaterialModule } from './materials/materials.module';
import { CrisisPlansModule } from './crisis-plans/crisis-plans.module';
import { MachinesModule } from './machines/machines.module';
import { WorkersModule } from './workers/workers.module';
import { BudgetsModule } from './budget/budget.module';
import { TasksModule } from './tasks/tasks.module';
import { PlanningModule } from './planning/planning.module';
import { ReportsModule } from './reports/reports.module';



@NgModule({
  declarations: [
    AppComponent,
    TopbarComponent,
    SidebarComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    RouterModule.forRoot(routes), 
    DashboardModule,
    MethodsModule,
    MaterialModule,
    CrisisPlansModule,
    MachinesModule,
    WorkersModule,
    BudgetsModule,
    TasksModule,
    PlanningModule,
    ReportsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

