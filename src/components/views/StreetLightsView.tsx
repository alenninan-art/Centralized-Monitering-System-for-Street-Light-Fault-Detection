import React, { useState } from 'react';
import { useIoT } from '../../context/IoTContext';
import {
  Lightbulb,
  Search,
  Power,
  Sliders,
  MapPin,
  Eye,
  Cpu,
  Radio,
  Zap,
  Sun,
  Thermometer,
} from 'lucide-react';

export const StreetLightsView: React.FC = () => {
  const {
    streetLights,
    toggleRelay,
    setDimming,
    locatePoleOnMap,
    inspectPoleDetails,
  } = useIoT();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedZone, setSelectedZone] = useState<string>('all');

  const zones = Array.from(new Set(streetLights.map((l) => l.zone)));

  const filteredLights = streetLights.filter((light) => {
    const matchesZone = selectedZone === 'all' || light.zone === selectedZone;
    const matchesSearch =
      light.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      light.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      light.esp32DeviceId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesZone && matchesSearch;
  });

  const statusBorder = (status: string) => {
    if (status === 'fault') return 'border-rose-500/40 bg-[#150206]/70';
    if (status === 'warning') return 'border-amber-500/30 bg-[#160c02]/60';
    if (status === 'offline') return 'border-slate-700/30 bg-[#0a0f1a]/60 opacity-70';
    return 'border-white/6 bg-[#050f23]/60';
  };

  return (
    <div className="space-y-5 pb-16">
      {/* ── Page Header ── */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Lightbulb className="h-5 w-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white">Street Light Nodes & Remote Control</h2>
              <span className="rounded-full bg-cyan-950/60 px-2 py-0.5 text-[10px] text-cyan-400 border border-cyan-800/40 font-bold">
                {streetLights.length} NODES
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              Control individual relay states, dimming profiles, and inspect hardware telemetry.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Filter poles or ESP32 ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="tech-input pl-9 w-52 sm:w-64"
              />
            </div>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="tech-select"
            >
              <option value="all">All Zones ({zones.length})</option>
              {zones.map((z) => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Zone summary strip ── */}
      <div className="flex flex-wrap gap-2 text-[11px]">
        {[
          { label: 'Working', count: streetLights.filter(l => l.status === 'working').length, cls: 'bg-emerald-950/50 text-emerald-400 border-emerald-800/40' },
          { label: 'Fault',   count: streetLights.filter(l => l.status === 'fault').length,   cls: 'bg-rose-950/50 text-rose-400 border-rose-800/40' },
          { label: 'Warning', count: streetLights.filter(l => l.status === 'warning').length,  cls: 'bg-amber-950/50 text-amber-400 border-amber-800/40' },
          { label: 'Offline', count: streetLights.filter(l => l.status === 'offline').length,  cls: 'bg-slate-800/50 text-slate-400 border-slate-700/40' },
        ].map(s => (
          <span key={s.label} className={`rounded-lg px-3 py-1.5 font-bold border ${s.cls}`}>
            {s.label}: {s.count}
          </span>
        ))}
        <span className="ml-auto text-[11px] text-slate-600 self-center font-medium">
          Showing {filteredLights.length} / {streetLights.length} nodes
        </span>
      </div>

      {/* ── Node Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredLights.map((light) => (
          <div
            key={light.id}
            className={`relative rounded-2xl border p-5 transition-all duration-200 hover:scale-[1.01] ${statusBorder(light.status)}`}
            style={{ backdropFilter: 'blur(20px)' }}
          >
            {/* Status stripe */}
            <div className={`absolute top-0 left-0 w-1 h-full rounded-l-2xl ${
              light.status === 'fault' ? 'bg-rose-500' :
              light.status === 'warning' ? 'bg-amber-500' :
              light.status === 'offline' ? 'bg-slate-700' :
              'bg-cyan-500/40'
            }`} />

            {/* Card top */}
            <div className="flex items-center justify-between mb-4 pl-2">
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-[10px] font-black ${
                  light.status === 'working' ? 'bg-cyan-950/60 border-cyan-800/50 text-cyan-300' :
                  light.status === 'fault' ? 'bg-rose-950/60 border-rose-800/50 text-rose-300' :
                  light.status === 'warning' ? 'bg-amber-950/60 border-amber-800/50 text-amber-300' :
                  'bg-slate-800/60 border-slate-700/50 text-slate-400'
                }`}>
                  {light.id.split('-')[1]}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white truncate max-w-[160px]">{light.name}</h3>
                  <p className="text-[10px] text-slate-600 mt-0.5">{light.zone}</p>
                </div>
              </div>

              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                light.status === 'working' ? 'bg-emerald-950/70 text-emerald-400 border-emerald-800/50' :
                light.status === 'fault' ? 'bg-rose-950/70 text-rose-400 border-rose-800/50 animate-pulse' :
                light.status === 'warning' ? 'bg-amber-950/70 text-amber-400 border-amber-800/50' :
                'bg-slate-800/70 text-slate-500 border-slate-700/50'
              }`}>
                {light.status}
              </span>
            </div>

            {/* Location + ESP32 ID */}
            <div className="pl-2 mb-3 space-y-1">
              <p className="text-[11px] text-slate-300 font-semibold flex items-center gap-1.5">
                <MapPin className="h-3 w-3 text-cyan-500 shrink-0" />
                <span className="truncate">{light.location}</span>
              </p>
              <p className="text-[10px] text-slate-600 flex items-center gap-1.5 font-mono-tech">
                <Cpu className="h-2.5 w-2.5 text-slate-600 shrink-0" />
                {light.esp32DeviceId}
              </p>
            </div>

            {/* Sensor readings */}
            <div className="grid grid-cols-3 gap-2 rounded-xl bg-[#020617]/70 p-3 text-center mb-3 border border-white/3">
              <div>
                <Zap className="h-3 w-3 text-amber-400 mx-auto mb-1" />
                <p className="text-[9px] text-slate-600 uppercase font-semibold">Voltage</p>
                <p className="font-mono-tech font-bold text-xs text-amber-300 mt-0.5">{light.voltage}V</p>
              </div>
              <div>
                <Radio className="h-3 w-3 text-cyan-400 mx-auto mb-1" />
                <p className="text-[9px] text-slate-600 uppercase font-semibold">Current</p>
                <p className="font-mono-tech font-bold text-xs text-cyan-300 mt-0.5">{light.current.toFixed(2)}A</p>
              </div>
              <div>
                <Sun className="h-3 w-3 text-emerald-400 mx-auto mb-1" />
                <p className="text-[9px] text-slate-600 uppercase font-semibold">Power</p>
                <p className="font-mono-tech font-bold text-xs text-emerald-300 mt-0.5">{light.power}W</p>
              </div>
            </div>

            {/* Extra row: LDR + Temp */}
            <div className="flex items-center justify-between mb-3 px-1 text-[10px]">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Sun className="h-3 w-3 text-amber-500" />
                <span>LDR</span>
                <div className="w-16 h-1 rounded-full overflow-hidden bg-slate-800">
                  <div className="h-full rounded-full bg-amber-400 transition-all duration-500" style={{ width: `${light.lightIntensity}%` }} />
                </div>
                <span className="font-mono-tech text-slate-400">{light.lightIntensity}%</span>
              </div>
              <div className="flex items-center gap-1 text-slate-500">
                <Thermometer className="h-3 w-3 text-rose-400" />
                <span className="font-mono-tech text-slate-400">{light.temperature}°C</span>
              </div>
            </div>

            {/* Dimming Slider */}
            <div className="mb-3 px-1">
              <div className="flex items-center justify-between text-[10px] mb-1.5">
                <span className="text-slate-500 flex items-center gap-1">
                  <Sliders className="h-3 w-3 text-cyan-500" /> Dimming
                </span>
                <span className="font-mono-tech font-bold text-cyan-400">{light.dimmingLevel}%</span>
              </div>
              <input
                type="range" min="0" max="100" step="10"
                value={light.dimmingLevel}
                onChange={(e) => setDimming(light.id, Number(e.target.value))}
                disabled={!light.relayState || light.status === 'fault' || light.status === 'offline'}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 disabled:opacity-25"
              />
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-between border-t border-white/5 pt-3 pl-1">
              <button
                onClick={() => toggleRelay(light.id)}
                disabled={light.status === 'fault' || light.status === 'offline'}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[10px] font-bold transition-all border disabled:opacity-30 ${
                  light.relayState
                    ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50 hover:bg-emerald-900/60'
                    : 'bg-slate-800/60 text-slate-500 border-slate-700/50 hover:bg-slate-700/60'
                }`}
              >
                <Power className="h-3 w-3" />
                {light.relayState ? 'RELAY ON' : 'RELAY OFF'}
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => locatePoleOnMap(light.id)}
                  className="rounded-xl border border-white/5 bg-cyan-950/40 p-2 text-cyan-500 hover:border-cyan-500/40 hover:text-cyan-300 transition-all"
                  title="Locate on Map"
                >
                  <MapPin className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => inspectPoleDetails(light.id)}
                  className="rounded-xl border border-white/5 bg-slate-800/50 p-2 text-slate-500 hover:text-white transition-all"
                  title="Full Hardware Inspector"
                >
                  <Eye className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
