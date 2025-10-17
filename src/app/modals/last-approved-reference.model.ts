export interface KpiReference {
  kpiId: string;
  kpiName: string;
  currentPercentage: number;
  lastApprovedPercentage: number;
  changeAmount: number;
  changeDirection: 'up' | 'down' | 'no_change';
}

export interface LastApprovedReference {
  employeeId: string;
  currentEvaluationYear: number;
  currentEvaluationMonth: number;
  lastApprovedYear: number;
  lastApprovedMonth: number;
  monthsSinceLastApproval: number;
  kpiReferences: KpiReference[];
}
