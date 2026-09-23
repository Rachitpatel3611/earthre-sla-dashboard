'use client';

import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  AlertOctagon, 
  Clock, 
  Activity,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { DashboardStatsSummary } from '@/lib/types';

interface StatsOverviewProps {
  stats: DashboardStatsSummary | null;
  isLoading: boolean;
}

export default function StatsOverview({ stats, isLoading }: StatsOverviewProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-4 gap-4">
          <div className="h-24 bg-gray-100 rounded"></div>
          <div className="h-24 bg-gray-100 rounded"></div>
          <div className="h-24 bg-gray-100 rounded"></div>
          <div className="h-24 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (!stats || stats.total_checks_evaluated === 0) {
    return (
      <div className="bg-white rounded-xl border border-dashed border-gray-300 p-8 mb-8 text-center">
        <Activity className="w-10 h-10 text-gray-400 mx-auto mb-2" />
        <h3 className="text-sm font-semibold text-gray-700">No Monitoring Data Processed Yet</h3>
        <p className="text-xs text-gray-500 mt-1">Upload a monitoring checks CSV file above to compute SLA metrics.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-8 overflow-hidden">
      {/* Header with Collapse/Expand Toggle Button */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 cursor-pointer hover:bg-gray-100/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">SLA Compliance & System Health</h2>
            <p className="text-xs text-gray-500">
              Evaluated {stats.total_checks_evaluated.toLocaleString()} health checks across services
            </p>
          </div>
        </div>

        <button className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-md">
          {isExpanded ? (
            <>Collapse Stats <ChevronUp className="w-4 h-4" /></>
          ) : (
            <>Expand Stats <ChevronDown className="w-4 h-4" /></>
          )}
        </button>
      </div>

      {/* Collapsible Content Section */}
      {isExpanded && (
        <div className="p-6">
          {/* Top Key Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            
            {/* Overall System Availability */}
            <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-xl p-4">
              <div className="flex items-center justify-between text-xs text-indigo-600 font-semibold mb-1">
                <span>System Availability</span>
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-2xl font-extrabold text-gray-900">
                {stats.overall_availability_pct}%
              </div>
              <div className="mt-2 text-xs flex items-center gap-1 font-medium">
                {stats.overall_availability_pct >= 99.9 ? (
                  <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    ✓ Meets 99.9% Target
                  </span>
                ) : (
                  <span className="text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                    ⚠ SLA Breach (&lt; 99.9%)
                  </span>
                )}
              </div>
            </div>

            {/* SLA Status / Credit Payouts */}
            <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-xl p-4">
              <div className="flex items-center justify-between text-xs text-emerald-700 font-semibold mb-1">
                <span>SLA Compliance</span>
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-extrabold text-gray-900">
                {stats.services_meeting_sla} / {stats.services.length}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {stats.services_failing_sla === 0 ? (
                  <span className="text-emerald-600 font-medium">All services compliant</span>
                ) : (
                  <span className="text-rose-600 font-medium">{stats.services_failing_sla} service requires billing credit</span>
                )}
              </p>
            </div>

            {/* Total Incident Windows */}
            <div className="bg-gradient-to-br from-amber-50 to-white border border-amber-100 rounded-xl p-4">
              <div className="flex items-center justify-between text-xs text-amber-700 font-semibold mb-1">
                <span>Downtime Incidents</span>
                <AlertOctagon className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-extrabold text-gray-900">
                {stats.total_incidents}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Recorded outages & failed checks
              </p>
            </div>

            {/* System Latency Metrics */}
            <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-4">
              <div className="flex items-center justify-between text-xs text-blue-700 font-semibold mb-1">
                <span>Avg System Latency</span>
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-extrabold text-gray-900">
                {stats.avg_system_latency_ms} <span className="text-sm font-normal text-gray-500">ms</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Normalized response time across regions
              </p>
            </div>

          </div>

          {/* Service Breakdown Matrix */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200 font-bold text-xs text-gray-700 uppercase tracking-wider">
              Per-Service SLA & Uptime Breakdown
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-100/70 text-gray-600 font-semibold border-b border-gray-200">
                  <tr>
                    <th className="p-3">Service Name</th>
                    <th className="p-3">Total Checks</th>
                    <th className="p-3">Passed / Failed</th>
                    <th className="p-3">Availability %</th>
                    <th className="p-3">SLA Status</th>
                    <th className="p-3">Avg / Max Latency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stats.services.map((svc) => (
                    <tr key={svc.service_id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-3 font-semibold text-gray-900">
                        {svc.service_name}
                        <span className="block text-[10px] text-gray-400 font-normal">{svc.service_id}</span>
                      </td>
                      <td className="p-3 font-medium text-gray-700">{svc.total_checks.toLocaleString()}</td>
                      <td className="p-3">
                        <span className="text-emerald-700 font-medium">{svc.successful_checks}</span> / {' '}
                        <span className="text-rose-600 font-medium">{svc.failed_checks}</span>
                      </td>
                      <td className="p-3">
                        <span className={`font-bold ${svc.availability_pct >= 99.9 ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {svc.availability_pct}%
                        </span>
                      </td>
                      <td className="p-3">
                        {svc.meets_sla ? (
                          <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-semibold text-[11px]">
                            <CheckCircle className="w-3 h-3 text-emerald-600" /> Compliant
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-800 bg-rose-100 px-2 py-0.5 rounded font-semibold text-[11px]">
                            <XCircle className="w-3 h-3 text-rose-600" /> Credit Required
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-gray-600">
                        <span className="font-medium text-gray-900">{svc.avg_latency_ms} ms</span> avg
                        <span className="text-gray-400 mx-1">|</span>
                        <span>{svc.max_latency_ms} ms max</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}