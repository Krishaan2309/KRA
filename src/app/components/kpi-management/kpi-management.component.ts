import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { Kpi } from 'src/app/modals/kpi.model';
import { StatisticsResponse } from 'src/app/modals/statistics.model';
import { HttpsCallsService } from 'src/app/services/https-calls.service';
import { ToastService } from 'src/app/services/toaster.service';

@Component({
  selector: 'app-kpi-management',
  templateUrl: './kpi-management.component.html',
  styleUrls: ['./kpi-management.component.css']
})
export class KpiManagementComponent {
  stats?: StatisticsResponse;
  kpis: Kpi[] = [];
  showModal = false;
  kpiForm: FormGroup;
  @ViewChild('dt') dt!: Table;
  rows: number = 5; // default

   formulaOptions = [
  { label: 'HIGHER_IS_BETTER', value: 'higher' },
  { label: 'LOWER_IS_BETTER', value: 'lower' },
  { label: 'EQUAL_TO_TARGET', value: 'equal' }
];


  selectedCategory: string = '';
  selectedFormula: string = '';

  constructor(private httpsCallApi: HttpsCallsService,
    private fb: FormBuilder,
    private toaster : ToastService
  ){
    this.kpiForm = this.fb.group({
      kpiName: ['', Validators.required],
      kpiCode: ['', Validators.required],
      kpiCategory: ['', Validators.required],
      kpiDescription: ['', Validators.required],
      formulaCode: ['', Validators.required],
      measurementUnit: ['', Validators.required],
    });
  }
selectedActions: { [key: string]: string } = {}; // Track selected action per KPI

actionOptions = [
  {
    id: 'edit',
    label: 'Edit',
    value: 'edit'
  },
  {
    id: 'delete',
    label: 'Delete',
    value: 'delete'
  }
];

// Add these methods to your component class
selectAction(option: any, kpi: Kpi) {
  this.selectedActions[kpi.kpiCode] = option.id;
  
  if (option.id === 'edit') {
    this.onEdit(kpi);
  } else if (option.id === 'delete') {
    this.onDelete(kpi);
  }
}

isActionSelected(option: any, kpi: Kpi): boolean {
  return this.selectedActions[kpi.kpiCode] === option.id;
}


  isInvalid(controlName: string): boolean {
    const control = this.kpiForm.get(controlName);
    return !!(control && control.invalid && control.touched);
  }

  ngOnInit(): void {
    this.httpsCallApi.getStatistics().subscribe({
      next: (res) => {
        this.stats = res;
        // console.log(this.stats)
      },
      error: (err) => {
        console.error('Error fetching statistics', err);
      }
    });
   this.httpsCallApi.getKpiList().subscribe({
      next: (res) => {
        this.kpis = res;
        console.log(this.kpis)
      },
      error: (err) => {
        console.error('Error fetching KPI list:', err);
      }
    });


  }

  applyGlobalFilter(event: Event, mode: string) {
    const input = event.target as HTMLInputElement;
    this.dt.filterGlobal(input.value, mode);
  }


  // Open modal
  openModal() {
    this.showModal = true;
  }


createKpi() {
  if (this.kpiForm.valid) {
    const formValues = this.kpiForm.value;

    // Map form fields → API payload
    const payload = {
      kpiName: formValues.kpiName,
      kpiCode: formValues.kpiCode,
      kpiCategory: formValues.kpiCategory,
      measurementUnit: formValues.measurementUnit,
      formulaCode: formValues.formulaCode.toLowerCase(),
      isActive: true
    };

    this.httpsCallApi.createKpi(payload).subscribe({
      next: (response) => {
        

        // Option A: Re-fetch from backend (recommended if API returns updated list)
        this.httpsCallApi.getKpiList().subscribe({
          next: (res) => {
            this.kpis = res;
            if (this.dt) {
              this.dt.reset(); // clears filters, sorting, pagination
            }
            console.log('✅ KPI created successfully:', response);
            this.toaster.show('the kpi is successfully created', "success", 'KPI Created');
          },
          error: (err) => {
            console.error('❌ Error refreshing KPI list:', err);
          }
        });

        // Close modal & reset form
        this.closeModal();
      },
      error: (err) => {
        console.error('❌ Error creating KPI:', err);
      }
    });
    
  } else {
    this.kpiForm.markAllAsTouched();
  }
}


onEdit(kpi: Kpi) {
  console.log('Edit KPI:', kpi);
  // Implement your edit logic here
  // Example: Open modal with pre-filled data
  // this.kpiForm.patchValue({
  //   kpiName: kpi.kpiName,
  //   kpiCode: kpi.kpiCode,
  //   kpiCategory: kpi.kpiCategory,
  //   measurementUnit: kpi.measurementUnit,
  //   formulaCode: kpi.formulaCode
  // });
  // this.showModal = true;
}

onDelete(kpi: Kpi) {
  console.log('Delete KPI:', kpi);
  // Implement your delete logic here
  // Example: Show confirmation dialog and call delete API
  // if (confirm(`Are you sure you want to delete ${kpi.kpiName}?`)) {
  //   this.httpsCallApi.deleteKpi(kpi.kpiCode).subscribe({
  //     next: () => {
  //       this.toaster.show('KPI deleted successfully', 'success', 'KPI Deleted');
  //       this.ngOnInit(); // Refresh the list
  //     },
  //     error: (err) => {
  //       console.error('Error deleting KPI:', err);
  //       this.toaster.show('Failed to delete KPI', 'error', 'Error');
  //     }
  //   });
  // }
}

  // Close modal
  closeModal() {
    this.showModal = false;
    this.kpiForm.reset();
  }

}
