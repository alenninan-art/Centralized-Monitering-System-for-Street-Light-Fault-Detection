import React from 'react';
import { useIoT } from '../../context/IoTContext';
import {
  X,
  MapPin,
  Cpu,
  Power,
  Clock,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-cyan-950/40 max-h-[90vh] overflow-y-auto space-y-6">
        <button
          onClick={() => setIsDetailModalOpen(false)}
          className="absolute right-4 top-4 rounded-lg bg-slate-800 p-2 text-slate-400 hover:bg-slate-700 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-cyan-400 font-extrabold text-base">
            {light.id}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-extrabold text-white">{light.name}</h2>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase border ${
                  light.status === 'working'
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                    : light.status === 'fault'
                    ? 'bg-rose-950 text-rose-400 border-rose-800 animate-pulse'
                    : light.status === 'warning'
                    ? 'bg-amber-950 text-amber-400 border-amber-800'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {light.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <MapPin className="h-3.5 w-3.5 text-cyan-400" />
              <span>{light.location} ({light.zone})</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-center">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Voltage</span>
            <span className="text-lg font-bold text-slate-200 mt-1 block font-mono">
              {light.voltage} V
            </span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-center">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Current</span>
            <span className="text-lg font-bold text-slate-200 mt-1 block font-mono">
              {light.current.toFixed(2)} A
            </span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-center">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Power Load</span>
            <span className="text-lg font-bold text-cyan-300 mt-1 block font-mono">
              {light.power} W
            </span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-center">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Energy</span>
            <span className="text-lg font-bold text-emerald-400 mt-1 block font-mono">
              {light.energyConsumption} kWh
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2 text-xs">
            <h4 className="font-bold text-cyan-400 flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Cpu className="h-4 w-4" /> Hardware Endpoint Metadata
            </h4>
            <div className="flex justify-between py-1 border-b border-slate-900">
              <span className="text-slate-400">ESP32 Device ID:</span>
              <strong className="font-mono text-slate-200">{light.esp32DeviceId}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-900">
              <span className="text-slate-400">GPS Coordinates:</span>
              <strong className="font-mono text-cyan-300">
                {light.lat.toFixed(4)}° N, {light.lng.toFixed(4)}° E
              </strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-900">
              <span className="text-slate-400">Installation Date:</span>
              <span className="text-slate-300">{light.installationDate}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Last Communication:</span>
              <span className="text-emerald-400 font-bold">{light.lastUpdated}</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3 text-xs">
            <h4 className="font-bold text-emerald-400 flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Power className="h-4 w-4" /> Remote Solid State Relay Override
            </h4>

            <div className="flex items-center justify-between">
              <span className="text-slate-300">Relay Power Switch:</span>
              <button
                onClick={() => toggleRelay(light.id)}
                disabled={light.status === 'fault'}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all border ${
                  light.relayState
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                } disabled:opacity-30`}
              >
                {light.relayState ? 'STATE: ENERGIZED (ON)' : 'STATE: DE-ENERGIZED (OFF)'}
              </button>
            </div>

            <div className="space-y-1 pt-1">
              <div className="flex justify-between">
                <span className="text-slate-400">LDR Dimming Threshold:</span>
                <span className="font-bold text-cyan-300">{light.dimmingLevel}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="10"
                value={light.dimmingLevel}
                onChange={(e) => setDimming(light.id, Number(e.target.value))}
                disabled={!light.relayState || light.status === 'fault'}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 disabled:opacity-30"
              />
            </div>

            {light.status === 'fault' && (
              <button
                onClick={() => resolveFault(light.id)}
                className="w-full rounded-xl bg-emerald-600 py-2 font-bold text-white hover:bg-emerald-500 shadow-md shadow-emerald-950 transition-all mt-2"
              >
                Clear & Resolve Fault Condition
              </button>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3 text-xs">
          <h4 className="font-bold text-amber-400 flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <Clock className="h-4 w-4" /> Live IoT Diagnostic Flow Timeline
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center text-[11px]">
            <div className="rounded-lg bg-slate-900 p-2 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">1. Sensor Sampling</span>
              <span className="text-emerald-400 font-semibold mt-1 block">ZMPT101B / ACS712 OK</span>
            </div>
            <div className="rounded-lg bg-slate-900 p-2 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">2. ESP32 Parsing</span>
              <span className="text-cyan-400 font-semibold mt-1 block">12-bit ADC Sampled</span>
            </div>
            <div className="rounded-lg bg-slate-900 p-2 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">3. Cloud Sync</span>
              <span className="text-slate-300 font-semibold mt-1 block">MQTT Packet Sent</span>
            </div>
            <div className="rounded-lg bg-slate-900 p-2 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">4. Dashboard Display</span>
              <span className={`font-bold mt-1 block ${light.status === 'fault' ? 'text-rose-400' : 'text-emerald-400'}`}>
                {light.status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
