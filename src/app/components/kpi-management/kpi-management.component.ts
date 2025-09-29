import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { Kpi } from 'src/app/modals/kpi.model';
import { StatisticsResponse } from 'src/app/modals/statistics.model';
import { HttpsCallsService } from 'src/app/services/https-calls.service';

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

  constructor(private httpsCallApi: HttpsCallsService,
    private fb: FormBuilder
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
        console.log('✅ KPI created successfully:', response);

        // Option A: Re-fetch from backend (recommended if API returns updated list)
        this.httpsCallApi.getKpiList().subscribe({
          next: (res) => {
            this.kpis = res;
            if (this.dt) {
              this.dt.reset(); // clears filters, sorting, pagination
            }
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


  // Close modal
  closeModal() {
    this.showModal = false;
    this.kpiForm.reset();
  }

}
