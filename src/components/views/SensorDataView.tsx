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
} from 'lucide-react';

export const SensorDataView: React.FC = () => {
  const { streetLights } = useIoT();
  const [selectedPoleId, setSelectedPoleId] = useState<string>('SL-001');

  const selectedPole = streetLights.find((l) => l.id === selectedPoleId) || streetLights[0];

  const telemetryData = GENERATE_HISTORICAL_TELEMETRY();

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ChartIcon className="h-6 w-6 text-cyan-400" />
            Real-Time Electrical & Environmental Sensor Telemetry
          </h2>
          <p className="text-xs text-slate-400">
            Time-series telemetry sampled from ACS712, ZMPT101B, LDR and DHT11 modules via ESP32 ADC.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold pl-2">Select Pole Node:</span>
          <select
            value={selectedPoleId}
            onChange={(e) => setSelectedPoleId(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-bold text-cyan-300 focus:border-cyan-400 focus:outline-none"
          >
            {streetLights.map((light) => (
              <option key={light.id} value={light.id}>
                {light.id} - {light.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 text-center shadow-lg">
          <span className="text-[10px] font-extrabold uppercase text-slate-500 block">AC Voltage</span>
          <div className="mt-2 flex items-center justify-center space-x-1">
            <Zap className="h-4 w-4 text-amber-400" />
            <span className="text-2xl font-extrabold text-white">{selectedPole.voltage}</span>
            <span className="text-xs text-slate-400">V</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold mt-1 block">ZMPT101B Sensor</span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 text-center shadow-lg">
          <span className="text-[10px] font-extrabold uppercase text-slate-500 block">AC Current</span>
          <div className="mt-2 flex items-center justify-center space-x-1">
            <Activity className="h-4 w-4 text-cyan-400" />
            <span className="text-2xl font-extrabold text-cyan-300">{selectedPole.current}</span>
            <span className="text-xs text-slate-400">A</span>
          </div>
          <span className="text-[10px] text-cyan-400 font-semibold mt-1 block">ACS712 Current</span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 text-center shadow-lg">
          <span className="text-[10px] font-extrabold uppercase text-slate-500 block">Power Draw</span>
          <div className="mt-2 flex items-center justify-center space-x-1">
            <Gauge className="h-4 w-4 text-emerald-400" />
            <span className="text-2xl font-extrabold text-emerald-400">{selectedPole.power}</span>
            <span className="text-xs text-slate-400">W</span>
          </div>
          <span className="text-[10px] text-slate-400 font-semibold mt-1 block">Active Load</span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 text-center shadow-lg">
          <span className="text-[10px] font-extrabold uppercase text-slate-500 block">LDR Lux Level</span>
          <div className="mt-2 flex items-center justify-center space-x-1">
            <Sun className="h-4 w-4 text-amber-300" />
            <span className="text-2xl font-extrabold text-amber-300">
              {selectedPole.lightIntensity}%
            </span>
          </div>
          <span className="text-[10px] text-amber-400 font-semibold mt-1 block">Light Intensity</span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 text-center shadow-lg">
          <span className="text-[10px] font-extrabold uppercase text-slate-500 block">Pole Temp</span>
          <div className="mt-2 flex items-center justify-center space-x-1">
            <Thermometer className="h-4 w-4 text-rose-400" />
            <span className="text-2xl font-extrabold text-rose-300">
              {selectedPole.temperature}°C
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-semibold mt-1 block">DHT11 Module</span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 text-center shadow-lg">
          <span className="text-[10px] font-extrabold uppercase text-slate-500 block">ESP32 Comm</span>
          <div className="mt-2 flex items-center justify-center space-x-1">
            <Radio className="h-4 w-4 text-emerald-400 animate-pulse" />
            <span className="text-sm font-extrabold text-emerald-400 uppercase">MQTT OK</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-1 block">Ping: 24ms</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" />
              Line Voltage vs Time (24h Cycle)
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">Unit: Volts AC</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="timeLabel" stroke="#64748b" fontSize={11} />
                <YAxis domain={[170, 260]} stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#f8fafc' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="voltage"
                  name="Line Voltage (V)"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#f59e0b' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="h-4 w-4 text-cyan-400" />
              AC Current Draw vs Time (ACS712)
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">Unit: Amperes (A)</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={telemetryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="timeLabel" stroke="#64748b" fontSize={11} />
                <YAxis domain={[0, 0.6]} stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#f8fafc' }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="current"
                  name="Current (A)"
                  stroke="#38bdf8"
                  fill="#0284c7"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Gauge className="h-4 w-4 text-emerald-400" />
              Active Power Consumption Profile (Watts vs Time)
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">Unit: Watts (W)</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={telemetryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="timeLabel" stroke="#64748b" fontSize={11} />
                <YAxis domain={[0, 120]} stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#f8fafc' }}
                />
                <Legend />
                <Bar
                  dataKey="power"
                  name="Power Draw (Watts)"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
