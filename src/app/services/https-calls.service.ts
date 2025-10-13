import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { StatisticsResponse } from '../modals/statistics.model';
import { PerformanceProfile } from '../modals/performance-profile.model';
import { Department } from '../modals/department.model';
import { Grade } from '../modals/grade.model';
import { Kpi, KpiPayload } from '../modals/kpi.model';

@Injectable({
  providedIn: 'root'
})
export class HttpsCallsService {

  private baseUrl = `${environment.apiBaseUrl}/kpi-master`;

  private performanceProfileUrl = `${environment.apiBaseUrl}/performance-profiles`;

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
}
