export interface EmployeeKpiSummary {
  employeeId: string;
  evaluationYear: number;
  evaluationMonth: number;
  projectedPay: number;
  actualVariablePay: number;
  totalKpis: number;
  completedKpis: number;
  pendingKpis: number;
  totalWeightage: number;
  achievedWeightage: number;
}
