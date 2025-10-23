export interface Kpi {
  id: string;
  kpiName: string;
  kpiCode: string;
  kpiDescription: string;
  kpiCategory: string;
  measurementUnit: string;
  formulaCode: string;
  isActive: boolean;
  profileCount: number;
}

export type KpiPayload = Omit<Kpi,'id'| 'profileCount'>;
