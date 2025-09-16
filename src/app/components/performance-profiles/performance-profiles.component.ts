import { Component } from '@angular/core';

@Component({
  selector: 'app-performance-profiles',
  templateUrl: './performance-profiles.component.html',
  styleUrls: ['./performance-profiles.component.css']
})
export class PerformanceProfilesComponent {


  kpis: any[] = [
    {
      id: '1',
      name: 'Quality Score',
      minScore: 0,
      maxScore: 100,
      qualificationCriteria: 80,
      weightage: 25
    },
    {
      id: '2',
      name: 'Attendance',
      minScore: 0,
      maxScore: 100,
      qualificationCriteria: 80,
      weightage: 25
    },
    {
      id: '3',
      name: 'Production',
      minScore: 0,
      maxScore: 100,
      qualificationCriteria: 80,
      weightage: 25
    },
    {
      id: '4',
      name: 'Production',
      minScore: 0,
      maxScore: 100,
      qualificationCriteria: 80,
      weightage: 25
    }
  ];



  showCreateProfile = false;

  profile = {
    name: '',
    description: '',
    level: '',
    basePay: '',
    status: 'Active',
    kpis: [] as any[]
  };

  newKpi: any = { name: '', min: 0, max: 100, criteria: 80, weight: '25%' };

  openModal() { this.showCreateProfile = true; }
  closeModal() { this.showCreateProfile = false; }

  addKpi() {
    if (this.newKpi.name) {
      this.profile.kpis.push({ ...this.newKpi });
      this.newKpi = { name: '', min: 0, max: 100, criteria: 80, weight: '25%' };
    }
  }
  removeKpi(i: number) { this.profile.kpis.splice(i,1); }

  calcTotal(): number {
    let total = 0;
    this.profile.kpis.forEach(k => {
      let val = parseFloat(k.weight);
      if (!isNaN(val)) total += val;
    });
    return total;
  }

  onCreateProfile() {
    console.log("New Profile Created:", this.profile);
    this.closeModal();
  }

}
