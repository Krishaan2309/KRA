import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { KpiEntryComponent } from './components/kpi-entry/kpi-entry.component';
import { KpiManagementComponent } from './components/kpi-management/kpi-management.component';
import { PerformanceProfilesComponent } from './components/performance-profiles/performance-profiles.component';
import { ReviewApproveComponent } from './components/review-approve/review-approve.component';
import { LoginComponent } from './components/login/login.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {path:'login', component:LoginComponent},
  {path:'dashboard', component:DashboardComponent},
  {path:'kpi-entry', component:KpiEntryComponent},
  {path:'kpi-management', component:KpiManagementComponent},
  {path:'performance-profiles', component:PerformanceProfilesComponent},
  {path:'review-aprrove', component:ReviewApproveComponent},
  { path: '**', redirectTo: '/dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
