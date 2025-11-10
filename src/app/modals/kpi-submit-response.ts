export interface KpiSubmitResponse {
  success: boolean;
  message: string;
  kpiData: any[]; // you can replace 'any' with a real KPI model later
  operationType: number;
  entryType: string;
  entryStatus: string;
  workflowState: string;
}

