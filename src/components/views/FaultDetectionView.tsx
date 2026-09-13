import React, { useState } from 'react';
import { useIoT } from '../../context/IoTContext';
import type { Severity } from '../../types/iot';
import {
  CheckCircle2,
  MapPin,
  Eye,
  ShieldAlert,
  Search,
  Clock,
  Zap,
  Activity,
} from 'lucide-react';

// Fault type category metadata
const FAULT_CATEGORIES = [
  { label: 'Lamp Failure',    type: 'lamp_failure',         icon: '💡', color: 'rose' },
  { label: 'Open Circuit',    type: 'open_circuit',         icon: '🔌', color: 'rose' },
  { label: 'Overcurrent',     type: 'overcurrent',          icon: '⚡', color: 'rose' },
  { label: 'Undervoltage',    type: 'undervoltage',         icon: '📉', color: 'amber' },
  { label: 'Overvoltage',     type: 'overvoltage',          icon: '📈', color: 'amber' },
  { label: 'Power Failure',   type: 'power_failure',        icon: '🚫', color: 'rose' },
  { label: 'Comm Timeout',    type: 'communication_failure',icon: '📡', color: 'slate' },
];

export const FaultDetectionView: React.FC = () => {
  const {
    streetLights,
    faultHistory,
    resolveFault,
    locatePoleOnMap,
    inspectPoleDetails,
  } = useIoT();

  const [severityFilter, setSeverityFilter] = useState<Severity | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const activeFaultyPoles = streetLights.filter(
    (l) => l.status === 'fault' || l.status === 'warning' || l.status === 'offline'
  );

  const filteredFaults = activeFaultyPoles.filter((light) => {
    const matchesSeverity = severityFilter === 'all' || light.severity === severityFilter;
    const matchesSearch =
      light.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      light.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      light.faultType.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  return (
    <div className="space-y-5 pb-16">
      {/* ── Page Header ── */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert className="h-5 w-5 text-rose-400 animate-pulse" />
              <h2 className="text-base font-bold text-white">IoT Fault Detection & Diagnostic Center</h2>
            </div>
            <p className="text-[11px] text-slate-600">
              Categorized failure detection powered by ACS712, ZMPT101B and LDR sensor telemetry via ESP32.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search fault type or Pole ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="tech-input pl-9 w-52 sm:w-64"
              />
            </div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as Severity | 'all')}
              className="tech-select"
            >
              <option value="all">All Severities</option>
              <option value="critical">🔴 Critical</option>
              <option value="high">🟠 High</option>
              <option value="medium">🟡 Medium</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Fault Category Summary ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {FAULT_CATEGORIES.map((item) => {
          const count = streetLights.filter((l) => l.faultType === item.type).length;
          const isActive = count > 0;
          return (
            <div
              key={item.type}
              className={`rounded-2xl border p-3 text-center transition-all ${
                isActive
                  ? item.color === 'rose'
                    ? 'border-rose-500/40 bg-rose-950/40 shadow-lg'
                    : item.color === 'amber'
                    ? 'border-amber-500/30 bg-amber-950/30'
                    : 'border-slate-600/40 bg-slate-900/60'
                  : 'border-white/5 bg-[#030914]/60 opacity-50'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <p className={`text-[10px] font-bold mt-1.5 leading-tight ${isActive ? 'text-slate-200' : 'text-slate-600'}`}>
                {item.label}
              </p>
              <span className={`text-xs font-black mt-1 block ${
                isActive
                  ? item.color === 'rose' ? 'text-rose-400' : item.color === 'amber' ? 'text-amber-400' : 'text-slate-400'
                  : 'text-slate-700'
              }`}>
                {count} Active
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Fault Cards ── */}
      {filteredFaults.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500/50 mb-3" />
          <h3 className="text-sm font-bold text-white">All Clear — No Active Faults</h3>
          <p className="mt-1 text-xs text-slate-600">All street light nodes are operating within normal electrical parameters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredFaults.map((light) => {
            const faultRec = faultHistory.find((f) => f.poleId === light.id && f.status !== 'resolved');
            const isCritical = light.severity === 'critical';
            const isWarning = light.status === 'warning';

            return (
              <div
                key={light.id}
                className={`relative rounded-2xl border p-5 transition-all hover:scale-[1.01] ${
                  isCritical
                    ? 'border-rose-500/50 bg-[#150206]/80'
                    : isWarning
                    ? 'border-amber-500/35 bg-[#160c02]/80'
                    : 'border-rose-500/30 bg-[#0f0208]/80'
                }`}
                style={{
                  boxShadow: isCritical
                    ? '0 0 30px rgba(255,59,92,0.1)'
                    : isWarning
                    ? '0 0 20px rgba(255,176,32,0.08)'
                    : '0 0 20px rgba(255,59,92,0.06)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                {/* Severity stripe */}
                <div className={`absolute top-0 left-0 w-1 h-full rounded-l-2xl ${
                  isCritical ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-rose-400'
                }`} />

                {/* Top bar */}
                <div className="flex items-center justify-between mb-4 pl-1">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isWarning ? 'bg-amber-400' : 'bg-rose-400'}`} />
                      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isWarning ? 'bg-amber-500' : 'bg-rose-500'}`} />
                    </span>
                    <span className="text-sm font-black text-white font-mono-tech">{light.id}</span>
                    <span className="text-[10px] text-slate-500">{light.esp32DeviceId}</span>
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                    isCritical
                      ? 'bg-rose-950/80 text-rose-400 border-rose-800/60'
                      : light.severity === 'high'
                      ? 'bg-amber-950/80 text-amber-400 border-amber-800/60'
                      : 'bg-slate-800/80 text-slate-400 border-slate-700'
                  }`}>
                    {light.severity}
                  </span>
                </div>

                {/* Fault type */}
                <div className="pl-1 mb-3">
                  <h3 className={`text-sm font-bold ${isCritical ? 'text-rose-300' : isWarning ? 'text-amber-300' : 'text-rose-300'}`}>
                    {light.faultType.replace(/_/g, ' ').toUpperCase()}
                  </h3>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3 text-cyan-500 shrink-0" />
                    {light.location}
                  </p>
                </div>

                {/* Sensor readings */}
                <div className="grid grid-cols-3 gap-2 rounded-xl bg-[#020617]/80 p-3 text-center mb-3 border border-white/3">
                  {[
                    { label: 'Voltage', value: `${light.voltage}V`, icon: Zap, color: 'text-amber-400' },
                    { label: 'Current', value: `${light.current}A`, icon: Activity, color: 'text-cyan-400' },
                    { label: 'Power',   value: `${light.power}W`,   icon: Zap, color: isCritical ? 'text-rose-400' : 'text-slate-200' },
                  ].map((s) => (
                    <div key={s.label}>
                      <span className="text-[9px] uppercase text-slate-600 block font-semibold">{s.label}</span>
                      <span className={`font-mono-tech font-bold text-xs ${s.color}`}>{s.value}</span>
                    </div>
                  ))}
                </div>

                {/* Timestamp */}
                <div className="flex items-center gap-1.5 text-[10px] text-slate-600 mb-3 pl-1">
                  <Clock className="h-3 w-3" />
                  <span>Detected: <strong className="text-slate-400">{faultRec?.detectedTime || light.lastUpdated}</strong></span>
                  <span className="ml-auto font-bold text-rose-500 uppercase">Unresolved</span>
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => inspectPoleDetails(light.id)}
                    className="btn-cyan text-[10px] py-2 rounded-lg"
                  >
                    <Eye className="h-3 w-3" /> Details
                  </button>
                  <button
                    onClick={() => locatePoleOnMap(light.id)}
                    className="btn-cyan text-[10px] py-2 rounded-lg"
                  >
                    <MapPin className="h-3 w-3" /> Locate
                  </button>
                  <button
                    onClick={() => resolveFault(light.id)}
                    className="btn-success text-[10px] py-2 rounded-lg"
                  >
                    <CheckCircle2 className="h-3 w-3" /> Resolve
                  </button>
                </div>

                {/* Description */}
                {faultRec?.description && (
                  <div className="mt-3 rounded-lg border border-white/5 bg-[#020617]/80 p-2.5 pl-1">
                    <p className="text-[10px] text-slate-500 leading-relaxed pl-2 border-l border-cyan-500/30">
                      {faultRec.description}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
