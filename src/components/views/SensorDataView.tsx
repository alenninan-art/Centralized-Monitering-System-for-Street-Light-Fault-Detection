import React, { useState } from 'react';
import { useIoT } from '../../context/IoTContext';
import { GENERATE_HISTORICAL_TELEMETRY } from '../../data/mockStreetLights';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  LineChart as ChartIcon,
  Zap,
  Activity,
  Sun,
  Thermometer,
  Radio,
  Gauge,
  Cpu,
} from 'lucide-react';

export const SensorDataView: React.FC = () => {
  const { streetLights } = useIoT();
  const [selectedPoleId, setSelectedPoleId] = useState<string>('SL-001');

  const selectedPole = streetLights.find((l) => l.id === selectedPoleId) || streetLights[0];
  const telemetryData = GENERATE_HISTORICAL_TELEMETRY();

  const tooltipStyle = {
    contentStyle: {
      backgroundColor: '#050B18',
      borderColor: 'rgba(0,229,255,0.15)',
      borderRadius: '12px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
    },
    labelStyle: { color: '#f8fafc', fontWeight: 700 },
    itemStyle: { color: '#94a3b8' },
  };

  const statusColor =
    selectedPole?.status === 'fault'   ? 'text-rose-400 border-rose-800/50 bg-rose-950/50' :
    selectedPole?.status === 'warning' ? 'text-amber-400 border-amber-800/50 bg-amber-950/50' :
    selectedPole?.status === 'offline' ? 'text-slate-500 border-slate-700/50 bg-slate-800/50' :
                                         'text-emerald-400 border-emerald-800/50 bg-emerald-950/50';

  return (
    <div className="space-y-5 pb-16">
      {/* ── Header ── */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ChartIcon className="h-5 w-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white">Real-Time Sensor Telemetry</h2>
            </div>
            <p className="text-[11px] text-slate-600">
              Time-series data sampled from ACS712, ZMPT101B, LDR and DHT11 via ESP32 ADC pins.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <label className="text-[11px] text-slate-500 font-semibold">Select Node:</label>
            <select
              value={selectedPoleId}
              onChange={(e) => setSelectedPoleId(e.target.value)}
              className="tech-select"
            >
              {streetLights.map((light) => (
                <option key={light.id} value={light.id}>
                  {light.id} — {light.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Live readout strip ── */}
      {selectedPole && (
        <div className="glass-card rounded-2xl p-4">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Cpu className="h-4 w-4 text-cyan-400" />
            <span className="text-xs font-bold text-white">{selectedPole.id} — {selectedPole.name}</span>
            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${statusColor}`}>
              {selectedPole.status}
            </span>
            <span className="text-[10px] text-slate-600 ml-auto">{selectedPole.zone}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'AC Voltage',  value: `${selectedPole.voltage}`,          unit: 'V',    sub: 'ZMPT101B',  icon: <Zap className="h-4 w-4 text-amber-400" />,      cls: 'text-amber-300' },
              { label: 'AC Current',  value: `${selectedPole.current.toFixed(2)}`,unit: 'A',   sub: 'ACS712',    icon: <Activity className="h-4 w-4 text-cyan-400" />,   cls: 'text-cyan-300' },
              { label: 'Power Draw',  value: `${selectedPole.power}`,             unit: 'W',    sub: 'Computed',  icon: <Gauge className="h-4 w-4 text-emerald-400" />,   cls: 'text-emerald-300' },
              { label: 'LDR Level',  value: `${selectedPole.lightIntensity}`,     unit: '%',    sub: 'Photocell', icon: <Sun className="h-4 w-4 text-amber-300" />,       cls: 'text-amber-200' },
              { label: 'Temperature', value: `${selectedPole.temperature}`,       unit: '°C',   sub: 'DHT11',     icon: <Thermometer className="h-4 w-4 text-rose-400" />, cls: 'text-rose-300' },
              { label: 'ESP32 Comm',  value: 'LIVE',                              unit: '',     sub: 'MQTT OK',   icon: <Radio className="h-4 w-4 text-emerald-400 animate-pulse" />, cls: 'text-emerald-400' },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-white/5 bg-[#020617]/70 p-3.5 text-center">
                <div className="flex justify-center mb-2">{s.icon}</div>
                <div className="text-[9px] text-slate-600 font-bold uppercase tracking-wider mb-1">{s.label}</div>
                <div className={`font-mono-tech font-black text-lg ${s.cls}`}>
                  {s.value}<span className="text-xs font-semibold text-slate-500 ml-0.5">{s.unit}</span>
                </div>
                <div className="text-[9px] text-slate-700 mt-1 font-semibold">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Voltage */}
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" /> Line Voltage — 24h Cycle
            </h3>
            <span className="text-[10px] text-slate-600 font-mono-tech">ZMPT101B · Volts AC</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="timeLabel" stroke="#334155" fontSize={10} tick={{ fill: '#475569' }} />
                <YAxis domain={[170, 260]} stroke="#334155" fontSize={10} tick={{ fill: '#475569' }} />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line
                  type="monotone" dataKey="voltage" name="Voltage (V)"
                  stroke="#FFB020" strokeWidth={2.5}
                  dot={{ r: 2, fill: '#FFB020' }} activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Current */}
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              <Activity className="h-4 w-4 text-cyan-400" /> AC Current Draw — ACS712
            </h3>
            <span className="text-[10px] text-slate-600 font-mono-tech">Amperes (A)</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={telemetryData}>
                <defs>
                  <linearGradient id="currentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="timeLabel" stroke="#334155" fontSize={10} tick={{ fill: '#475569' }} />
                <YAxis domain={[0, 0.6]} stroke="#334155" fontSize={10} tick={{ fill: '#475569' }} />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area
                  type="monotone" dataKey="current" name="Current (A)"
                  stroke="#00E5FF" fill="url(#currentGrad)" strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Power — full width */}
        <div className="glass-card rounded-2xl p-5 space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              <Gauge className="h-4 w-4 text-emerald-400" /> Active Power Consumption Profile
            </h3>
            <span className="text-[10px] text-slate-600 font-mono-tech">Watts (W) · 24h</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={telemetryData} barSize={14}>
                <defs>
                  <linearGradient id="powerGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00F5A0" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#00F5A0" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="timeLabel" stroke="#334155" fontSize={10} tick={{ fill: '#475569' }} />
                <YAxis domain={[0, 120]} stroke="#334155" fontSize={10} tick={{ fill: '#475569' }} />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar
                  dataKey="power" name="Power (W)"
                  fill="url(#powerGrad)" radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
