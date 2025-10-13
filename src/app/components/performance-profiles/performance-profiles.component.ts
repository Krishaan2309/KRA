import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Table } from 'primeng/table';
import { HttpsCallsService } from 'src/app/services/https-calls.service';
import { PerformanceProfile } from 'src/app/modals/performance-profile.model';
import { Kpi } from 'src/app/modals/kpi.model';
import { Department } from 'src/app/modals/department.model';
import { Grade } from 'src/app/modals/grade.model';
import { OverlayPanel } from 'primeng/overlaypanel';
import { ToastService } from 'src/app/services/toaster.service';

@Component({
  selector: 'app-performance-profiles',
  templateUrl: './performance-profiles.component.html',
  styleUrls: ['./performance-profiles.component.css']
})
export class PerformanceProfilesComponent {
[x: string]: any;
  @ViewChild('dt') dt!: Table;

  performanceProfiles: PerformanceProfile[] = [];
  kpiMasterList: Kpi[] = [];
  departments: Department[] = [];
  levels: Grade[] = [];
  createProfileForm!: FormGroup;
  newKpiForm!: FormGroup;
  
  showCreateProfile = false;
  rows = 10;
  selectedStatus = '';
  actionOptions = [
    { label: 'Edit Profile' },
    { label: 'View Details' },
  ];

  previewShow = false;
  showActionButton = true;

  constructor(
    private httpsCallApi: HttpsCallsService,
    private fb: FormBuilder,
    private toasterService: ToastService
  ) {}

  ngOnInit(): void {
    this.fetchProfiles();
    this.loadKpiMaster();
    this.loadDepartments();
    this.loadLevels();
    this.initForm();
    this.initNewKpiForm();
  }

  /** 🔹 Initialize Form with FormArray for KPI assignments */
  initForm() {
    this.createProfileForm = this.fb.group({
      profileName: ['', Validators.required],
      profileDescription: ['', Validators.required],
      selfRatingEnabled: [true],
      isActive: [true],
      departmentId: ['', Validators.required],
      gradeId: ['', Validators.required],
      kpiAssignments: this.fb.array([])
    });
  }

  initNewKpiForm() {
    this.newKpiForm = this.fb.group({
      kpiId: ['', Validators.required],
      weightage: [0, [Validators.required, Validators.min(1), Validators.max(100)]],
      kpiMinRange: [0, [Validators.required, Validators.min(0)]],
      kpiMaxRange: [100, [Validators.required, Validators.min(1)]],
      kpiQualifyCriteria: [80, [Validators.required, Validators.min(0), Validators.max(100)]],
      isActive: [true]
    });
  }

  /** 🔹 Create a new KPI assignment form group */
  createKpiAssignmentGroup(): FormGroup {
    return this.fb.group({
      kpiId: ['', Validators.required],
      weightage: [0, [Validators.required, Validators.min(1), Validators.max(100)]],
      kpiMinRange: [0, [Validators.required, Validators.min(0)]],
      kpiMaxRange: [100, [Validators.required, Validators.min(1)]],
      kpiQualifyCriteria: [80, [Validators.required, Validators.min(0), Validators.max(100)]],
      isActive: [true]
    });
  }

  /** 🔹 Get KPI FormArray */
  get kpiAssignments(): FormArray {
    return this.createProfileForm.get('kpiAssignments') as FormArray;
  }

  getKpiNameById(id: any): string {
    const found = this.kpiMasterList.find(k => k.id.toString() === id?.toString());
    return found ? found.kpiName : 'Not Selected';
  }


  /** 🔹 Add KPI row */
  addKpiAssignment() {
   if (this.newKpiForm.invalid) {
    this.toasterService.show('Please fill all KPI values correctly','info','Fields Required');
    return;
  }

  // Check for duplicate KPI
  const existingKpi = this.kpiAssignments.value.find(
    (k: any) => k.kpiId === this.newKpiForm.value.kpiId
  );
  
  if (existingKpi) {
    this.toasterService.show('This KPI is already added','info','Duplicate Kpi');
    return;
  }

  this.kpiAssignments.push(this.fb.group(this.newKpiForm.value));
  this.newKpiForm.reset({
    kpiId: '',
    weightage: 0,
    kpiMinRange: 0,
    kpiMaxRange: 100,
    kpiQualifyCriteria: 80,
    isActive: true
  });
  this.previewShow = true;
  }


