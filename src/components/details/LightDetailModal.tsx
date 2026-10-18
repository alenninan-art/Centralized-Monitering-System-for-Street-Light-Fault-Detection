import React from 'react';
import { useIoT } from '../../context/IoTContext';
import {
  X, MapPin, Cpu, Power, Clock,
  Zap, Thermometer, Sun, Radio, Activity, CheckCircle2, AlertTriangle,
} from 'lucide-react';

export const LightDetailModal: React.FC = () => {
  const {
    streetLights,
    selectedPoleId,
    isDetailModalOpen,
    setIsDetailModalOpen,
    toggleRelay,
    setDimming,
    resolveFault,
  } = useIoT();

  if (!isDetailModalOpen || !selectedPoleId) return null;

  const light = streetLights.find((l) => l.id === selectedPoleId);
  if (!light) return null;

  const statusCfg = {
    working: { border: 'border-emerald-800/50', bg: 'bg-emerald-950/50', text: 'text-emerald-400', pill: 'bg-emerald-950/70 text-emerald-400 border-emerald-800/50' },
    fault:   { border: 'border-rose-800/50',    bg: 'bg-rose-950/50',    text: 'text-rose-400',    pill: 'bg-rose-950/70 text-rose-400 border-rose-800/50 animate-pulse' },
    warning: { border: 'border-amber-800/50',   bg: 'bg-amber-950/50',   text: 'text-amber-400',   pill: 'bg-amber-950/70 text-amber-400 border-amber-800/50' },
    offline: { border: 'border-slate-700/50',   bg: 'bg-slate-800/50',   text: 'text-slate-400',   pill: 'bg-slate-800/70 text-slate-500 border-slate-700/50' },
  }[light.status] ?? { border: 'border-slate-700/50', bg: 'bg-slate-800/50', text: 'text-slate-400', pill: 'bg-slate-800/70 text-slate-500 border-slate-700/50' };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && setIsDetailModalOpen(false)}
    >
      <div className={`relative w-full max-w-2xl rounded-2xl border ${statusCfg.border} bg-[#050B18] p-6 shadow-2xl max-h-[92vh] overflow-y-auto`}
        style={{ boxShadow: '0 0 60px rgba(0,229,255,0.06), 0 40px 80px rgba(0,0,0,0.8)' }}
      >
        {/* Close */}
        <button
          onClick={() => setIsDetailModalOpen(false)}
          className="absolute right-4 top-4 rounded-xl border border-white/5 bg-slate-800/60 p-2 text-slate-500 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* ── Modal Header ── */}
        <div className={`flex items-center gap-4 rounded-xl border ${statusCfg.border} ${statusCfg.bg} p-4 mb-5`}>
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${statusCfg.border} text-xs font-black ${statusCfg.text}`}
            style={{ background: 'rgba(0,0,0,0.4)' }}
          >
            {light.id.split('-')[1]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-bold text-white">{light.name}</h2>
              <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border ${statusCfg.pill}`}>
                {light.status}
              </span>
              {light.status === 'fault' && (
                <span className="text-[9px] font-bold text-rose-300 bg-rose-950/50 border border-rose-800/40 px-2 py-0.5 rounded-full">
                  {light.faultType.replace(/_/g, ' ')}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
              <MapPin className="h-3 w-3 text-cyan-500" />
              {light.location} · {light.zone}
            </p>
          </div>
        </div>

        {/* ── Sensor Readings ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Voltage',    value: `${light.voltage}`,              unit: 'V',   icon: <Zap className="h-3.5 w-3.5 text-amber-400" />,       cls: 'text-amber-300' },
            { label: 'Current',    value: `${light.current.toFixed(2)}`,   unit: 'A',   icon: <Activity className="h-3.5 w-3.5 text-cyan-400" />,    cls: 'text-cyan-300' },
            { label: 'Power',      value: `${light.power}`,                unit: 'W',   icon: <Zap className="h-3.5 w-3.5 text-emerald-400" />,      cls: 'text-emerald-300' },
            { label: 'Energy',     value: `${light.energyConsumption}`,    unit: 'kWh', icon: <Activity className="h-3.5 w-3.5 text-violet-400" />,   cls: 'text-violet-300' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-white/5 bg-[#020617]/80 p-3 text-center">
              <div className="flex justify-center mb-1.5">{s.icon}</div>
              <div className="text-[9px] text-slate-600 font-bold uppercase tracking-wider">{s.label}</div>
              <div className={`font-mono-tech font-black text-lg mt-1 ${s.cls}`}>
                {s.value}
                <span className="text-[10px] text-slate-600 ml-0.5">{s.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Environment ── */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Temperature',  value: `${light.temperature}°C`,      icon: <Thermometer className="h-3 w-3 text-rose-400" />,   cls: 'text-rose-300' },
            { label: 'Light (LDR)',  value: `${light.lightIntensity}%`,    icon: <Sun className="h-3 w-3 text-amber-400" />,          cls: 'text-amber-300' },
            { label: 'Dimming',      value: `${light.dimmingLevel}%`,      icon: <Sun className="h-3 w-3 text-cyan-400" />,           cls: 'text-cyan-300' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-white/5 bg-[#020617]/50 p-3 flex items-center gap-2">
              {s.icon}
              <div>
                <div className="text-[9px] text-slate-600 font-semibold">{s.label}</div>
                <div className={`font-mono-tech font-bold text-sm ${s.cls}`}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          {/* Hardware Metadata */}
          <div className="rounded-xl border border-white/5 bg-[#020617]/50 p-4 space-y-2.5">
            <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-500 flex items-center gap-1.5 border-b border-white/5 pb-2">
              <Cpu className="h-3.5 w-3.5" /> Hardware Metadata
            </h4>
            {[
              { label: 'ESP32 Device ID',   value: light.esp32DeviceId,                            mono: true },
              { label: 'GPS Coordinates',   value: `${light.lat.toFixed(4)}°N, ${light.lng.toFixed(4)}°E`, mono: true },
              { label: 'Installation Date', value: light.installationDate,                         mono: false },
              { label: 'Last Telemetry',    value: light.lastUpdated,                              mono: false, highlight: 'text-emerald-400' },
            ].map((r) => (
              <div key={r.label} className="flex justify-between items-center text-[11px]">
                <span className="text-slate-600">{r.label}</span>
                <span className={`${r.mono ? 'font-mono-tech' : 'font-semibold'} ${r.highlight ?? 'text-slate-300'} text-right`}>{r.value}</span>
              </div>
            ))}
          </div>

          {/* Remote Control */}
          <div className="rounded-xl border border-white/5 bg-[#020617]/50 p-4 space-y-3">
            <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-500 flex items-center gap-1.5 border-b border-white/5 pb-2">
              <Power className="h-3.5 w-3.5" /> Remote Relay Control
            </h4>

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Relay State:</span>
              <button
                onClick={() => toggleRelay(light.id)}
                disabled={light.status === 'fault' || light.status === 'offline'}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[10px] font-black border transition-all disabled:opacity-30 ${
                  light.relayState
                    ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50 hover:bg-emerald-900/60'
                    : 'bg-slate-800/60 text-slate-500 border-slate-700/50 hover:bg-slate-700/60'
                }`}
              >
                <Power className="h-3 w-3" />
                {light.relayState ? 'ENERGIZED · ON' : 'DE-ENERGIZED · OFF'}
              </button>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1.5">
                <span className="text-slate-600 flex items-center gap-1"><Radio className="h-3 w-3" /> Dimming Level</span>
                <span className="font-mono-tech font-bold text-cyan-400">{light.dimmingLevel}%</span>
              </div>
              <input
                type="range" min="0" max="100" step="10"
                value={light.dimmingLevel}
                onChange={(e) => setDimming(light.id, Number(e.target.value))}
                disabled={!light.relayState || light.status === 'fault' || light.status === 'offline'}
                className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-cyan-400 disabled:opacity-30"
                style={{ background: `linear-gradient(to right, #00E5FF ${light.dimmingLevel}%, #1e293b ${light.dimmingLevel}%)` }}
              />
            </div>

            {(light.status === 'fault' || light.status === 'warning') && (
              <button
                onClick={() => { resolveFault(light.id); setIsDetailModalOpen(false); }}
                className="btn-success w-full justify-center rounded-xl py-2.5"
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Clear &amp; Resolve Fault
              </button>
            )}
          </div>
        </div>

        {/* ── IoT Pipeline ── */}
        <div className="rounded-xl border border-white/5 bg-[#020617]/50 p-4">
          <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-amber-500 flex items-center gap-1.5 border-b border-white/5 pb-2 mb-3">
            <Clock className="h-3.5 w-3.5" /> IoT Diagnostic Flow
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            {[
              { step: '1', label: 'Sensor Sampling',  value: 'ZMPT101B / ACS712',  cls: 'text-emerald-400' },
              { step: '2', label: 'ESP32 ADC Parse',  value: '12-bit Sampled',     cls: 'text-cyan-400' },
              { step: '3', label: 'Firebase Sync',    value: 'RT DB Connected',    cls: 'text-violet-400' },
              { step: '4', label: 'Dashboard',        value: light.status.toUpperCase(), cls: light.status === 'fault' ? 'text-rose-400' : 'text-emerald-400' },
            ].map((s) => (
              <div key={s.step} className="rounded-xl border border-white/4 bg-[#020617]/80 p-3">
                <div className="text-[8px] text-slate-700 font-black uppercase mb-1">Step {s.step}</div>
                <div className="text-[9px] text-slate-500 font-semibold mb-1.5">{s.label}</div>
                <div className={`text-[10px] font-bold ${s.cls}`}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Fault warning banner */}
        {light.status === 'fault' && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-800/50 bg-rose-950/40 p-3">
            <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <p className="text-[11px] font-bold text-rose-300">Active Fault Detected</p>
              <p className="text-[10px] text-rose-500 mt-0.5">
                Fault type: <strong className="text-rose-300">{light.faultType.replace(/_/g, ' ')}</strong>.
                Use the Resolve button above to restore this pole to working condition.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
