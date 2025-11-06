import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { KpiProfiles } from 'src/app/modals/kpi-profiles.model';
import { ManagerEmployees } from 'src/app/modals/manager-employee.model';
import { HttpsCallsService } from 'src/app/services/https-calls.service';
import { ToastService } from 'src/app/services/toaster.service';

interface OriginalValues {
  targetValue: number;
  actualValue: number;
}

interface KpiProfileView extends KpiProfiles {
  isEditing?: boolean;
  comment?: string;
  original?: OriginalValues;
}

@Component({
  selector: 'app-review-approve',
  templateUrl: './review-approve.component.html',
  styleUrls: ['./review-approve.component.css'],
})
export class ReviewApproveComponent {
  date : Date | null = null;
  employees: ManagerEmployees[] = [];
  selectedEmployee?: ManagerEmployees;
  kpiProfiles: KpiProfileView[] = [];
  reviewerId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
  superiorId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
  searchText = ''
  filteredEmployees = [...this.employees];

  constructor(
    private httpsCallApi: HttpsCallsService,
    private toaster: ToastService
  ) {}

  async ngOnInit(): Promise<void> {
    const managerId = '7a440c01-9cd6-45a4-aadd-2aed2943d01a';
    let employeeId = 'c69dcaff-2d1b-424b-9016-00ed4f1ad63e';

    try {
      this.employees = await firstValueFrom(
        this.httpsCallApi.getEmployeesByManager(managerId)
      );
      console.log('Employees loaded:', this.employees);
      this.filteredEmployees = this.employees; // This line added by sasidharan for the filter functionality
      this.selectedEmployee = this.employees[0];
      console.log('Selected employee:', this.selectedEmployee);
      employeeId = this.selectedEmployee.employeeId;

      const kpiData = await firstValueFrom(
        this.httpsCallApi.getEmployeeKpis(employeeId, 2025, 1)
      );
      console.log('Employee KPIs loaded:', kpiData);

      // Extend KPIs with view-only fields
      this.kpiProfiles = kpiData.map((kpi: KpiProfiles) => ({
        ...kpi,
        isEditing: false,
        comment: '',
        original: {
          targetValue: kpi.targetValue,
          actualValue: kpi.actualValue,
        },
      }));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  filterData(){
    const search = this.searchText.toLowerCase().trim();

    if(!search){
      this.filteredEmployees = [...this.employees];
      return;
    }

    this.filteredEmployees = this.employees.filter( emp => 
      emp.employeeName.toLowerCase().includes(search) ||
      emp.employeeCode.toLowerCase().includes(search) ||
      emp.gradeLevel.toLowerCase().includes(search)
    );

  }

  showKpiInfo(employee: ManagerEmployees): void {
    this.selectedEmployee = employee;
    console.log('Selected employee:', this.selectedEmployee);
    this.loadEmployeeKpis(this.selectedEmployee.employeeId);
  }

  loadEmployeeKpis(employeeId: string): void {
    this.httpsCallApi.getEmployeeKpis(employeeId, 2025, 1).subscribe({
      next: (data: KpiProfiles[]) => {
        this.kpiProfiles = data.map((kpi) => ({
          ...kpi,
          isEditing: false,
          comment: '',
          original: {
            targetValue: kpi.targetValue,
            actualValue: kpi.actualValue,
          },
        }));
        console.log('Employee KPIs:', this.kpiProfiles);
      },
      error: (err) => {
        console.error('Failed to fetch employee KPIs:', err);
      },
    });
  }

  /** Enable editing for a specific row */
  enableRowEdit(kpi: KpiProfileView): void {
    this.kpiProfiles.forEach((x) => (x.isEditing = false)); // disable others
    kpi.isEditing = true;
  }

  /** Approve all KPIs */
  async onApprove(): Promise<void> {
    try {
      const kpiActions = this.kpiProfiles.map((kpi) => {
        const actions: string[] = ['approve'];
        const original: OriginalValues = kpi.original ?? {
          targetValue: kpi.targetValue,
          actualValue: kpi.actualValue,
        };

        // Detect edit
        if (
          kpi.targetValue !== original.targetValue ||
          kpi.actualValue !== original.actualValue
        ) {
          actions.unshift('edit');
        }

        // Detect comment
        if (kpi.comment && kpi.comment.trim() !== '') {
          actions.unshift('comment');
        }

        // Rule: if multiple → empty actionType
        const actionType = actions.length === 1 ? actions[0] : '';

        return {
          kpiDataId: kpi.kpiId,
          actionType,
          actions,
          newTargetValue: kpi.targetValue,
          newActualValue: kpi.actualValue,
          comments: kpi.comment || '',
          editReason: kpi.comment || '',
        };
      });

      const payload = {
        reviewerId: this.reviewerId,
        kpiActions,
        forwardToSuperior: true,
        superiorId: this.superiorId,
      };

      console.log('📦 Final payload:', payload);

      // Example API call:
      // await firstValueFrom(this.httpsCallApi.submitReview(payload));
      // this.toaster.showSuccess('KPIs approved successfully!');
    } catch (error) {
      console.error('Error approving KPIs:', error);
      // this.toaster.showError('Failed to approve KPIs.');
    }
  }
}
