'use client';

import React, { useState, useEffect } from 'react';
import FileUpload from '@/components/FileUpload';
import StatsOverview from '@/components/StatsOverview';
import LogsTable from '@/components/LogsTable';
import { DashboardStatsSummary } from '@/lib/types';
import { Activity } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStatsSummary | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchStats = async () => {
    setIsLoadingStats(true);
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to load SLA stats:', err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  const handleUploadSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <main className="min-h-screen bg-gray-50/50 pb-16">
      {/* Navbar Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-sm">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">EarthRe</h1>
              <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wider">
                SLA Monitoring & Billing Credit Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              Stateless Engine Active
            </span>
          </div>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* 1. Upload UI */}
        <FileUpload onUploadSuccess={handleUploadSuccess} />

        {/* 2. Top Section: Collapsible SLA Stats */}
        <StatsOverview stats={stats} isLoading={isLoadingStats} />

        {/* 3. Bottom Section: Filterable Logs View */}
        <LogsTable refreshTrigger={refreshTrigger} />

      </div>
    </main>
  );
}