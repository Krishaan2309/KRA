export interface Statistics {
  totalKpis: number;
  activeKpis: number;
  inactiveKpis: number;
  higherisbetter: number;
  lowerisbetter: number;
  equaltotarget: number;
}

export interface StatisticsResponse {
  statistics: Statistics;
  generatedAt: string;
}
