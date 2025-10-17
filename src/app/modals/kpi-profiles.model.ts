export interface KpiProfiles {
  id: string;
  employeeId: string;
  employeeName: string;
  kpiId: string;
  kpiName: string;
  kpiCategory: string;
  measurementUnit: string;
  formulaCode: string;
  evaluationMonth: number;
  evaluationYear: number;
  targetValue: number;
  actualValue: number;
  achievedPercentage: number;
  plipScore: number;
  weightage: number;
  weightageAchieved: number;
  isQualified: boolean;
  entryType: string;      // e.g., 'not_entered'
  entryStatus: string;    // e.g., 'not_started'
  workflowState: string;  // e.g., 'not_started'
  enteredBy: string;
  enteredByName: string;
  createdAt: string;      // ISO date string
  updatedAt: string;      // ISO date string
}
