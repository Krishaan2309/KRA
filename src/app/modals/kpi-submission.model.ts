export interface KpiSubmission {
  kpiId: string;
  targetValue: number;
  actualValue: number;
}

export interface UnifiedSubmitRequest {
  employeeId: string;
  evaluationYear: number;
  evaluationMonth: number;
  enteredBy: string;
  kpiData: KpiSubmission[];
  operationType: number;
}