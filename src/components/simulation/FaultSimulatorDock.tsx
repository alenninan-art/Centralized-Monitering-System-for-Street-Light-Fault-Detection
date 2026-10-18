import React, { useState } from 'react';
import { useIoT } from '../../context/IoTContext';
import type { FaultType } from '../../types/iot';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Zap,
  Sparkles,
  Terminal,
  Activity,
} from 'lucide-react';

const FAULT_OPTIONS: { value: FaultType; label: string; color: string }[] = [
  { value: 'lamp_failure',          label: '💡 Lamp Failure (LDR 0 Lux)',      color: 'text-rose-300' },
  { value: 'overcurrent',           label: '⚡ Overcurrent (ACS712 Spike)',     color: 'text-rose-300' },
  { value: 'undervoltage',          label: '📉 Undervoltage (Voltage Sag)',     color: 'text-amber-300' },
  { value: 'power_failure',         label: '🚫 Power Failure (0V Line)',        color: 'text-rose-300' },
  { value: 'communication_failure', label: '📡 ESP32 Comm Timeout',            color: 'text-slate-300' },
  { value: 'open_circuit',          label: '🔌 Open Circuit Break',             color: 'text-rose-300' },
  { value: 'overvoltage',           label: '📈 Overvoltage Surge',              color: 'text-amber-300' },
];

export const FaultSimulatorDock: React.FC = () => {
  const { streetLights, simulateFault, resolveFault } = useIoT();

  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [selectedPoleId, setSelectedPoleId] = useState<string>('SL-001');
  const [selectedFaultType, setSelectedFaultType] = useState<FaultType>('lamp_failure');

  const selectedPole = streetLights.find((l) => l.id === selectedPoleId) || streetLights[0];

  const handleSimulate = () => {
    if (!selectedPoleId) return;
    simulateFault(selectedPoleId, selectedFaultType);
  };

  const handleResolve = () => {
    if (!selectedPoleId) return;
    resolveFault(selectedPoleId);
  };

  const handleRandomFault = () => {
    const workingLights = streetLights.filter((l) => l.status === 'working');
    if (workingLights.length === 0) return;
    const randomPole = workingLights[Math.floor(Math.random() * workingLights.length)];
    const faultTypes: FaultType[] = ['lamp_failure', 'overcurrent', 'undervoltage', 'power_failure', 'communication_failure', 'open_circuit', 'overvoltage'];
    const randomFault = faultTypes[Math.floor(Math.random() * faultTypes.length)];
    setSelectedPoleId(randomPole.id);
    setSelectedFaultType(randomFault);
    simulateFault(randomPole.id, randomFault);
  };

  const poleStatus = selectedPole?.status;
  const statusBg = poleStatus === 'working' ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40' :
                   poleStatus === 'fault'   ? 'bg-rose-950/60 text-rose-400 border-rose-800/40 animate-pulse' :
                   poleStatus === 'warning' ? 'bg-amber-950/60 text-amber-400 border-amber-800/40' :
                                              'bg-slate-800/60 text-slate-400 border-slate-700/40';

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-sm transition-all duration-300">
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-2 rounded-full border border-amber-500/40 bg-[#020617]/95 px-4 py-2.5 text-xs font-bold text-amber-400 shadow-2xl backdrop-blur-xl hover:border-amber-400/70 transition-all"
          style={{ boxShadow: '0 0 20px rgba(255,176,32,0.15)' }}
        >
          <Zap className="h-3.5 w-3.5 text-amber-400 animate-bounce" />
          <span>Fault Simulator</span>
          <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] text-amber-300 border border-amber-500/30">Demo</span>
          <ChevronUp className="h-3.5 w-3.5" />
        </button>
      ) : (
        <div
          className="popover-enter rounded-2xl border border-amber-500/30 bg-[#030914]/97 p-4 shadow-2xl backdrop-blur-2xl w-[340px] space-y-3.5"
          style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(255,176,32,0.08)' }}
        >
          {/* Title bar */}
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="rounded-xl bg-amber-500/15 p-2 border border-amber-500/25">
                <Terminal className="h-4 w-4 text-amber-400" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  Fault Simulator Control
                  <span className="text-[9px] font-medium text-amber-500/70 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/40">DEMO</span>
                </h3>
                <p className="text-[10px] text-slate-600 mt-0.5">Trigger live ESP32 failure conditions</p>
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="rounded-xl bg-slate-900/60 p-1.5 text-slate-500 hover:text-white border border-white/5 transition-colors"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Selectors */}
          <div className="grid grid-cols-1 gap-2.5 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Target Pole Node
              </label>
              <select
                value={selectedPoleId}
                onChange={(e) => setSelectedPoleId(e.target.value)}
                className="tech-select w-full text-xs"
              >
                {streetLights.map((light) => (
                  <option key={light.id} value={light.id}>
                    {light.id} — {light.location.split('-')[0].trim()} ({light.status.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Failure Mode
              </label>
              <select
                value={selectedFaultType}
                onChange={(e) => setSelectedFaultType(e.target.value as FaultType)}
                className="tech-select w-full text-xs"
              >
                {FAULT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Current Node Status */}
          {selectedPole && (
            <div className="rounded-xl border border-white/5 bg-[#020617]/80 p-3 text-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Activity className="h-3 w-3 text-cyan-500" />
                  <span className="font-semibold">Node Status</span>
                </div>
                <span className={`font-bold px-2 py-0.5 rounded-lg text-[10px] border ${statusBg}`}>
                  {selectedPole.status.toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { label: 'V', value: `${selectedPole.voltage}V`, color: 'text-amber-400' },
                  { label: 'A', value: `${selectedPole.current.toFixed(2)}A`, color: 'text-cyan-400' },
                  { label: 'W', value: `${selectedPole.power}W`, color: 'text-emerald-400' },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg bg-[#030914] p-1.5 border border-white/3">
                    <p className="text-[9px] text-slate-600 font-semibold">{s.label}</p>
                    <p className={`font-mono-tech font-bold text-[11px] ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleSimulate}
              className="flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-[11px] font-black text-white transition-all"
              style={{
                background: 'linear-gradient(135deg, #dc2626, #f59e0b)',
                boxShadow: '0 4px 15px rgba(220,38,38,0.3)',
              }}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              Simulate
            </button>

            <button
              onClick={handleResolve}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600/80 py-2.5 text-[11px] font-black text-white hover:bg-emerald-500/80 transition-all border border-emerald-500/40"
              style={{ boxShadow: '0 4px 15px rgba(0,200,100,0.2)' }}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Resolve
            </button>

            <button
              onClick={handleRandomFault}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-950/50 py-2.5 text-[11px] font-black text-cyan-300 hover:bg-cyan-900/50 transition-all"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Random
            </button>
          </div>

          {/* Tip */}
          <p className="text-[10px] text-slate-700 text-center">
            Simulates real ESP32 telemetry changes across all panels
          </p>
        </div>
      )}
    </div>
  );
};
