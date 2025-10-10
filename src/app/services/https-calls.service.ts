import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { StatisticsResponse } from '../modals/statistics.model';
import { Kpi, KpiPayload } from '../modals/kpi.model';

@Injectable({
  providedIn: 'root'
})
export class HttpsCallsService {

  private baseUrl = `${environment.apiBaseUrl}/kpi-master`;

  constructor(private http: HttpClient) {}


  getStatistics(): Observable<StatisticsResponse> {
    return this.http.get<StatisticsResponse>(`${this.baseUrl}/statistics`);
  }

  getKpiList(): Observable<Kpi[]> {
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

}
