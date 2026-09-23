import Papa from 'papaparse';
import { RawCheckRecord, CleanedCheckRecord, ProcessingReport } from './types';

export function parseAndCleanCSV(csvContent: string): {
  records: CleanedCheckRecord[];
  report: ProcessingReport;
} {
  const parseResult = Papa.parse<RawCheckRecord>(csvContent, {
    header: true,
    skipEmptyLines: true,
    trimHeaders: true,
  });

  const rawRows = parseResult.data;
  const cleanedRecords: CleanedCheckRecord[] = [];
  const issuesSet = new Set<string>();
  
  let validRows = 0;
  let corruptedRows = 0;

  const seenKeys = new Set<string>();

  for (let i = 0; i < rawRows.length; i++) {
    const raw = rawRows[i];

    // 1. Validate required fields
    if (!raw.service_id || !raw.timestamp) {
      corruptedRows++;
      issuesSet.add("Dropped rows missing service_id or timestamp.");
      continue;
    }

    // 2. Normalize Timestamp (Handle Unix epoch timestamps vs ISO dates)
    let isoTimestamp: string;
    const rawTsStr = String(raw.timestamp).trim();

    if (/^\d{10,13}$/.test(rawTsStr)) {
      // Unix timestamp (seconds or milliseconds)
      let num = parseInt(rawTsStr, 10);
      if (num < 10000000000) num *= 1000; // convert seconds to ms
      isoTimestamp = new Date(num).toISOString();
      issuesSet.add("Converted Unix epoch timestamps to ISO 8601 UTC standard.");
    } else {
      const parsedDate = new Date(rawTsStr);
      if (isNaN(parsedDate.getTime())) {
        corruptedRows++;
        issuesSet.add("Dropped rows with unparseable date formats.");
        continue;
      }
      isoTimestamp = parsedDate.toISOString();
    }

    // 3. Deduplicate checks (Same service at exact same timestamp from multiple agents)
    const dedupKey = `${raw.service_id}_${isoTimestamp}`;
    if (seenKeys.has(dedupKey)) {
      issuesSet.add("Deduplicated multi-agent duplicate logs at identical timestamps.");
      continue; // Skip duplicate reading
    }
    seenKeys.add(dedupKey);

    // 4. Normalize HTTP Status Code
    let statusCode = parseInt(String(raw.status_code || 500), 10);
    if (isNaN(statusCode)) {
      statusCode = 500;
      issuesSet.add("Defaulted invalid HTTP status codes to 500 Server Error.");
    }

    // 5. Normalize Latency & Units (Convert 's' -> 'ms', handle missing latencies)
    let latencyMs: number | null = null;
    const unit = String(raw.latency_unit || 'ms').trim().toLowerCase();
    
    if (raw.latency !== undefined && raw.latency !== null && String(raw.latency).trim() !== '') {
      let latVal = parseFloat(String(raw.latency));
      if (!isNaN(latVal)) {
        if (unit === 's' || unit === 'sec' || latVal < 10) {
          // If unit is seconds or float < 10, convert to ms
          latVal = latVal * 1000;
          issuesSet.add("Normalized latency units from seconds (s) to milliseconds (ms).");
        }
        latencyMs = Math.round(latVal * 100) / 100;
      }
    } else {
      issuesSet.add("Handled missing/null latency records gracefully without throwing.");
    }

    // 6. SLA Pass/Fail Classification
    const isSuccessful = statusCode >= 200 && statusCode < 300;

    cleanedRecords.push({
      service_id: String(raw.service_id).trim(),
      service_name: String(raw.service_name || raw.service_id).trim(),
      timestamp: isoTimestamp,
      status_code: statusCode,
      latency_ms: latencyMs,
      agent: String(raw.agent || 'agent-1').trim(),
      region: String(raw.region || 'global').trim(),
      is_successful: isSuccessful,
    });

    validRows++;
  }

  return {
    records: cleanedRecords,
    report: {
      totalRows: rawRows.length,
      validRows,
      corruptedRows,
      dataQualityIssues: Array.from(issuesSet),
    },
  };
}