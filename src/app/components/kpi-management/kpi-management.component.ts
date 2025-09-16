import { Component } from '@angular/core';

@Component({
  selector: 'app-kpi-management',
  templateUrl: './kpi-management.component.html',
  styleUrls: ['./kpi-management.component.css']
})
export class KpiManagementComponent {
  showModal = false;

  newKpi = {
    name: '',
    code: '',
    category: '',
    description: '',
    formula: '',
    unit: ''
  };

  // Open modal
  openModal() {
    this.showModal = true;
  }

  // Close modal
  closeModal() {
    this.showModal = false;
    this.resetForm();
  }

  // Reset form
  resetForm() {
    this.newKpi = {
      name: '',
      code: '',
      category: '',
      description: '',
      formula: '',
      unit: ''
    };
  }

  // Handle submit
  createKpi() {
    if (this.newKpi.name && this.newKpi.code && this.newKpi.category) {
      console.log('New KPI created:', this.newKpi);
      this.closeModal();
    } else {
      alert('Please fill all required fields');
    }
  }

}
