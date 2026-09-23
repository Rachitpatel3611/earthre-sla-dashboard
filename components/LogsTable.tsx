'use client';

import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  Calendar, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  ChevronLeft, 
  ChevronRight,
  Database
} from 'lucide-react';

interface CleanedCheckRecord {
  id: number;
  service_id: string;
  service_name: string;
  timestamp: string;
  status_code: number;
  latency_ms: number | null;
  agent: string;
  region: string;
  is_successful: boolean;
}

interface LogsTableProps {
  refreshTrigger: number;
}

export default function LogsTable({ refreshTrigger }: LogsTableProps) {
  const [logs, setLogs] = useState<CleanedCheckRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Filter States
  const [filterType, setFilterType] = useState<'single' | 'range'>('single');
  const [singleDate, setSingleDate] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [serviceId, setServiceId] = useState<string>('all');
  const [statusType, setStatusType] = useState<string>('all');
  
  // Pagination State
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(0);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '30');

      if (filterType === 'single' && singleDate) {
        params.set('startDate', singleDate);
      } else if (filterType === 'range' && startDate && endDate) {
        params.set('startDate', startDate);
        params.set('endDate', endDate);
      }

      if (serviceId !== 'all') params.set('serviceId', serviceId);
      if (statusType !== 'all') params.set('statusType', statusType);

      const res = await fetch(`/api/logs?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setLogs(data.logs || []);
        setTotalRecords(data.pagination?.total || 0);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [refreshTrigger, page, singleDate, startDate, endDate, serviceId, statusType, filterType]);

  const handleClearFilters = () => {
    setSingleDate('');
    setStartDate('');
    setEndDate('');
    setServiceId('all');
    setStatusType('all');
    setPage(1);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Table Header & Controls */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-600" />
              Monitoring Check Logs
            </h2>
            <p className="text-xs text-gray-500">
              Showing {totalRecords.toLocaleString()} underlying check records
            </p>
          </div>

          {/* Toggle between Single Date & Date Range Filter */}
          <div className="flex items-center bg-gray-100 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => { setFilterType('single'); setPage(1); }}
              className={`px-3 py-1.5 rounded-md transition-all ${
                filterType === 'single' ? 'bg-white text-indigo-600 shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Single Date
            </button>
            <button
              onClick={() => { setFilterType('range'); setPage(1); }}
              className={`px-3 py-1.5 rounded-md transition-all ${
                filterType === 'range' ? 'bg-white text-indigo-600 shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Date Range
            </button>
          </div>
        </div>

        {/* Filter Input Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          
          {/* Date Picker Inputs */}
          {filterType === 'single' ? (
            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Single Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={singleDate}
                  onChange={(e) => { setSingleDate(e.target.value); setPage(1); }}
                  className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <Calendar className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" />
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-800 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-800 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </>
          )}

          {/* Service Filter */}
          <div>
            <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Filter Service</label>
            <select
              value={serviceId}
              onChange={(e) => { setServiceId(e.target.value); setPage(1); }}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-800 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Services (5)</option>
              <option value="svc-auth">svc-auth (Auth API)</option>
              <option value="svc-payments">svc-payments (Payments API)</option>
              <option value="svc-reports">svc-reports (Reports API)</option>
              <option value="svc-search">svc-search (Search API)</option>
              <option value="svc-notify">svc-notify (Notify Worker)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Filter Status</label>
            <select
              value={statusType}
              onChange={(e) => { setStatusType(e.target.value); setPage(1); }}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-800 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="success">2xx Success Only</option>
              <option value="failure">5xx / 4xx Failures Only</option>
            </select>
          </div>

        </div>

        {/* Clear Filter Button */}
        {(singleDate || startDate || endDate || serviceId !== 'all' || statusType !== 'all') && (
          <div className="mt-3 flex justify-end">
            <button
              onClick={handleClearFilters}
              className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Logs Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-100 text-gray-600 font-semibold uppercase border-b border-gray-200 tracking-wider">
            <tr>
              <th className="p-3">Timestamp (UTC)</th>
              <th className="p-3">Service</th>
              <th className="p-3">Status Code</th>
              <th className="p-3">Latency</th>
              <th className="p-3">Agent</th>
              <th className="p-3">Region</th>
              <th className="p-3">SLA Health</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-600 mb-2" />
                  Loading logs...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">
                  No monitoring logs found for selected filters.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="p-3 font-mono text-gray-700">
                    {new Date(log.timestamp).toISOString().replace('T', ' ').substring(0, 19)}
                  </td>
                  <td className="p-3">
                    <span className="font-semibold text-gray-900">{log.service_name}</span>
                    <span className="block text-[10px] text-gray-400 font-mono">{log.service_id}</span>
                  </td>
                  <td className="p-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                      log.status_code >= 200 && log.status_code < 300
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      HTTP {log.status_code}
                    </span>
                  </td>
                  <td className="p-3 font-medium text-gray-800">
                    {log.latency_ms !== null ? `${log.latency_ms} ms` : <span className="text-gray-400 italic">N/A</span>}
                  </td>
                  <td className="p-3 text-gray-600 font-mono text-[11px]">{log.agent}</td>
                  <td className="p-3 text-gray-600 font-mono text-[11px]">{log.region}</td>
                  <td className="p-3">
                    {log.is_successful ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Healthy
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-700 font-semibold text-[11px]">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" /> Outage
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-gray-50 text-xs">
        <span className="text-gray-500">
          Page <strong className="text-gray-900">{page}</strong> of <strong className="text-gray-900">{totalPages}</strong>
        </span>

        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1 || isLoading}
            onClick={() => setPage(page - 1)}
            className="p-1.5 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed text-gray-700"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            disabled={page >= totalPages || isLoading}
            onClick={() => setPage(page + 1)}
            className="p-1.5 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed text-gray-700"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}