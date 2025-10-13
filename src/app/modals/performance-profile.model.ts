export interface DepartmentGradeMapping {
  id: string;
  profileId: string;
  profileName: string;
  profileDescription: string;
  departmentId: string;
  departmentName: string;
  departmentCode: string;
  gradeId: string;
  gradeName: string;
  gradeCode: string;
  gradeLevel: string;
  mappingType: string;
  priority: number;
  employeeCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface KPI {
  id: string;
  profileId: string;
  profileName: string;
  kpiId: string;
  kpiName: string;
  kpiCode: string;
  kpiCategory: string;
  measurementUnit: string;
  formulaCode: string;
  weightage: number;
  kpiMinRange: number;
  kpiMaxRange: number;
  kpiQualifyCriteria: number;
  weightageCategory: string;
  isActive: boolean;
}

export interface PerformanceProfile {
  id: string;
  profileName: string;
  profileDescription: string;
  baseVariablePay?: number;
  selfRatingEnabled: boolean;
  isActive: boolean;
  kpis: KPI[];
  kpiCount: number;
  departmentGradeMappings?: DepartmentGradeMapping[];
}
