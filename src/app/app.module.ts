import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';   // 👈 add this
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TopNavBarComponent } from './components/top-nav-bar/top-nav-bar.component';
import { TopHeaderBarComponent } from './components/top-header-bar/top-header-bar.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { KpiManagementComponent } from './components/kpi-management/kpi-management.component';
import { KpiEntryComponent } from './components/kpi-entry/kpi-entry.component';
import { PerformanceProfilesComponent } from './components/performance-profiles/performance-profiles.component';

@NgModule({
  declarations: [
    AppComponent,
    TopNavBarComponent,
    TopHeaderBarComponent,
    DashboardComponent,
    KpiManagementComponent,
    KpiEntryComponent,
    PerformanceProfilesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
