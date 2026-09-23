export interface RawCheckRecord {
  service_id?: string;
  service_name?: string;
  timestamp?: string | number;
  status_code?: string | number;
  latency?: string | number;
  latency_unit?: string;
  agent?: string;
  region?: string;
}

export interface CleanedCheckRecord {
  service_id: string;
  service_name: string;
  timestamp: string; // ISO 8601 UTC string
  status_code: number;
  latency_ms: number | null;
  agent: string;
  region: string;
  is_successful: boolean; // 2xx status code
}

export interface ProcessingReport {
  totalRows: number;
  validRows: number;
  corruptedRows: number;
  dataQualityIssues: string[];
}

export interface ServiceSLAStats {
  service_id: string;
  service_name: string;
  total_checks: number;
  successful_checks: number;
  failed_checks: number;
  availability_pct: number; // SLA availability %
  meets_sla: boolean; // >= 99.9%
  avg_latency_ms: number;
  p95_latency_ms: number;
  max_latency_ms: number;
  incidents_count: number;
}

export interface DashboardStatsSummary {
  overall_availability_pct: number;
  total_checks_evaluated: number;
  services_meeting_sla: number;
  services_failing_sla: number;
  total_incidents: number;
  avg_system_latency_ms: number;
  data_quality_anomalies_handled: number;
  services: ServiceSLAStats[];
}

export interface LogFilterParams {
  startDate?: string;
  endDate?: string;
  serviceId?: string;
  statusType?: 'all' | 'success' | 'failure';
  searchQuery?: string;
  page?: number;
  limit?: number;
}