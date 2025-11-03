import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { KpiProfiles } from 'src/app/modals/kpi-profiles.model';
import { ManagerEmployees } from 'src/app/modals/manager-employee.model';
import { HttpsCallsService } from 'src/app/services/https-calls.service';
import { ToastService } from 'src/app/services/toaster.service';

@Component({
  selector: 'app-review-approve',
  templateUrl: './review-approve.component.html',
  styleUrls: ['./review-approve.component.css'],
  
})
export class ReviewApproveComponent {
  date : Date | null = null;
  employees: ManagerEmployees[] = [];
  selectedEmployee?: ManagerEmployees;
  kpiProfiles: KpiProfiles[] = [];
  monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  constructor(private httpsCallApi: HttpsCallsService,
      private toaster : ToastService
    ){}
  async ngOnInit(): Promise<void> {
      const managerId = '44444444-4444-4444-4444-444444444444';
      let employeeId = '11111111-1111-1111-1111-111111111111';
  
      try {
        this.employees = await firstValueFrom(this.httpsCallApi.getEmployeesByManager(managerId));
        console.log('Employees loaded:', this.employees);
        this.selectedEmployee = this.employees[0];
        console.log('Selected employee:', this.selectedEmployee);
        employeeId = this.selectedEmployee.employeeId
        this.kpiProfiles = await firstValueFrom(this.httpsCallApi.getEmployeeKpis(employeeId, 2025, 1));
        console.log('Employee KPIs loaded:', this.kpiProfiles);
        this.SelectingMonth();
      } catch (error) {
        console.error('Error loading data:', error);
      }
    }

  showKpiInfo(employee: ManagerEmployees){
    this.selectedEmployee = employee
    console.log('Selected employee:', this.selectedEmployee);
    this.loadEmployeeKpis(this.selectedEmployee.employeeId)
  }


  loadEmployeeKpis(employeeId: string): void {
    this.httpsCallApi.getEmployeeKpis(employeeId, 2025, 1).subscribe({
      next: (data) => {
        this.kpiProfiles = data;
        console.log('Employee KPIs:', data);
        this.SelectingMonth();
      },
      error: (err) => {
        console.error('Failed to fetch employee KPIs:', err);
      }
    });
  }


  SelectingMonth(){
    
     if (this.kpiProfiles && this.kpiProfiles.length > 0) {
      const firstKpi = this.kpiProfiles[0];
      // Create a date with the evaluation year and month (day doesn't matter for month view)
      this.date = new Date(firstKpi.evaluationYear, firstKpi.evaluationMonth - 1, 1);
      console.log('Calendar date set to:', this.date);
  }


  }
}
