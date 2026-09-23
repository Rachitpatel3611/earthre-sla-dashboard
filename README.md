# 🌍 EarthRe — SLA Monitoring & Billing Credit Dashboard

A production-grade, full-stack SLA monitoring system designed to turn raw multi-agent health check logs into automated billing credit decisions and SLA compliance dashboards.

---

## 🚀 Live Repository & Demo

- **GitHub Repository**: [https://github.com/Rachitpatel3611/earthre-sla-dashboard](https://github.com/Rachitpatel3611/earthre-sla-dashboard)
- **Local Dashboard URL**: `http://localhost:3000`
- **Verification Date**: September 2026.

---

## 🏗️ Architecture & Component Choices

The application uses a **stateless processing pipeline** decoupled from presentation and storage layers:

```text
[ Upload UI (Next.js/React) ]
             │ (CSV File Stream)
             ▼
[ Stateless Serverless Processing Function (/api/upload) ]
             │ (Validates, Cleans, Normalizes Timestamps & Units)
             ▼
[ Persistent File Database (lib/db.ts JSON Storage Engine) ]
             │
     ┌───────┴────────┐
     ▼                ▼
[ /api/stats ]   [ /api/logs ]
     │                │
     ▼                ▼
[ Collapsible    [ Filterable ]
   Stats UI ]      Logs View ]
```

### **Why these technologies were chosen:**
1. **Next.js (App Router, TypeScript, Tailwind CSS)**: Enables serverless API routes side-by-side with React client components, satisfying the requirement for stateless cloud processing functions.
2. **Native Node JSON Database Engine**: Zero-dependency, zero native compilation issues, multi-platform file persistence. Perfect for free-tier hosting on Vercel, Render, or Netlify.
3. **PapaParse**: High-performance CSV parser that streams large multi-day monitoring files effortlessly.

---

## 🔍 Data Findings & Quality Handling

During data exploration across all multi-day seed files (`9d`, `12d`, `14d`, `21d`, `30d`), we identified and resolved the following data anomalies:

| Anomaly Discovered | Example in Raw Data | Resolution Strategy |
| :--- | :--- | :--- |
| **Unix Epoch Timestamps** | `1746938700` | Normalized automatically to standard ISO 8601 UTC string (`2025-05-11T...Z`). |
| **Mixed Latency Units** | `0.717 s` vs `707 ms` | Converted all values given in seconds (`s`) into milliseconds (`ms`) by multiplying by 1000. |
| **Missing Latency Values** | `200,,ms,agent-1` | Preserved record for status determination while setting `latency_ms` to `null` to avoid skewing P95 metrics. |
| **Multi-Agent Duplicates** | Duplicate checks at exact same timestamp from multiple agents | Deduplicated by composite key `(service_id + timestamp)` to prevent double-counting downtime. |
| **Corrupted Status Codes** | Empty/NaN status codes | Categorized unparseable HTTP responses as `500 Internal Server Error`. |

---

## 💡 Key Design Assumptions & Decisions

### 1. **Why these top stats matter:**
- **Overall System Availability %**: The central metric determining SLA breaches. Standard cloud SLAs trigger billing credits if monthly availability falls below **99.9%**.
- **Billing Credit Requirement Status**: Immediately flags which services require manual/automatic financial credit payouts.
- **P95 Latency (ms)**: Average latency masks tail-end spikes; P95 latency gives on-call engineers actionable performance insights.

### 2. **Multi-day Span Detection**:
The pipeline calculates dates dynamically from timestamps within uploaded files without hardcoding expected day spans (works seamlessly across 9-day, 12-day, 14-day, 21-day, and 30-day datasets).

---

## 🛠️ How to Run & Redeploy Locally

### **Prerequisites**:
- Node.js v18+ installed

### **Commands**:
```bash
# 1. Clone repository
git clone https://github.com/Rachitpatel3611/earthre-sla-dashboard.git
cd earthre-sla-dashboard

# 2. Install dependencies
npm install

# 3. Run development server
npm run dev

# 4. Open in Browser
# http://localhost:3000
```

---

## 🔮 What I'd Do Differently With More Time

1. **Automated Incident Window Grouping**: Group consecutive 5xx errors into named incident windows with calculated MTTR (Mean Time to Resolution).
2. **Chart Visualizations**: Render interactive time-series availability timelines using Recharts.
3. **Export Reports**: Provide downloadable PDF/CSV billing credit reports for customer support teams.
