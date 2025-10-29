import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, AbstractControl, ValidationErrors } from '@angular/forms';
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
  
  isEditMode = false;
  selectedProfile: PerformanceProfile | null = null;
  showCreateProfile = false;
  tempProfileId: string = '';
  
  rows = 5;
  selectedStatus = '';
  totalWeightage: number[] = [];
  hundredCheck = 0;
  balanceWeightage = 0;
  
  actionOptions = [
    { label: 'Edit Profile' },
    { label: 'View Details' },
  ];
  

  rowsOptions = [
    { label: '5', value: 5 },
    { label: '10', value: 10 },
    { label: '15', value: 15 }
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
  
  /** 🔹 Initialize Form */
  initForm() {
    this.createProfileForm = this.fb.group({
      profileName: ['', Validators.required],
      profileDescription: ['', Validators.required],
      selfRatingEnabled: [true],
      isActive: [true],
      baseVariablePay: ['', Validators.required],
      departmentId: [null, Validators.required],
      gradeId: [null, Validators.required],
      kpiAssignments: this.fb.array([], this.minFormArrayLength(1))
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
  
  /** 🔹 Get KPI FormArray */
  get kpiAssignments(): FormArray {
    return this.createProfileForm.get('kpiAssignments') as FormArray;
  }
  
  getKpiNameById(id: any): string {
    const found = this.kpiMasterList.find(k => k.id.toString() === id?.toString());
    return found ? found.kpiName : 'Not Selected';
  }
  
  weightageCheck(weightageValue: number): boolean {
    const currentTotal = this.totalWeightage.reduce((acc, val) => acc + val, 0);
    
    if (currentTotal + weightageValue > 100) {
      this.balanceWeightage = 100 - currentTotal;
      return false;
    }
    
    this.totalWeightage.push(weightageValue);
    this.hundredCheck = currentTotal + weightageValue;
    this.balanceWeightage = 100 - this.hundredCheck;
    return true;
  }
  
  addKpiAssignment() {
    if (this.newKpiForm.invalid) {
      this.toasterService.show('Please fill all KPI values correctly', 'info', 'Fields Required');
      return;
    }
    
    const newKpi = this.newKpiForm.value;
    const weightageValue: number = Number(this.newKpiForm.get('weightage')?.value) || 0;
    
    const existingKpi = this.kpiAssignments.value.find(
      (k: any) => k.kpiId === newKpi.kpiId
    );
    
    if (existingKpi) {
      this.toasterService.show('This KPI is already added', 'info', 'Duplicate KPI');
      return;
    }
    
    if (!this.weightageCheck(weightageValue)) {
      if (this.balanceWeightage === 0) {
        this.toasterService.show(
          `Weightage Value Exceeds max limit`,
          'info',
          'Weightage Exceeds'
        );
      } else {
        this.toasterService.show(
          `Weightage Value should be ${this.balanceWeightage} or below`,
          'info',
          'Weightage Exceeds'
        );
      }
      return;
    }
    
    this.kpiAssignments.push(this.fb.group(newKpi));
    
    this.newKpiForm.reset({
      kpiId: '',
      weightage: 0,
      kpiMinRange: 0,
      kpiMaxRange: 0,
      kpiQualifyCriteria: 0,
      isActive: true
    });
    
    this.previewShow = true;
    console.log('✅ Total Weightage:', this.totalWeightage);
    console.log('🧮 Used Weightage:', this.hundredCheck);
    console.log('🪙 Remaining Weightage:', this.balanceWeightage);
  }
  
  removeKpiAssignment(index: number) {
    this.totalWeightage.splice(index, 1);
    this.kpiAssignments.removeAt(index);
    this.hundredCheck = this.totalWeightage.reduce((acc, val) => acc + val, 0);
    this.balanceWeightage = 100 - this.hundredCheck;
  }
  
  /** 🔹 API Calls */
  loadKpiMaster(): void {
    this.httpsCallApi.getKpiMaster().subscribe({
      next: (data) => {
        this.kpiMasterList = Array.isArray(data) ? data : [];
      },
      error: (err) => {
        console.error('KPI Master API error:', err);
        this.kpiMasterList = [];
      },
    });
  }
  
  loadDepartments(): void {
    this.httpsCallApi.getDepartments().subscribe({
      next: (data) => {
        this.departments = Array.isArray(data) ? data : [];
      },
      error: (err) => {
        console.error('Departments API error:', err);
        this.departments = [];
      },
    });
  }
  
  loadLevels(): void {
    this.httpsCallApi.getLevels().subscribe({
      next: (data) => {
        this.levels = Array.isArray(data) ? data : [];
      },
      error: (err) => {
        console.error('Levels API error:', err);
        this.levels = [];
      },
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
  
  applyGlobalFilter(event: Event, matchMode: string) {
    const input = event.target as HTMLInputElement;
    this.dt.filterGlobal(input.value, matchMode);
  }
  
  selectAction(option: any, profile: PerformanceProfile, op?: OverlayPanel) {
    if (op) {
      op.hide();
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
  
  // ✅ FIXED: Edit Profile
  editProfileDetails(profileId: string) {
    this.isEditMode = true;
    this.showCreateProfile = true;
    this.tempProfileId = profileId;
    
    // ✅ Reset weightage tracking for edit mode
    this.totalWeightage = [];
    this.hundredCheck = 0;
    this.balanceWeightage = 100;
    
    this.httpsCallApi.getPerformanceProfileById(profileId).subscribe({
      next: (data) => {
        this.selectedProfile = data;
        const mapping = data.departmentGradeMappings?.[0];
        
        this.createProfileForm.patchValue({
          profileName: data.profileName,
          profileDescription: data.profileDescription,
          selfRatingEnabled: data.selfRatingEnabled,
          isActive: data.isActive,
          baseVariablePay: data.baseVariablePay,
          departmentId: mapping?.departmentId || null,
          gradeId: mapping?.gradeId || null,
        });
        
        this.kpiAssignments.clear();
        
        if (data.kpis?.length) {
          data.kpis.forEach((kpi: any) => {
            // ✅ Track weightage for existing KPIs
            this.totalWeightage.push(kpi.weightage);
            
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
          
          // ✅ Recalculate totals
          this.hundredCheck = this.totalWeightage.reduce((acc, val) => acc + val, 0);
          this.balanceWeightage = 100 - this.hundredCheck;
        }
        
        this.previewShow = this.kpiAssignments.length > 0;
        console.log('Selected Profile For Edit:', data);
        console.log('Weightage tracking initialized:', this.totalWeightage);
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
  
  // ✅ FIXED: Update Profile
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
    
    const formattedKpis = formValue.kpiAssignments.map((kpi: any) => ({
      kpiId: kpi.kpiId,
      weightage: kpi.weightage,
      kpiMinRange: kpi.kpiMinRange,
      kpiMaxRange: kpi.kpiMaxRange,
      kpiQualifyCriteria: kpi.kpiQualifyCriteria,
      isActive: true
    }));
    
    const payload = {
      profileName: formValue.profileName,
      profileDescription: formValue.profileDescription,
      baseVariablePay: formValue.baseVariablePay,
      selfRatingEnabled: formValue.selfRatingEnabled,
      isActive: formValue.isActive,
      kpiAssignments: formattedKpis,
      departmentGradeMappings: [{ // ✅ FIXED: Must be array
        departmentId: formValue.departmentId,
        gradeId: formValue.gradeId,
        isActive: true,
      }],
    };
    
    // ✅ Check uniqueness (exclude current profile)
    const isUnique = this.isUniqueDepartmentGrade(
      this.performanceProfiles,
      payload,
      this.tempProfileId
    );
    
    if (!isUnique) {
      this.toasterService.show(
        'Update Failed',
        'warning',
        'Department + Grade combination already exists!'
      );
      return;
    }
    
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
      },
      error: (err) => {
        console.error('Failed to update profile:', err);
        this.toasterService.show('Update Failed', 'error', 'Failed to update the profile');
      },
    });
  }
  
  openModal() {
    this.initForm();
    this.initNewKpiForm();
    this.showCreateProfile = true;
    
    // ✅ Reset weightage tracking
    this.totalWeightage = [];
    this.hundredCheck = 0;
    this.balanceWeightage = 100;
  }
  
  closeModal() {
    this.isEditMode = false;
    this.showCreateProfile = false;
    this.createProfileForm.reset();
    this.kpiAssignments.clear();
    
    // ✅ Reset weightage tracking
    this.totalWeightage = [];
    this.hundredCheck = 0;
    this.balanceWeightage = 100;
  }
  
  isInvalid(control: string): boolean {
    const c = this.createProfileForm.get(control);
    return !!(c && c.invalid && (c.touched || c.dirty));
  }
  
  // ✅ FIXED: Create Profile
  onCreateProfile() {
    console.log('onSubmit triggered');
    
    if (this.createProfileForm.invalid) {
      this.createProfileForm.markAllAsTouched();
      console.log('Invalid');
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
      departmentGradeMappings: [{ // ✅ FIXED: Must be array
        departmentId: formValue.departmentId,
        gradeId: formValue.gradeId,
        isActive: true,
      }],
    };
    
    const isUnique = this.isUniqueDepartmentGrade(this.performanceProfiles, payload);
    
    if (!isUnique) {
      this.toasterService.show(
        'Profile not Created',
        'info',
        'Department + Grade combination already exists!'
      );
      console.warn('❌ Department + Grade combination already exists!');
      return;
    }
    
    console.log('📤 POST Payload:', payload);
    console.log('✅ Department + Grade combination is unique, proceeding...');
    
    this.httpsCallApi.createPerformanceProfile(payload).subscribe({
      next: (res) => {
        console.log('✅ Profile created successfully:', res);
        this.toasterService.show('Profile Created', 'success', 'The Profile was created successfully');
        this.fetchProfiles();
        this.closeModal();
      },
      error: (err) => {
        console.error('❌ Failed to create profile:', err);
        this.toasterService.show('Failed to Create', 'error', 'The Profile Creation failed');
      }
    });
  }
  
  minFormArrayLength(min: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      const arr = control as any;
      return arr && arr.length >= min
        ? null
        : { minLengthArray: { requiredLength: min, actualLength: arr ? arr.length : 0 } };
    };
  }
  
  // ✅ FIXED: Uniqueness Check
  isUniqueDepartmentGrade(
    masterArray: any[],
    postResponse: any,
    excludeProfileId?: string
  ): boolean {
    const { departmentGradeMappings } = postResponse;
    
    // ✅ Handle both array and object formats
    if (!departmentGradeMappings) {
      return true;
    }
     
    const mapping = Array.isArray(departmentGradeMappings) 
      ? departmentGradeMappings[0] 
      : departmentGradeMappings;
    
    if (!mapping) {
      return true;
    }
    
    const { departmentId, gradeId } = mapping;
    
    for (const profile of masterArray) {
      // ✅ Skip the profile being edited
      if (excludeProfileId && profile.id === excludeProfileId) {
        continue;
      }
      
      const mappings = profile.departmentGradeMappings || [];
      
      for (const existingMapping of mappings) {
        if (
          existingMapping.departmentId === departmentId &&
          existingMapping.gradeId === gradeId &&
          existingMapping.isActive
        ) {
          console.log('❌ Duplicate found:', {
            existingProfile: profile.profileName,
            departmentId,
            gradeId
          });
          return false;
        }
      }
    }
    
    return true;
  }
}