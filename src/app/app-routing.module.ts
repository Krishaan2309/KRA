import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { KpiEntryComponent } from './components/kpi-entry/kpi-entry.component';
import { KpiManagementComponent } from './components/kpi-management/kpi-management.component';
import { PerformanceProfilesComponent } from './components/performance-profiles/performance-profiles.component';

const routes: Routes = [
  {path:'', redirectTo:'/dashboard', pathMatch:'full'},
  {path:'dashboard', component:DashboardComponent},
  {path:'kpi-entry', component:KpiEntryComponent},
  {path:'kpi-management', component:KpiManagementComponent},
  {path:'performance-profiles', component:PerformanceProfilesComponent},
  { path: '**', redirectTo: '/dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
