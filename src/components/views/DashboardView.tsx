import React, { useState } from 'react';
import { useIoT } from '../../context/IoTContext';
import type { LightStatus } from '../../types/iot';
import {
  Lightbulb,
  AlertTriangle,
  WifiOff,
  CheckCircle2,
  Zap,
  MapPin,
  Eye,
  Search,
  ShieldAlert,
  Activity,
  TrendingDown,
  TrendingUp,
  Flame,
  Radio,
  Clock,
} from 'lucide-react';

// ── Status Badge ────────────────────────────────────────────────────
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  if (status === 'working')
    return (
      <span className="badge-working">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
        Working
      </span>
    );
  if (status === 'fault')
    return (
      <span className="badge-fault">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-400 inline-block animate-ping" />
        Fault
      </span>
    );
  if (status === 'warning')
    return (
      <span className="badge-warning">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 inline-block" />
        Warning
      </span>
    );
  return (
    <span className="badge-offline">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-500 inline-block" />
      Offline
    </span>
  );
};

// ── Dashboard View ──────────────────────────────────────────────────
export const DashboardView: React.FC = () => {
  const {
    streetLights,
    systemStats,
    faultHistory,
    locatePoleOnMap,
    inspectPoleDetails,
    resolveFault,
    setActiveTab,
  } = useIoT();

  const [statusFilter, setStatusFilter] = useState<LightStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredLights = streetLights.filter((light) => {
    if (!light?.id) return false; // guard against partial Firebase objects
    const matchesStatus = statusFilter === 'all' || light.status === statusFilter;
    const matchesSearch =
      (light.id ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (light.location ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (light.zone ?? '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const activeFaults = streetLights.filter(
    (l) => l.status === 'fault' || l.status === 'warning'
  );

  const healthPct = systemStats.totalLights > 0
    ? Math.round((systemStats.workingCount / systemStats.totalLights) * 100)
    : 0;
  const faultPct = systemStats.totalLights > 0
    ? Math.round((systemStats.faultCount / systemStats.totalLights) * 100)
    : 0;
  const offlinePct = systemStats.totalLights > 0
    ? Math.round((systemStats.offlineCount / systemStats.totalLights) * 100)
    : 0;

  return (
    <div className="space-y-5 pb-16">

      {/* ── HERO SECTION ─────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden glass-card p-6 md:p-8"
        style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.04) 0%, rgba(5,15,35,0.9) 40%, rgba(139,92,246,0.04) 100%)' }}
      >
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(0,229,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.03) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            {/* Section label */}
            <div className="flex items-center gap-2 mb-3">
              <span className="section-label">Smart City Operations</span>
              <div className="h-px flex-1 bg-gradient-to-r from-cyan-500/30 to-transparent max-w-24" />
            </div>

            <h2 className="hero-title leading-tight">
              SMARTER LIGHTS,<br />BRIGHTER TOMORROWS
            </h2>
            <p className="hero-subtitle mt-2 max-w-lg">
              Real-time street light monitoring, intelligent fault detection
              and accurate GPS location tracking.
            </p>
          </div>

          <div className="flex flex-col gap-3 shrink-0">
            {/* System Status */}
            <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-950/30 px-4 py-3">
              <div className="relative h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 pulse-dot-emerald" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Live Network Monitoring</p>
                <p className="text-[10px] text-emerald-600 font-medium">● System Operational</p>
              </div>
            </div>

            {/* Fault Alert */}
            {systemStats.faultCount > 0 && (
              <div className="flex items-center gap-2.5 rounded-xl border border-rose-500/25 bg-rose-950/30 px-4 py-2"
                style={{ boxShadow: '0 0 20px rgba(255,59,92,0.08)' }}
              >
                <ShieldAlert className="h-4 w-4 text-rose-400 animate-pulse shrink-0" />
                <p className="text-xs font-bold text-rose-300">
                  {systemStats.faultCount} Active Fault{systemStats.faultCount > 1 ? 's' : ''} — Action Required
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── STAT CARDS ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total */}
        <div className="glass-card rounded-2xl p-5 group cursor-default">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="section-label mb-1">Total Street Lights</p>
              <p className="stat-number text-white">{systemStats.totalLights}</p>
            </div>
            <div className="rounded-xl bg-cyan-950/60 p-2.5 border border-cyan-500/20 group-hover:border-cyan-500/40 transition-colors">
              <Lightbulb className="h-5 w-5 text-cyan-400" />
            </div>
          </div>
          <div className="tech-divider mb-3" />
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Nodes Deployed</span>
            <span className="text-cyan-400 font-bold">Grid Coverage: 100%</span>
          </div>
          <div className="mt-2 progress-bar-bg h-1">
            <div className="progress-bar-fill" style={{ width: '100%' }} />
          </div>
        </div>

        {/* Working */}
        <div className="glass-card-success rounded-2xl p-5 group cursor-default">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="section-label mb-1 text-emerald-500/70">Working</p>
              <p className="stat-number glow-text-emerald">{systemStats.workingCount}</p>
            </div>
            <div className="rounded-xl bg-emerald-950/60 p-2.5 border border-emerald-500/25 group-hover:border-emerald-500/50 transition-colors">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            </div>
          </div>
          <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, rgba(0,245,160,0.2), transparent)' }} className="mb-3" />
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-emerald-600">Normal Voltage Range</span>
            <span className="font-bold text-emerald-400 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> {healthPct}% Healthy
            </span>
          </div>
          <div className="mt-2 h-1 rounded-full overflow-hidden bg-emerald-950/50">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300 transition-all duration-700" style={{ width: `${healthPct}%` }} />
          </div>
        </div>

        {/* Faulty */}
        <div className="glass-card-danger rounded-2xl p-5 group cursor-default">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="section-label mb-1 text-rose-500/70">Faults Detected</p>
              <p className="stat-number glow-text-rose">{systemStats.faultCount}</p>
            </div>
            <div className={`rounded-xl bg-rose-950/60 p-2.5 border border-rose-500/25 ${systemStats.faultCount > 0 ? 'animate-pulse' : ''}`}>
              <AlertTriangle className="h-5 w-5 text-rose-400" />
            </div>
          </div>
          <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, rgba(255,59,92,0.2), transparent)' }} className="mb-3" />
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-rose-600">Failure Alerts Active</span>
            <button onClick={() => setActiveTab('fault_detection')} className="font-bold text-rose-400 hover:text-rose-300 transition-colors">
              Review Faults →
            </button>
          </div>
          {systemStats.faultCount > 0 && (
            <div className="mt-2 h-1 rounded-full overflow-hidden bg-rose-950/50">
              <div className="h-full rounded-full bg-gradient-to-r from-rose-500 to-rose-400 transition-all duration-700" style={{ width: `${faultPct}%` }} />
            </div>
          )}
        </div>

        {/* Offline */}
        <div className="glass-card rounded-2xl p-5 group cursor-default">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="section-label mb-1">Offline / Comm Lost</p>
              <p className="stat-number text-slate-400">{systemStats.offlineCount}</p>
            </div>
            <div className="rounded-xl bg-slate-800/60 p-2.5 border border-slate-700/50">
              <WifiOff className="h-5 w-5 text-slate-500" />
            </div>
          </div>
          <div className="tech-divider mb-3" />
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-600">ESP32 Ping Timeout</span>
            <span className="text-slate-500 font-medium">MQTT Gateway</span>
          </div>
          {systemStats.offlineCount > 0 && (
            <div className="mt-2 h-1 rounded-full overflow-hidden bg-slate-800/50">
              <div className="h-full rounded-full bg-slate-500 transition-all duration-700" style={{ width: `${offlinePct}%` }} />
            </div>
          )}
        </div>
      </div>

      {/* ── POWER METRICS ────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-4 flex items-center gap-4">
          <div className="rounded-xl bg-cyan-950/60 p-3 border border-cyan-500/20 shrink-0">
            <Zap className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <p className="section-label">Total Power Load</p>
            <p className="text-lg font-black text-white mt-1 font-mono-tech">
              {systemStats.totalPowerWatts} W
              <span className="text-xs text-slate-500 ml-1 font-sans font-medium">({(systemStats.totalPowerWatts / 1000).toFixed(2)} kW)</span>
            </p>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-4 flex items-center gap-4">
          <div className="rounded-xl bg-emerald-950/60 p-3 border border-emerald-500/20 shrink-0">
            <TrendingDown className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <p className="section-label text-emerald-500/70">Energy Efficiency</p>
            <p className="text-lg font-black text-emerald-400 mt-1">
              {systemStats.energySavedPercent}%
              <span className="text-xs text-slate-500 ml-1 font-medium">Dimming Savings</span>
            </p>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-4 flex items-center gap-4">
          <div className="rounded-xl bg-amber-950/60 p-3 border border-amber-500/20 shrink-0">
            <Flame className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <p className="section-label text-amber-500/70">Average Grid Voltage</p>
            <p className="text-lg font-black text-slate-200 mt-1 font-mono-tech">
              {systemStats.avgVoltage} V
              <span className="text-xs text-slate-500 ml-1 font-sans font-medium">AC / 50 Hz</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── MIDDLE: Map CTA + Critical Faults ──────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map CTA */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-5 relative overflow-hidden cursor-pointer group"
          onClick={() => setActiveTab('map')}
          style={{ minHeight: '200px' }}
        >
          <div className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 60% 50%, rgba(0,229,255,0.06) 0%, transparent 60%)',
            }}
          />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-cyan-400" />
                <span className="text-sm font-bold text-white">Live Location Map</span>
                <span className="rounded-full bg-cyan-950/60 px-2 py-0.5 text-[10px] text-cyan-400 border border-cyan-800/40 font-bold">
                  GPS ACTIVE
                </span>
              </div>
              <span className="text-[11px] text-cyan-500 font-semibold group-hover:text-cyan-300 transition-colors">
                Open Full Map →
              </span>
            </div>

            {/* Map legend preview */}
            <div className="flex flex-wrap gap-3 mb-4">
              {[
                { label: 'Working', color: 'bg-emerald-500', count: systemStats.workingCount },
                { label: 'Fault', color: 'bg-rose-500', count: systemStats.faultCount },
                { label: 'Warning', color: 'bg-amber-500', count: systemStats.warningCount },
                { label: 'Offline', color: 'bg-slate-500', count: systemStats.offlineCount },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1.5 text-[11px]">
                  <span className={`h-2.5 w-2.5 rounded-full ${item.color}`}
                    style={{ boxShadow: item.color.includes('rose') ? '0 0 6px rgba(255,59,92,0.6)' : item.color.includes('emerald') ? '0 0 6px rgba(0,245,160,0.5)' : undefined }}
                  />
                  <span className="text-slate-400 font-medium">{item.label}</span>
                  <span className="font-bold text-slate-300">{item.count}</span>
                </div>
              ))}
            </div>

            {/* Abstract "map" visual */}
            <div className="relative h-28 rounded-xl overflow-hidden border border-white/5 bg-[#020617]/80">
              <div className="absolute inset-0"
                style={{
                  backgroundImage: 'linear-gradient(rgba(0,229,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.04) 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              />
              {/* Road corridor */}
              <div className="absolute inset-x-0 top-[34%] h-[32%] border-y border-slate-500/20 bg-slate-800/70">
                <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-slate-400/35" />
              </div>
              {/* Streetlights aligned along both road edges */}
              {streetLights.slice(0, 18).map((l, i) => (
                <div key={l.id}
                  className={`absolute h-2 w-2 rounded-full ${l.status === 'working' ? 'bg-emerald-500' : l.status === 'fault' ? 'bg-rose-500 animate-pulse' : l.status === 'warning' ? 'bg-amber-500' : 'bg-slate-600'}`}
                  style={{
                    left: `${5 + (i % 9) * 11}%`,
                    top: `${25 + Math.floor(i / 9) * 50}%`,
                    boxShadow: l.status === 'fault' ? '0 0 8px rgba(255,59,92,0.7)' : l.status === 'working' ? '0 0 4px rgba(0,245,160,0.5)' : 'none',
                  }}
                />
              ))}
              <div className="absolute bottom-2 right-3 text-[10px] text-slate-600 font-mono">
                {systemStats.totalLights} nodes plotted
              </div>
            </div>
          </div>
        </div>

        {/* Critical Faults Panel */}
        <div className="glass-card rounded-2xl p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-rose-400" />
              <span className="text-xs font-bold text-white">Critical Faults</span>
            </div>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
              activeFaults.length > 0
                ? 'bg-rose-950/60 text-rose-400 border-rose-800/40'
                : 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40'
            }`}>
              {activeFaults.length === 0 ? 'All Clear' : `${activeFaults.length} Active`}
            </span>
          </div>

          <div className="flex-1 space-y-2.5 overflow-y-auto max-h-60 pr-1">
            {activeFaults.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <CheckCircle2 className="h-8 w-8 text-emerald-500/50" />
                <p className="text-xs text-slate-600 text-center">No active faults.<br />All nodes operational.</p>
              </div>
            ) : (
              activeFaults.map((light) => {
                const faultRec = faultHistory.find((f) => f.poleId === light.id && f.status !== 'resolved');
                return (
                  <div key={light.id}
                    className={`rounded-xl p-3 border transition-all ${
                      light.severity === 'critical'
                        ? 'border-rose-500/30 bg-rose-950/30'
                        : light.status === 'warning'
                        ? 'border-amber-500/25 bg-amber-950/20'
                        : 'border-rose-500/20 bg-rose-950/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`flex h-2 w-2 shrink-0 relative ${light.severity === 'critical' ? 'mt-0.5' : ''}`}>
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${light.status === 'warning' ? 'bg-amber-400' : 'bg-rose-400'}`} />
                          <span className={`relative inline-flex rounded-full h-2 w-2 ${light.status === 'warning' ? 'bg-amber-400' : 'bg-rose-500'}`} />
                        </span>
                        <div>
                          <p className="text-xs font-bold text-white">{light.id}</p>
                          <p className="text-[10px] text-slate-500 leading-tight">{light.location.split('-')[0].trim()}</p>
                        </div>
                      </div>
                      <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border shrink-0 ${
                        light.severity === 'critical' ? 'bg-rose-950 text-rose-400 border-rose-800/60' :
                        light.severity === 'high' ? 'bg-amber-950 text-amber-400 border-amber-800/60' :
                        'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>{light.severity}</span>
                    </div>
                    <p className="text-[11px] text-rose-300 font-semibold mt-1.5">
                      {light.faultType.replace(/_/g, ' ')}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => inspectPoleDetails(light.id)} className="btn-cyan text-[10px] px-2 py-1 rounded-lg">Details</button>
                      <button onClick={() => locatePoleOnMap(light.id)} className="btn-cyan text-[10px] px-2 py-1 rounded-lg">Locate</button>
                      <button onClick={() => resolveFault(light.id)} className="btn-success text-[10px] px-2 py-1 rounded-lg">Resolve</button>
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-600">
                      <Clock className="h-3 w-3" />
                      <span>Detected: {faultRec?.detectedTime || light.lastUpdated}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {activeFaults.length > 0 && (
            <button onClick={() => setActiveTab('fault_detection')} className="mt-3 w-full text-center text-[11px] font-bold text-rose-400 hover:text-rose-300 transition-colors pt-2 border-t border-white/5">
              View All Faults →
            </button>
          )}
        </div>
      </div>

      {/* ── LIVE STREET LIGHT TABLE ─────────────────── */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {/* Table Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 border-b border-white/5">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Live Street Light Status Directory</h3>
              <span className="rounded-full bg-cyan-950/60 px-2 py-0.5 text-[10px] text-cyan-400 border border-cyan-800/40 font-bold flex items-center gap-1">
                <Radio className="h-2.5 w-2.5" /> LIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Real-time electrical telemetry from ESP32 edge sensor nodes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search pole or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="tech-input pl-9 w-56 sm:w-64"
              />
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1 rounded-xl bg-[#020617] p-1 border border-white/5">
              {(['all', 'working', 'fault', 'offline'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide transition-all ${
                    statusFilter === st
                      ? st === 'fault'
                        ? 'bg-rose-600/80 text-white shadow-md'
                        : st === 'working'
                        ? 'bg-emerald-600/70 text-white shadow-md'
                        : st === 'offline'
                        ? 'bg-slate-700 text-white'
                        : 'bg-cyan-500/80 text-slate-950 shadow-md'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="tech-table w-full text-left text-xs">
            <thead className="bg-[#020617]/80 border-b border-white/5">
              <tr>
                {['Pole ID', 'Location & Zone', 'Status', 'Voltage', 'Current', 'Power', 'LDR / Light', 'Last Updated', 'Actions'].map((h, i) => (
                  <th key={h} className={`py-3 px-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-600 ${i === 8 ? 'text-right' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/3">
              {filteredLights.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-600 text-xs">
                    No street lights found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredLights.map((light) => (
                  <tr key={light.id} className="hover:bg-white/2 transition-colors group">
                    {/* Pole ID */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                          light.status === 'working' ? 'bg-emerald-400' :
                          light.status === 'fault' ? 'bg-rose-400 animate-pulse' :
                          light.status === 'warning' ? 'bg-amber-400' : 'bg-slate-600'
                        }`} />
                        <span className="font-bold text-white text-xs font-mono-tech">{light.id}</span>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-200 text-xs leading-none">{light.location}</p>
                      <p className="text-[10px] text-slate-600 mt-0.5">{light.zone}</p>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <StatusBadge status={light.status} />
                    </td>

                    {/* Voltage */}
                    <td className="py-3.5 px-4 font-mono-tech font-semibold text-slate-300 text-xs">
                      {light.voltage} V
                    </td>

                    {/* Current */}
                    <td className="py-3.5 px-4 font-mono-tech font-semibold text-slate-300 text-xs">
                      {light.current.toFixed(2)} A
                    </td>

                    {/* Power */}
                    <td className="py-3.5 px-4 font-mono-tech font-semibold text-cyan-400 text-xs">
                      {light.power} W
                    </td>

                    {/* LDR */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full overflow-hidden bg-slate-800">
                          <div
                            className="h-full rounded-full bg-amber-400 transition-all duration-500"
                            style={{ width: `${light.lightIntensity}%` }}
                          />
                        </div>
                        <span className="font-mono-tech text-[10px] text-slate-400 font-semibold">{light.lightIntensity}%</span>
                      </div>
                    </td>

                    {/* Updated */}
                    <td className="py-3.5 px-4 text-[11px] text-slate-600 font-medium">{light.lastUpdated}</td>

                    {/* Actions */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => locatePoleOnMap(light.id)}
                          className="rounded-xl border border-white/5 bg-cyan-950/40 p-2 text-cyan-500 hover:border-cyan-500/40 hover:text-cyan-300 transition-all"
                          title="Locate on Map"
                        >
                          <MapPin className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => inspectPoleDetails(light.id)}
                          className="rounded-xl border border-white/5 bg-slate-800/50 p-2 text-slate-400 hover:border-slate-500/50 hover:text-white transition-all"
                          title="View Details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        <div className="px-5 py-3 border-t border-white/3 flex items-center justify-between">
          <p className="text-[11px] text-slate-600">
            Showing <strong className="text-slate-400">{filteredLights.length}</strong> of <strong className="text-slate-400">{streetLights.length}</strong> nodes
          </p>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
            <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
            <span>Live telemetry — updates every 4s</span>
          </div>
        </div>
      </div>
    </div>
  );
};
