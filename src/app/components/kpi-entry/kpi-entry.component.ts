import { Component, ElementRef, HostListener, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { EmployeeKpiSummary } from 'src/app/modals/employee-kpi-summary.model';
import { KpiProfiles } from 'src/app/modals/kpi-profiles.model';
import { KpiSubmission } from 'src/app/modals/kpi-submission.model';
import { LastApprovedReference } from 'src/app/modals/last-approved-reference.model';
import { ManagerEmployees } from 'src/app/modals/manager-employee.model';
import { HttpsCallsService } from 'src/app/services/https-calls.service';
import { ToastService } from 'src/app/services/toaster.service';

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

  @ViewChild('userBox') userBox!: ElementRef;
  @ViewChildren('targetInput') targetInputs!: QueryList<ElementRef>;
  @ViewChildren('actualInput') actualInputs!: QueryList<ElementRef>;


  constructor(private httpsCallApi: HttpsCallsService,
    private toaster : ToastService
  ){}

  async ngOnInit(): Promise<void> {
    const managerId = '55555555-5555-5555-5555-555555555555';
    let employeeId = '11111111-1111-1111-1111-111111111111';

    try {
      this.employees = await firstValueFrom(this.httpsCallApi.getEmployeesByManager(managerId));
      console.log('Employees loaded:', this.employees);
      this.selectedEmployee = this.employees[0];
      console.log('Selected employee:', this.selectedEmployee);
      employeeId = this.selectedEmployee.employeeId
      this.kpiProfiles = await firstValueFrom(this.httpsCallApi.getEmployeeKpis(employeeId, 2025, 1));
      this.summary = await firstValueFrom(this.httpsCallApi.getEmployeeCurrentSummary(employeeId, 2025, 1));
      this.lastApprovedReference = await firstValueFrom(this.httpsCallApi.getLastApprovedReference(employeeId, 2025, 1));

    console.log('Employee KPIs loaded:', this.kpiProfiles);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

getLastApprovedReference(employeeId: string, currentYear: number, currentMonth: number){
  this.httpsCallApi.getLastApprovedReference(employeeId, currentYear, currentMonth).subscribe({
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

  getEmployeesByManager(managerId: string){
    this.httpsCallApi.getEmployeesByManager(managerId).subscribe({
        next: (data) => {
          (this.employees = data)
          console.log("MANAGER'S EMployees", this.employees)
        },
        error: (err) => {console.error('Failed to load employees:', err)}
      });
  }

  loadEmployeeKpis(employeeId: string): void {
    this.httpsCallApi.getEmployeeKpis(employeeId, 2025, 1).subscribe({
      next: (data) => {
        this.kpiProfiles = data;
        console.log('Employee KPIs:', data);
      },
      error: (err) => {
        console.error('Failed to fetch employee KPIs:', err);
      }
    });
  }

  onToggle(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.toggleState = inputElement.checked;

    if (this.toggleState) {
      
      this.selfRate = true
      console.log('SELF RATE ON', this.selfRate);
      const managerId = '55555555-5555-5555-5555-555555555555';
      this.loadEmployeeKpis(managerId)
    } else {
      this.selfRate = false
      console.log('SELF RATE OFF', this.selfRate);
      this.selectedEmployee = this.employees[0];
      const employeeId = this.selectedEmployee.employeeId
      this.loadEmployeeKpis(employeeId)
      
    }
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  selectEmployee(emp: ManagerEmployees) {
    console.log('Selected employee:', emp);
    this.selectedEmployee = emp;
    this.isOpen = false;
    this.searchTerm = '';
    // Trigger other data loads
    this.loadEmployeeKpis(emp.employeeId);
    this.getSummary(emp.employeeId, 2025,1);
    this.getLastApprovedReference(emp.employeeId, 2025, 1)
  }

  filterEmployees(){
    const term = this.searchTerm.toLowerCase();
    
    return this.filteredEmployees = this.employees.filter( emp =>
      emp.employeeName.toLowerCase().includes(term) ||
      emp.employeeCode.toLowerCase().includes(term)
    );
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (this.userBox && !this.userBox.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  submitKpiEvaluation(opType: string): void {
    const employeeId = this.selectedEmployee.employeeId
    const managerId = this.selectedEmployee.employeeId
    const evaluationYear = this.evalutionYear
    const evaluationMonth = this.evalutionMonth
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
  enteredBy: managerId,
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
      next: (res) => {
        console.log('Submit response:', res);
        if(opType === 'submit'){
          this.toaster.show('Kpi entry entered successfully', "success", 'KPI Submitted');
        }
        if(opType === 'draft'){
          this.toaster.show('Kpi entry saved successfuly to drafts', "success", 'Saved to Drafts');
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