  /** 🔹 Remove KPI row */
  removeKpiAssignment(index: number) {
    this.kpiAssignments.removeAt(index);
  }

  /** 🔹 API Calls */
  loadKpiMaster(): void {
    this.httpsCallApi.getKpiMaster().subscribe({
      next: (data) => (this.kpiMasterList = data),
      error: (err) => console.error('KPI Master API error:', err),
    });
  }

  loadDepartments(): void {
    this.httpsCallApi.getDepartments().subscribe({
      next: (data) => (this.departments = data),
      error: (err) => console.error('Departments API error:', err),
    });
  }

  loadLevels(): void {
    this.httpsCallApi.getLevels().subscribe({
      next: (data) => (this.levels = data),
      error: (err) => console.error('Levels API error:', err),
    });
  }

  fetchProfiles(): void {
    this.httpsCallApi.getPerformanceProfiles().subscribe({
      next: (data) => {
        this.performanceProfiles = data;
        console.log('Profiles:', this.performanceProfiles);
      },
      error: (err) => console.error('API error:', err),
    });
  }

  /** 🔹 Search */
  applyGlobalFilter(event: Event, matchMode: string) {
    const input = event.target as HTMLInputElement;
    this.dt.filterGlobal(input.value, matchMode);
  }

selectedProfile: PerformanceProfile | null = null;

selectAction(option: any, profile: PerformanceProfile, op?: OverlayPanel) {
  if (op) {
    op.hide(); // 
  }

  if (option.label === 'View Details') {
    this.viewProfileDetails(profile.id);
  } else if (option.label === 'Edit Profile') {
    // this.editProfile(profile.id);
  }
}

viewProfileDetails(profileId: string) {
  this.httpsCallApi.getPerformanceProfileById(profileId).subscribe({
    next: (data) => {
      this.selectedProfile = data;
      console.log('Profile details:', data);

    },
    error: (err) => console.error('Failed to fetch profile details:', err),
  });
}


  /** 🔹 Modal */
  openModal() {
    this.initForm(); // reset with fresh FormArray
    this.showCreateProfile = true;
  }

  closeModal() {
    this.showCreateProfile = false;
  }

  /** 🔹 Utility */
  isInvalid(control: string): boolean {
    const c = this.createProfileForm.get(control);
    return !!(c && c.invalid && (c.touched || c.dirty));
  }

  /** 🔹 Submit */
  onCreateProfile() {
    console.log('onSubmit triggered'); // ✅ check if it's firing
    if (this.createProfileForm.invalid) {
      this.createProfileForm.markAllAsTouched();
      console.log('Invalid')
      return;
    }  
    const formValue = this.createProfileForm.value;

    const payload = {
      profileName: formValue.profileName,
      profileDescription: formValue.profileDescription,
      baseVariablePay: 0, 
      selfRatingEnabled: formValue.selfRatingEnabled,
      isActive: formValue.isActive,
      kpiAssignments: formValue.kpiAssignments,
      departmentGradeMappings: [
        {
          departmentId: formValue.departmentId,
          gradeId: formValue.gradeId,
          isActive: true,
        },
      ],
    };

    console.log('POST Payload:', payload);

    this.httpsCallApi.createPerformanceProfile(payload).subscribe({
      next: (res) => {
        console.log('Profile created successfully:', res);
        this.toasterService.show('Profile Created','success','The Profile Created Successfully');
        this.fetchProfiles();
        this.closeModal();
      },
      error: (err) => {console.error('Failed to create profile:', err);
      this.toasterService.show('Failed to Create','error','The Profile Creation failed');
      }
    });
  }
}
