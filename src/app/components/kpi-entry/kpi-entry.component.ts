import { Component, ElementRef, HostListener, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { EmployeeKpiSummary } from 'src/app/modals/employee-kpi-summary.model';
import { KpiProfiles } from 'src/app/modals/kpi-profiles.model';
import { KpiSubmission } from 'src/app/modals/kpi-submission.model';
import { LastApprovedReference } from 'src/app/modals/last-approved-reference.model';
import { ManagerEmployees } from 'src/app/modals/manager-employee.model';
import { MissingPeriod } from 'src/app/modals/month-picker.model';
import { HttpsCallsService } from 'src/app/services/https-calls.service';
import { ToastService } from 'src/app/services/toaster.service';
import { KpiSubmitResponse } from 'src/app/modals/kpi-submit-response';
@Component({
  selector: 'app-kpi-entry',
  templateUrl: './kpi-entry.component.html',
  styleUrls: ['./kpi-entry.component.css']
})
export class KpiEntryComponent {
  
  isOpen = false;
  toggleState = false;
  employees: ManagerEmployees[] = [];
  filteredEmployees: ManagerEmployees[] = [];
  kpiProfiles: KpiProfiles[] = [];
  selectedEmployee?: ManagerEmployees;
  selfRate: boolean = false;
  searchTerm: string = '';
  evalutionYear: number = 2025
  evalutionMonth : number = 1
  summary!: EmployeeKpiSummary;
  lastApprovedReference!: LastApprovedReference;
   periods: MissingPeriod[] = [];
  selectedPeriod?: MissingPeriod;
   private employeeId = 'c69dcaff-2d1b-424b-9016-00ed4f1ad63e';
  private startYear = 2025;
  private startMonth = 9;
  isSubmitted :boolean = false;
  monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

  @ViewChild('userBox') userBox!: ElementRef;
  @ViewChildren('targetInput') targetInputs!: QueryList<ElementRef>;
  @ViewChildren('actualInput') actualInputs!: QueryList<ElementRef>;


  constructor(private httpsCallApi: HttpsCallsService,
    private toaster : ToastService
  ){}

  async ngOnInit(): Promise<void> {
    let employeeId = this.employeeId

    try {
      // this.employees = await firstValueFrom(this.httpsCallApi.getEmployeesByManager(managerId));
      // console.log('Employees loaded:', this.employees);
      // this.selectedEmployee = this.employees[0];
      // console.log('Selected employee:', this.selectedEmployee);
      // employeeId = this.selectedEmployee.employeeId

      this.periods = await firstValueFrom(this.httpsCallApi.getMissingSelfPeriods(employeeId, this.startYear, this.startMonth));
      this.selectedPeriod = this.periods[this.periods.length-1]
      const year = this.selectedPeriod?.evaluationYear;
      const month = this.selectedPeriod?.evaluationMonth;
      this.kpiProfiles = await firstValueFrom(this.httpsCallApi.getEmployeeKpis(employeeId, year, month));
      this.summary = await firstValueFrom(this.httpsCallApi.getEmployeeCurrentSummary(employeeId, 2025, 1));
      if (this.kpiProfiles.every(e => e.entryStatus === 'submitted')) {
        this.isSubmitted = true;
      } else {
        this.isSubmitted = false;
      }
      this.lastApprovedReference = await firstValueFrom(this.httpsCallApi.getLastApprovedReference(employeeId, 2025, 1));
      this.getSummary(employeeId, year, month);
    console.log('Employee KPIs loaded:', this.kpiProfiles);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

getLastApprovedReference(employeeId: string, year: number, month: number){
  this.httpsCallApi.getLastApprovedReference(employeeId, year, month).subscribe({
      next: (res) => {
        this.lastApprovedReference = res;
        console.log('Employee  Last Approved Reference:', this.summary);
      },
      error: (err) => {
        console.error('Error fetching  Last Approved Reference:', err); 
      }
    });

}
getSummary(employeeId: string, year:number, month:number){
  this.httpsCallApi.getEmployeeCurrentSummary(employeeId, year, month).subscribe({
      next: (res) => {
        this.summary = res;
        console.log('Employee KPI Summary:', this.summary);
      },
      error: (err) => {
        console.error('Error fetching KPI summary:', err);
      }
    });

}


fetchPeriods(): void {
  this.httpsCallApi
    .getMissingSelfPeriods(this.employeeId, 2025, 7)
    .subscribe({
      next: (res) => (this.periods = res),
      error: (err) => console.error('Error fetching periods:', err)
    });
  }

  onPeriodSelect(event: any) {
    console.log('Selected Period:', this.selectedPeriod);
    this.getSummary(this.employeeId, this.selectedPeriod?.evaluationYear, this.selectedPeriod?.evaluationMonth)
    this.getLastApprovedReference(this.employeeId, this.selectedPeriod?.evaluationYear, this.selectedPeriod?.evaluationMonth)
    this.loadEmployeeKpis(this.employeeId, this.selectedPeriod?.evaluationYear, this.selectedPeriod?.evaluationMonth)
  }

  getMonthName(month: number): string {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames[month - 1] || '';
  }

  // getEmployeesByManager(managerId: string){
  //   this.httpsCallApi.getEmployeesByManager(managerId).subscribe({
  //       next: (data) => {
  //         (this.employees = data)
  //         console.log("MANAGER'S EMployees", this.employees)
  //       },
  //       error: (err) => {console.error('Failed to load employees:', err)}
  //     });
  // }

  loadEmployeeKpis(employeeId: string, year:number, month:number): void {
    this.httpsCallApi.getEmployeeKpis(employeeId, year, month).subscribe({
      next: (data) => {
        this.kpiProfiles = data;
        console.log('Employee KPIs:', data);

         // Check if all KPIs are submitted
      if (this.kpiProfiles.every(e => e.entryStatus === 'submitted')) {
        this.isSubmitted = true;
      } else {
        this.isSubmitted = false;
      }
      },
      error: (err) => {
        console.error('Failed to fetch employee KPIs:', err);
      }
    });
  }

  // onToggle(event: Event): void {
  //   const inputElement = event.target as HTMLInputElement;
  //   this.toggleState = inputElement.checked;

  //   if (this.toggleState) {
      
  //     this.selfRate = true
  //     console.log('SELF RATE ON', this.selfRate);
  //     const managerId = '7a440c01-9cd6-45a4-aadd-2aed2943d01a';
  //     this.loadEmployeeKpis(managerId)
  //   } else {
  //     this.selfRate = false
  //     console.log('SELF RATE OFF', this.selfRate);
  //     this.selectedEmployee = this.employees[0];
  //     const employeeId = this.selectedEmployee.employeeId
  //     this.loadEmployeeKpis(employeeId)
      
  //   }
  // }

  // toggleDropdown() {
  //   this.isOpen = !this.isOpen;
  // }

  // selectEmployee(emp: ManagerEmployees) {
  //   console.log('Selected employee:', emp);
  //   this.selectedEmployee = emp;
  //   this.isOpen = false;
  //   this.searchTerm = '';
  //   // Trigger other data loads
  //   this.loadEmployeeKpis(emp.employeeId);
  //   this.getSummary(emp.employeeId, 2025,1);
  //   this.getLastApprovedReference(emp.employeeId, 2025, 1)
  // }

  // filterEmployees(){
  //   const term = this.searchTerm.toLowerCase();
    
  //   return this.filteredEmployees = this.employees.filter( emp =>
  //     emp.employeeName.toLowerCase().includes(term) ||
  //     emp.employeeCode.toLowerCase().includes(term)
  //   );
  // }

  // @HostListener('document:click', ['$event'])
  // onClickOutside(event: MouseEvent) {
  //   if (this.userBox && !this.userBox.nativeElement.contains(event.target)) {
  //     this.isOpen = false;
  //   }
  // }

  submitKpiEvaluation(opType: string): void {
    const employeeId = this.employeeId
    const evaluationYear = this.selectedPeriod?.evaluationYear
    const evaluationMonth = this.selectedPeriod?.evaluationMonth
    let operationType: number;
    if (this.selfRate)
    {
      if (opType === 'draft')
      {
        operationType = 1;
      }
      else
        {
        operationType = 2;
      }
      
    }
    else
    {
      if (opType === 'draft')
      {
        operationType = 3;
      }
      else
        {
        operationType = 4;
      }
    }

    const payload: {
  employeeId: string;
  evaluationYear: number;
  evaluationMonth: number;
  enteredBy: string;
  kpiData: KpiSubmission[];
  operationType: number;
} = {
  employeeId: employeeId,
  evaluationYear: evaluationYear,
  evaluationMonth: evaluationMonth,
  enteredBy: employeeId,
  kpiData: [],
  operationType: operationType
};

    this.kpiProfiles.forEach((kpi, index) => {
      const target = Number(this.targetInputs.toArray()[index].nativeElement.value);
      const actual = Number(this.actualInputs.toArray()[index].nativeElement.value);

      payload.kpiData.push({
        kpiId: kpi.kpiId,
        targetValue: target,
        actualValue: actual
      });
    });

    console.log('Submit Payload:', payload);

    // Call the service
    this.httpsCallApi.submitUnifiedKpi(payload).subscribe({
      next: (res :KpiSubmitResponse) => {
        console.log('Submit response:', res);
        if(res.success === true){
          if(opType === 'submit'){
            this.toaster.show('Kpi entry entered successfully', "success", 'KPI Submitted');
            this.isSubmitted = true;
            this.getSummary(this.employeeId, this.selectedPeriod?.evaluationYear, this.selectedPeriod?.evaluationMonth)
            this.getLastApprovedReference(this.employeeId, this.selectedPeriod?.evaluationYear, this.selectedPeriod?.evaluationMonth)
            this.loadEmployeeKpis(this.employeeId, this.selectedPeriod?.evaluationYear, this.selectedPeriod?.evaluationMonth)
          }
          if(opType === 'draft'){
            this.toaster.show('Kpi entry saved successfuly to drafts', "success", 'Saved to Drafts');
          }
        }else {
          this.toaster.show('Kpi entries are already Submitted', 'info', 'Already Submitted')
        }
        // this.targetInputs.forEach(input => input.nativeElement.value = '');
        // this.actualInputs.forEach(input => input.nativeElement.value = '');
      },
      error: (err) => {
        console.error('Submit error:', err);
        // Handle error
      }
    });
  }
  

}
