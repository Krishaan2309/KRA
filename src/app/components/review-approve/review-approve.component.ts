import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { EvaluationSummary } from 'src/app/modals/evaluation-summary.model';
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
  periods: EvaluationSummary[] = [];
  selectedPeriod?: EvaluationSummary;
  managerId = '7a440c01-9cd6-45a4-aadd-2aed2943d01a';
  employeeId = '7a440c01-9cd6-45a4-aadd-2aed2943d01a';
  filteredEmployees = [] // this line is added by sasidharan for filter functionality
  searchText = ''; // this line is added by sasidharan for filter functionality
  isOpened = false;

  constructor(
    private httpsCallApi: HttpsCallsService,
    private toaster: ToastService
  ) {}
 
  async ngOnInit(): Promise<void> {
    // this.managerId = this.managerId
    // this.employeeId = this.employeeId
 
    try {
 
      this.periods = await firstValueFrom(this.httpsCallApi.getUnreviewedPeriods(this.managerId, 2025, 10));
      this.selectedPeriod = this.periods[this.periods.length-1]
 
      this.employees = await firstValueFrom(
        this.httpsCallApi.getEmployeesByManager(this.managerId)
      );
      console.log('Employees loaded:', this.employees);
      this.filteredEmployees = this.employees
      this.selectedEmployee = this.employees[0];  
      console.log('Selected employee:', this.selectedEmployee);
      this.employeeId = this.selectedEmployee.employeeId;

      const year = this.selectedPeriod?.evaluationYear;
      const month = this.selectedPeriod?.evaluationMonth;
      const kpiData = await firstValueFrom(
        this.httpsCallApi.getEmployeeKpis(this.employeeId, year, month)
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
 
  showKpiInfo(employee: ManagerEmployees): void {
    this.selectedEmployee = employee;
    console.log('Selected employee:', this.selectedEmployee);
    const year = this.selectedPeriod?.evaluationYear
    const month = this.selectedPeriod?.evaluationMonth
    this.loadEmployeeKpis(this.selectedEmployee.employeeId, year, month);
  }
 
  loadEmployeeKpis(employeeId: string, evaluationYear: number, evaluationMonth:number): void {
    this.httpsCallApi.getEmployeeKpis(employeeId, evaluationYear, evaluationMonth).subscribe({
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
          kpiDataId: kpi.id,
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
 
      const response = await firstValueFrom(this.httpsCallApi.reviewUnifiedKpi(payload));

      console.log('✅ API Response:', response);
      this.toaster.show('KPIs approved successfully!');
      // Example API call:
      // await firstValueFrom(this.httpsCallApi.submitReview(payload));
      // this.toaster.showSuccess('KPIs approved successfully!');
    } catch (error) {
      console.error('Error approving KPIs:', error);
      // this.toaster.showError('Failed to approve KPIs.');
    }
  }
 
 filterData(){ // this function is added by sasidharan for filter functionality
    const search = this.searchText.toLowerCase().trim();

    if(!search){
      this.filteredEmployees = [...this.employees];
      return
    }

    this.filteredEmployees = this.employees.filter(emp =>
      emp.employeeName?.toLowerCase().includes(search) ||
      emp.employeeCode?.toLowerCase().includes(search) ||
      emp.gradeLevel?.toLowerCase().includes(search)
    );

 }
 
  onPeriodSelect(event: any) {
    console.log('Selected Period:', this.selectedPeriod);
    // this.getSummary(this.employeeId, this.selectedPeriod?.evaluationYear, this.selectedPeriod?.evaluationMonth)
    // this.getLastApprovedReference(this.employeeId, this.selectedPeriod?.evaluationYear, this.selectedPeriod?.evaluationMonth)
    this.loadEmployeeKpis(this.selectedEmployee?.employeeId, this.selectedPeriod?.evaluationYear, this.selectedPeriod?.evaluationMonth)
  }
  
  toggleDropdown(){
    this.isOpened = !this.isOpened;
  }
 
  getMonthName(month: number): string {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames[month - 1] || '';
  }
}