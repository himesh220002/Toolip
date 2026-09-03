'use client';

import React, { useState } from 'react';
import { Table, Download, Copy, Check } from 'lucide-react';

export const TableToCsv: React.FC = () => {
  const [tableInput, setTableInput] = useState<string>(
    'Name\tRole\tDepartment\nAlex\tEngineer\tProduct\nSarah\tManager\tOperations\nDavid\tDesigner\tUX'
  );
  const [csvOutput, setCsvOutput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const convertToCsv = () => {
    const lines = tableInput.split(/\r?\n/).filter(Boolean);
    const csvRows = lines.map((line) => {
      const cols = line.includes('\t')
        ? line.split('\t')
        : line.includes(',')
        ? line.split(',')
        : line.split(/\s{2,}/);
      return cols.map((c) => `"${c.trim().replace(/"/g, '""')}"`).join(',');
    });

    const result = csvRows.join('\n');
    setCsvOutput(result);
  };

  const downloadCsv = () => {
    convertToCsv();
    const content = csvOutput || tableInput;
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `table_export_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-300">
          Paste Raw Table (Tab-separated, Comma-separated, or Space-separated):
        </label>
        <textarea
          value={tableInput}
          onChange={(e) => setTableInput(e.target.value)}
          rows={8}
          className="w-full p-4 bg-gray-950 border border-gray-800 rounded-xl font-mono text-xs text-sky-200 focus:outline-none resize-none leading-relaxed"
        />
      </div>

      <div className="flex space-x-3">
        <button
          onClick={convertToCsv}
          className="flex-1 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs transition-colors"
        >
          Parse Table to CSV
        </button>

        <button
          onClick={downloadCsv}
          className="flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg"
        >
          <Download className="h-4 w-4" />
          <span>Download .CSV File for Excel</span>
        </button>
      </div>

      {csvOutput && (
        <div className="p-4 bg-gray-950 border border-gray-800 rounded-xl space-y-2">
          <div className="text-xs text-emerald-400 font-semibold">Generated CSV Output:</div>
          <pre className="p-3 bg-gray-900 rounded-lg font-mono text-xs text-emerald-300 overflow-x-auto">
            {csvOutput}
          </pre>
        </div>
      )}
    </div>
  );
};
