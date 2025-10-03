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
import { ToasterComponent } from './components/toaster/toaster.component';
import { HttpClientModule } from '@angular/common/http'; // 👈 Add this import
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { OverlayPanelModule } from 'primeng/overlaypanel';
// PrimeNG modules
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { RippleModule } from 'primeng/ripple';





@NgModule({
  declarations: [
    AppComponent,
    TopNavBarComponent,
    TopHeaderBarComponent,
    DashboardComponent,
    KpiManagementComponent,
    KpiEntryComponent,
    PerformanceProfilesComponent,
    ToasterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    RippleModule,
     OverlayPanelModule,  
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
