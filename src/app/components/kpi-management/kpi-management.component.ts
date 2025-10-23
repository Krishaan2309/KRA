import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { Kpi , KpiPayload} from 'src/app/modals/kpi.model';
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
  isEditMode: boolean = false;
  selectedKpi: Kpi | null = null; // Use your actual KPI type if defined

   formulaOptions = [
      { label: 'HIGHER_IS_BETTER', value: 'higher' },
      { label: 'LOWER_IS_BETTER', value: 'lower' },
      { label: 'EQUAL_TO_TARGET', value: 'equal' }
    ];

    measurementUnitOptions = [
      { label: 'Cliams', value: 'claims'},
      { label: 'Days' , value: 'days'}
    ];

  selectedCategory: string = '';
  selectedFormula: string = '';

  constructor(private httpsCallApi: HttpsCallsService,
    private fb: FormBuilder,
    private toaster : ToastService
  ){
    this.kpiForm = this.fb.group({
      kpiName: ['', Validators.required],
      // kpiCode: ['', Validators.required],
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
  this.selectedActions[kpi.id] = option.id;
  
  if (option.id === 'edit') {
    this.onEdit(kpi);
  } else if (option.id === 'delete') {
    this.onDelete(kpi);
  }
}

isActionSelected(option: any, kpi: Kpi): boolean {
  return this.selectedActions[kpi.id] === option.id;
}


  isInvalid(controlName: string): boolean {
    const control = this.kpiForm.get(controlName);
    return !!(control && control.invalid && control.touched);
  }

  ngOnInit(): void {
    this.httpsCallApi.getStatistics().subscribe({
      next: (res) => {
        this.stats = res;
      },
      error: (err) => {
        console.error('Error fetching statistics', err);
      }
    });
   this.httpsCallApi.getKpiMaster().subscribe({
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
    this.isEditMode = false;
    this.showModal = true;
    this.selectedKpi = null;
    // this.kpiForm.reset();
  }

  submitKpi() {
    if (this.isEditMode) {
      this.updateKpi();
    } else {
      this.createKpi();
    }
  }

  createKpi() {
    if (this.kpiForm.valid) {
      const formValues = this.kpiForm.value;

      // Map form fields → API payload
      const payload = {
        kpiName: formValues.kpiName,
        kpiCode: formValues.kpiCode || null,
        kpiDescription: formValues.kpiDescription,
        kpiCategory: formValues.kpiCategory || '',
        measurementUnit: formValues.measurementUnit,
        formulaCode: formValues.formulaCode.toLowerCase() || '',
        isActive: true
      };

      this.httpsCallApi.createKpi(payload).subscribe({
        next: (response) => {
          

          // Option A: Re-fetch from backend (recommended if API returns updated list)
          this.httpsCallApi.getKpiMaster().subscribe({
            next: (res) => {
              this.kpis = res;
              if (this.dt) {
                this.dt.reset(); // clears filters, sorting, pagination
              }
              console.log('✅ KPI created successfully:', response);
              this.toaster.show('The kpi is successfully created', "success", 'KPI Created');
            },
            error: (err) => {
              console.error('❌ Error refreshing KPI list:', err);
              this.toaster.show('The Kpi is Failed to Create', 'error', 'KPI Not Created')
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

  validateCategory(category: string): string {
    const validCategories = ['Operational', 'Quality', 'Finance'];
    return validCategories.includes(category) ? category : '';
  }

  validateFormulaCode(code: string): string {
    const validCodes = ['higher', 'lower', 'equal'];
    return validCodes.includes(code) ? code : '';
  }



  onEdit(kpi: Kpi) {
  console.log('Edit KPI:', kpi);

  this.isEditMode = true;
  this.selectedKpi = kpi;

  this.kpiForm.patchValue({
    kpiName: kpi.kpiName,
    kpiCode: kpi.kpiCode || null,
    kpiDescription: kpi.kpiDescription,
    kpiCategory: kpi.kpiCategory || '',
    measurementUnit: kpi.measurementUnit,
    formulaCode: kpi.formulaCode || ''
  });

  this.showModal = true;
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


updateKpi() {
  if (this.kpiForm.valid && this.selectedKpi) {
    const formValues = this.kpiForm.value;

    const payload = {
      kpiName: formValues.kpiName,
      kpiCode: formValues.kpiCode || null,
      kpiDescription: formValues.kpiDescription,
      kpiCategory: formValues.kpiCategory,
      measurementUnit: formValues.measurementUnit,
      formulaCode: formValues.formulaCode.toLowerCase(),
      isActive: true
    };

    this.httpsCallApi.updateKpi(this.selectedKpi.id, payload).subscribe({
      next: (res) => {
        this.httpsCallApi.getKpiMaster().subscribe({
          next: (res) => {
            this.kpis = res;
            if (this.dt) {
              this.dt.reset();
            }
            this.toaster.show('KPI updated successfully', 'success', 'KPI Updated');
          },
          error: (err) => {
            this.toaster.show('Failed to refresh KPI list', 'error', 'Error');
            console.error('❌ Error refreshing KPI list:', err);
          }
        });
        this.closeModal();
      },
      error: (err) => {
        this.toaster.show('Failed to update KPI', 'error', 'Update Failed');
        console.error('❌ Error updating KPI:', err);
      }
    });
  } else {
    this.kpiForm.markAllAsTouched();
  }
}

}
