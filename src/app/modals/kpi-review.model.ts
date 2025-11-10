export interface reviewSubmit {
  reviewerId: string;
  kpiActions: KpiAction[];
  forwardToSuperior: boolean;
  superiorId: string;
}

export interface KpiAction {
  kpiDataId: string;
  actionType: string;
  actions: string[];
  newTargetValue: number;
  newActualValue: number;
  comments: string;
  editReason: string;
}