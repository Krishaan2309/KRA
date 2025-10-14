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
import { AbstractControl, ValidationErrors } from '@angular/forms';

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
  isEditMode= false;
selectedProfile: PerformanceProfile | null = null;
  showCreateProfile = false;
  tempProfileId : string ='';
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
      baseVariablePay: ['', Validators.required],
      departmentId: ['', Validators.required],
      gradeId: ['', Validators.required],
      kpiAssignments: this.fb.array([],this.minFormArrayLength(1))
    });
  }

  initNewKpiForm() {
    this.newKpiForm = this.fb.group({
      kpiId: ['', Validators.required],
      weightage: [0, [Validators.required, Validators.min(1), Validators.max(100)]],
      kpiMinRange: [0, [Validators.required, Validators.min(0)]],
      kpiMaxRange: [0, [Validators.required, Validators.min(1)]],
      kpiQualifyCriteria: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      isActive: [true]
    });
  }

  /** 🔹 Create a new KPI assignment form group */
  createKpiAssignmentGroup(): FormGroup {
    return this.fb.group({
      kpiId: ['', Validators.required],
      weightage: [0, [Validators.required, Validators.min(1), Validators.max(100)]],
      kpiMinRange: [0, [Validators.required, Validators.min(0)]],
      kpiMaxRange: [0, [Validators.required, Validators.min(1)]],
      kpiQualifyCriteria: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      isActive: [true]
    });
  }

  /** 🔹 Get KPI FormArray */
  get kpiAssignments(): FormArray {7
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
    kpiMaxRange: 0,
    kpiQualifyCriteria: 0,
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



selectAction(option: any, profile: PerformanceProfile, op?: OverlayPanel) {
  if (op) {
    op.hide(); // 
  }

  if (option.label === 'View Details') {
    this.viewProfileDetails(profile.id);
  } else if (option.label === 'Edit Profile') {
    this.editProfileDetails(profile.id);
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

// ✅ Load data into form for editing
editProfileDetails(profileId: string) {
  this.openModal();

  this.tempProfileId = profileId;
  this.httpsCallApi.getPerformanceProfileById(profileId).subscribe({
    next: (data) => {
      this.selectedProfile = data;
      const mapping = data.departmentGradeMappings?.[0];

      // 📝 Patch basic fields
      this.createProfileForm.patchValue({
        profileName: data.profileName,
        profileDescription: data.profileDescription,
        selfRatingEnabled: data.selfRatingEnabled,
        isActive: data.isActive,
        baseVariablePay: data.baseVariablePay,
        departmentId: mapping?.departmentId || '',
        gradeId: mapping?.gradeId || '',
      });

      // 📝 Clear old KPI assignments
      this.kpiAssignments.clear();

      // 📝 Patch all KPIs from the selected profile
      if (data.kpis?.length) {
        data.kpis.forEach((kpi: any) => {
          this.kpiAssignments.push(
            this.fb.group({
              kpiId: kpi.kpiId || kpi.id,
              weightage: kpi.weightage,
              kpiMinRange: kpi.kpiMinRange,
              kpiMaxRange: kpi.kpiMaxRange,
              kpiQualifyCriteria: kpi.kpiQualifyCriteria,
              isActive: kpi.isActive
            })
          );
        });
      }

      this.previewShow = this.kpiAssignments.length > 0;
      console.log('Selected Profile For Edit:', data);
    },
    error: (err) => console.error('Failed to load profile for edit:', err),
  });
}


onSubmit() {
  if (this.isEditMode) {
    this.editExistingProfile();
  } else {
    this.onCreateProfile();
  }
}

editExistingProfile() {
  if (this.createProfileForm.invalid) {
    this.createProfileForm.markAllAsTouched();
    return;
  }

  if (!this.tempProfileId) {
    console.error('Profile ID missing for update');
    return;
  }

  const formValue = this.createProfileForm.value;

  // 🛠️ Map KPI assignments properly
  const formattedKpis = formValue.kpiAssignments.map((kpi: any) => ({
    kpiId: kpi.kpiId,
    weightage: kpi.weightage,
    kpiMinRange: kpi.kpiMinRange,
    kpiMaxRange: kpi.kpiMaxRange,
    kpiQualifyCriteria: kpi.kpiQualifyCriteria,
    isActive: true  // ensure it's active on update
  }));

  const payload = {
    profileName: formValue.profileName,
    profileDescription: formValue.profileDescription,
    baseVariablePay: formValue.baseVariablePay,
    selfRatingEnabled: formValue.selfRatingEnabled,
    isActive: formValue.isActive,
    kpiAssignments: formattedKpis,
    departmentGradeMappings: [
      {
        departmentId: formValue.departmentId,
        gradeId: formValue.gradeId,
        isActive: true,
      },
    ],
  };

  console.log('Update Payload:', payload);

  this.httpsCallApi.updatePerformanceProfile(this.tempProfileId, payload).subscribe({
    next: (res) => {
      console.log('Profile updated successfully:', res);
      this.toasterService.show('Profile Updated', 'success', 'The Profile was updated successfully');
      this.fetchProfiles();
      this.closeModal();
      this.isEditMode = false;
      this.viewProfileDetails(this.tempProfileId);
      this.tempProfileId = '';
      // this.editProfileDetails(this.tempProfileId);
      
    },
    error: (err) => {
      console.error('Failed to update profile:', err);
      this.toasterService.show('Update Failed', 'error', 'Failed to update the profile');
    },
  });
}



  /** 🔹 Modal */
  openModal() {
    this.initForm(); // reset with fresh FormArray
    this.initNewKpiForm();
    this.showCreateProfile = true;
  }

  closeModal() {
      this.isEditMode = false;
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
    this.isEditMode = false;
    const payload = {
      profileName: formValue.profileName,
      profileDescription: formValue.profileDescription,
      baseVariablePay: formValue.baseVariablePay, 
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
    const isUniqueDepartmentGradeLevel = this.isUniqueDepartmentGrade(this.performanceProfiles, payload);
    if (!isUniqueDepartmentGradeLevel) {
      this.toasterService.show('Profile not Created','info','Department + Grade combination already exists!');
      console.log("❌ Department + Grade combination already exists!");
    } else {
      console.log('POST Payload:', payload);
      console.log("✅ Department + Grade combination is unique, can proceed.");
      this.httpsCallApi.createPerformanceProfile(payload).subscribe({
      next: (res) => {
        console.log('Profile created successfully:', res);
        this.toasterService.show('Profile Created','success','The Profile Created Successfully');
        console.log("Form Values : ",formValue)
        this.fetchProfiles();
        this.closeModal();
      },
      error: (err) => {console.error('Failed to create profile:', err);
      this.toasterService.show('Failed to Create','error','The Profile Creation failed');
      }
    });
    }

    
    

    
  }

  minFormArrayLength(min: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      const arr = control as any;
      return arr && arr.length >= min
        ? null
        : { minLengthArray: { requiredLength: min, actualLength: arr ? arr.length : 0 } };
    };
  }

  isUniqueDepartmentGrade(
  masterArray: any[],
  postResponse: any
): boolean {
  // Extract departmentId and gradeId from postResponse
  const { departmentGradeMappings } = postResponse;
  if (!departmentGradeMappings || departmentGradeMappings.length === 0) {
    return true; // nothing to validate
  }

  const { departmentId, gradeId } = departmentGradeMappings[0];

  // Loop through master array
  for (const profile of masterArray) {
    for (const mapping of profile.departmentGradeMappings || []) {
      if (
        mapping.departmentId === departmentId &&
        mapping.gradeId === gradeId &&
        mapping.isActive
      ) {
        // Found a match
        return false;
      }
    }
  }

  // No match found
  return true;
}


}
