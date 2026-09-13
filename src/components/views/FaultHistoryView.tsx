import React, { useState } from 'react';
import { useIoT } from '../../context/IoTContext';
import { History, Search, Download, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

export const FaultHistoryView: React.FC = () => {
  const { faultHistory, resolveFault } = useIoT();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredHistory = faultHistory.filter((rec) => {
    const matchesStatus = statusFilter === 'all' || rec.status === statusFilter;
    const matchesType   = typeFilter === 'all'   || rec.faultType === typeFilter;
    const matchesSearch =
      rec.faultId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.poleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.faultTypeName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  const handleExportCSV = () => {
    const headers = ['Fault ID','Pole ID','Fault Type','Location','Detected Time','Resolved Time','Status','Description'];
    const rows = filteredHistory.map((rec) => [
      rec.faultId, rec.poleId, rec.faultTypeName,
      `"${rec.location}"`, rec.detectedTime,
      rec.resolvedTime || 'N/A', rec.status, `"${rec.description}"`
    ]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('download', `Fault_History_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resolved   = faultHistory.filter(r => r.status === 'resolved').length;
  const unresolved = faultHistory.filter(r => r.status === 'unresolved').length;

  return (
    <div className="space-y-5 pb-16">
      {/* ── Header ── */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <History className="h-5 w-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white">Historical Fault Audit Log</h2>
            </div>
            <p className="text-[11px] text-slate-600">
              Immutable log of all detected fault events, timestamps, maintenance actions, and resolution records.
            </p>
          </div>
          <button
            onClick={handleExportCSV}
            className="btn-cyan shrink-0 rounded-xl"
          >
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* ── Stats strip ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Records', value: faultHistory.length, cls: 'text-cyan-400' },
          { label: 'Resolved',      value: resolved,             cls: 'text-emerald-400' },
          { label: 'Unresolved',    value: unresolved,           cls: unresolved > 0 ? 'text-rose-400' : 'text-slate-500' },
        ].map(s => (
          <div key={s.label} className="glass-card rounded-xl p-3 text-center">
            <p className={`text-xl font-black font-mono-tech ${s.cls}`}>{s.value}</p>
            <p className="text-[10px] text-slate-600 font-semibold mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="glass-card rounded-2xl p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search Fault ID, Pole, Location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="tech-input pl-9 w-full"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="tech-select">
          <option value="all">All Statuses</option>
          <option value="unresolved">🔴 Unresolved</option>
          <option value="resolved">🟢 Resolved</option>
          <option value="under_maintenance">🟠 Maintenance</option>
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="tech-select">
          <option value="all">All Fault Types</option>
          <option value="lamp_failure">Lamp Failure</option>
          <option value="overcurrent">Overcurrent</option>
          <option value="undervoltage">Undervoltage</option>
          <option value="overvoltage">Overvoltage</option>
          <option value="power_failure">Power Failure</option>
          <option value="communication_failure">Comm Timeout</option>
        </select>
        <span className="text-[11px] text-slate-600 font-medium ml-auto">
          {filteredHistory.length} record{filteredHistory.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Table ── */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="tech-table w-full text-left text-xs">
            <thead className="bg-[#020617]/80 border-b border-white/5">
              <tr>
                {['Fault ID','Pole ID','Fault Type','Location','Detected','Resolved','Status','Action'].map((h, i) => (
                  <th key={h} className={`py-3 px-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-600 ${i === 7 ? 'text-right' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/3">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-600 text-xs">
                    No fault records match your current filters.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((rec) => (
                  <tr key={rec.faultId} className="hover:bg-white/2 transition-colors">
                    {/* Fault ID */}
                    <td className="py-3.5 px-4 font-mono-tech font-bold text-cyan-400 text-xs">{rec.faultId}</td>

                    {/* Pole ID */}
                    <td className="py-3.5 px-4 font-bold text-white text-xs">{rec.poleId}</td>

                    {/* Fault Type */}
                    <td className="py-3.5 px-4">
                      <span className="text-[11px] font-semibold text-rose-300">{rec.faultTypeName}</span>
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4 text-slate-400 text-[11px] max-w-36 truncate">{rec.location}</td>

                    {/* Detected */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-[11px] text-slate-500">
                        <Clock className="h-3 w-3" />
                        {rec.detectedTime}
                      </div>
                    </td>

                    {/* Resolved */}
                    <td className="py-3.5 px-4 text-[11px]">
                      {rec.resolvedTime ? (
                        <span className="text-emerald-400 font-semibold font-mono-tech">{rec.resolvedTime}</span>
                      ) : (
                        <span className="text-slate-700 italic">—</span>
                      )}
                    </td>

                    {/* Status badge */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase border ${
                        rec.status === 'resolved'
                          ? 'bg-emerald-950/70 text-emerald-400 border-emerald-800/50'
                          : rec.status === 'unresolved'
                          ? 'bg-rose-950/70 text-rose-400 border-rose-800/50 animate-pulse'
                          : 'bg-amber-950/70 text-amber-400 border-amber-800/50'
                      }`}>
                        {rec.status === 'resolved'   && <CheckCircle2 className="h-2.5 w-2.5" />}
                        {rec.status === 'unresolved' && <AlertTriangle className="h-2.5 w-2.5" />}
                        {rec.status.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      {rec.status !== 'resolved' ? (
                        <button
                          onClick={() => resolveFault(rec.poleId)}
                          className="btn-success text-[10px] rounded-xl py-1.5 px-3"
                        >
                          <CheckCircle2 className="h-3 w-3" /> Resolve
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-700">Archived</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredHistory.length > 0 && (
          <div className="px-5 py-3 border-t border-white/3 flex items-center justify-between">
            <p className="text-[11px] text-slate-600">
              {resolved} resolved · {unresolved} unresolved
            </p>
            <button onClick={handleExportCSV} className="text-[11px] text-cyan-600 hover:text-cyan-400 font-semibold transition-colors">
              Export filtered →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
