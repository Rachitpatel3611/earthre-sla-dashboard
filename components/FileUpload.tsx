'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileCheck, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { ProcessingReport } from '@/lib/types';

interface FileUploadProps {
  onUploadSuccess: () => void;
}

export default function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<ProcessingReport | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSubmit = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setErrorMessage('Please upload a valid .csv file.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setReport(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setReport(data.report);
      onUploadSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while uploading.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSubmit(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-indigo-600" />
            Upload Monitoring Log Dataset
          </h2>
          <p className="text-sm text-gray-500">
            Upload CSV logs to feed the stateless serverless processing pipeline.
          </p>
        </div>
      </div>

      {/* Drag and Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/50'
            : 'border-gray-300 hover:border-indigo-400 bg-gray-50/50'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => e.target.files?.[0] && handleFileSubmit(e.target.files[0])}
          accept=".csv"
          className="hidden"
        />

        {isLoading ? (
          <div className="flex flex-col items-center py-4">
            <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin mb-2" />
            <p className="text-sm font-medium text-gray-700">Cleaning & Normalizing Dataset...</p>
            <p className="text-xs text-gray-400">Parsing Unix timestamps, latency units & deduplicating records</p>
          </div>
        ) : (
          <div className="flex flex-col items-center py-4">
            <UploadCloud className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-sm font-semibold text-gray-700">
              Drag & Drop your CSV file here, or <span className="text-indigo-600 underline">browse</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Supports <code className="bg-gray-100 px-1 py-0.5 rounded">monitoring_checks_*.csv</code> files
            </p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700 text-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Processing Report */}
      {report && (
        <div className="mt-6 p-4 bg-emerald-50/60 border border-emerald-200 rounded-lg">
          <div className="flex items-center justify-between border-b border-emerald-200/60 pb-3 mb-3">
            <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Dataset Successfully Cleaned & Persisted!
            </div>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-medium px-2.5 py-1 rounded-full">
              {report.validRows.toLocaleString()} valid checks
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center mb-4 text-xs font-medium">
            <div className="bg-white p-2.5 rounded border border-emerald-100 shadow-xs">
              <span className="block text-gray-500">Total Raw Rows</span>
              <span className="text-sm font-bold text-gray-800">{report.totalRows.toLocaleString()}</span>
            </div>
            <div className="bg-white p-2.5 rounded border border-emerald-100 shadow-xs">
              <span className="block text-gray-500">Valid Ingested</span>
              <span className="text-sm font-bold text-emerald-700">{report.validRows.toLocaleString()}</span>
            </div>
            <div className="bg-white p-2.5 rounded border border-emerald-100 shadow-xs">
              <span className="block text-gray-500">Corrupted / Skipped</span>
              <span className="text-sm font-bold text-amber-600">{report.corruptedRows}</span>
            </div>
          </div>

          {report.dataQualityIssues.length > 0 && (
            <div>
              <p className="text-xs font-bold text-emerald-900 mb-1.5">Data Quality Issues Resolved:</p>
              <ul className="text-xs text-emerald-800 space-y-1 list-disc list-inside">
                {report.dataQualityIssues.map((issue, idx) => (
                  <li key={idx}>{issue}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}