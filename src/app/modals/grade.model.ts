export interface Grade {
  id: string;
  gradeName: string;
  gradeCode: string;
  gradeLevel: string; // e.g. L1, L2, L3
  gradeDescription: string;
  isActive: boolean;
  createdAt: string;
  employeeCount: number;
}
