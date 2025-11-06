import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { StatisticsResponse } from '../modals/statistics.model';
import { PerformanceProfile } from '../modals/performance-profile.model';
import { Department } from '../modals/department.model';
import { Grade } from '../modals/grade.model';
import { Kpi, KpiPayload } from '../modals/kpi.model';
import { ManagerEmployees } from '../modals/manager-employee.model';
import { KpiProfiles } from '../modals/kpi-profiles.model';
import { UnifiedSubmitRequest } from '../modals/kpi-submission.model';
import { EmployeeKpiSummary } from '../modals/employee-kpi-summary.model';
import { LastApprovedReference } from '../modals/last-approved-reference.model';
import { MissingPeriod } from '../modals/month-picker.model';
import { EvaluationSummary } from '../modals/evaluation-summary.model';

@Injectable({
  providedIn: 'root'
})
export class HttpsCallsService {

  private baseUrl = `${environment.apiBaseUrl}/kpi-master`;

  private performanceProfileUrl = `${environment.apiBaseUrl}/performance-profiles`;

  private employeeKPIDataUrl = `${environment.apiBaseUrl}/employee-kpi-data`;

  private employeeKPIReviewUrl = `${environment.apiBaseUrl}/kpi-reviews`;

  constructor(private http: HttpClient) {}


  getStatistics(): Observable<StatisticsResponse> {
    return this.http.get<StatisticsResponse>(`${this.baseUrl}/statistics`);
  }

  getKpiMaster(): Observable<Kpi[]> {
    return this.http.get<Kpi[]>(this.baseUrl);
  }


  createKpi(payload: KpiPayload): Observable<Kpi> {
    return this.http.post<Kpi>(this.baseUrl, payload, {
      headers: { 'Content-Type': 'application/json' }
    });
    
  }

  updateKpi(kpi_id :string, payload: KpiPayload): Observable<Kpi> {
    const url = `${this.baseUrl}/${kpi_id}/update`;
    return this.http.post<Kpi>(url, payload);
  }


  getPerformanceProfiles(): Observable<PerformanceProfile[]> {
    return this.http.get<PerformanceProfile[]>(`${this.performanceProfileUrl}/with-kpis`);
  }

    getPerformanceProfileById(id: string): Observable<PerformanceProfile> {
      return this.http.get<PerformanceProfile>(`${this.performanceProfileUrl}/${id}/with-kpis`);
    }


  getDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(`${environment.apiBaseUrl}/departments`);
  }

  getLevels(): Observable<Grade[]> {
    return this.http.get<Grade[]>(`${environment.apiBaseUrl}/grades`);
  }

  createPerformanceProfile(payload: any): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/performance-profiles/with-kpis`, payload);
  }

  updatePerformanceProfile(id: string, payload: any): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/performance-profiles/${id}/with-kpis/update`, payload);
  }


  getEmployeesByManager(managerId: string): Observable<ManagerEmployees[]> {
    const url = `${this.employeeKPIDataUrl}/manager/${managerId}/employees-with-profiles`;
    return this.http.get<ManagerEmployees[]>(url);
  }

   getEmployeeKpis(employeeId: string, evaluationYear:number, evaluationMonth:number): Observable<KpiProfiles[]> {
    const url = `${this.employeeKPIDataUrl}/employee/${employeeId}/kpi-list/${evaluationYear}/${evaluationMonth}`;
    return this.http.get<KpiProfiles[]>(url);
  }

  getEmployeeCurrentSummary(employeeId: string, year: number, month: number): Observable<EmployeeKpiSummary> {
    return this.http.get<EmployeeKpiSummary>(
      `${this.employeeKPIDataUrl}/employee/${employeeId}/current-summary/${year}/${month}`
    );
  }

  getLastApprovedReference(
    employeeId: string,
    currentYear: number,
    currentMonth: number
  ): Observable<LastApprovedReference> {
    const url = `${this.employeeKPIDataUrl}/employee/${employeeId}/last-approved-reference`;
    return this.http.get<LastApprovedReference>(
      `${url}?currentEvaluationYear=${currentYear}&currentEvaluationMonth=${currentMonth}`
    );
  }

  submitUnifiedKpi(payload: UnifiedSubmitRequest): Observable<any> {
    return this.http.post(`${this.employeeKPIDataUrl}/unified-submit`, payload);
  }


  getMissingSelfPeriods(employeeId: string, startYear: number, startMonth: number): Observable<MissingPeriod[]> {
    const url = `${this.employeeKPIDataUrl}/employee/${employeeId}/missing-self-periods?startYear=${startYear}&startMonth=${startMonth}`;
    return this.http.get<MissingPeriod[]>(url);
  }


  getUnreviewedPeriods(managerId: string, startYear: number, startMonth: number): Observable<EvaluationSummary[]> {
    const url = `${this.employeeKPIReviewUrl}/manager/${managerId}/unreviewed-periods?startYear=${startYear}&startMonth=${startMonth}`;
    return this.http.get<EvaluationSummary[]>(url);
  }

}
