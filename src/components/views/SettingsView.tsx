import React, { useState } from 'react';
import { useIoT } from '../../context/IoTContext';
import { Settings, Cpu, Cloud, Shield, Save, CheckCircle2, RefreshCcw, Wifi, Database } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { setIsArchitectureModalOpen, resetSystem } = useIoT();

  const [mqttBroker,           setMqttBroker]           = useState('mqtt://smartcity.iot-cloud.net:1883');
  const [firebaseUrl,          setFirebaseUrl]           = useState('https://smart-street-light-default-rtdb.firebaseio.com');
  const [sampleRate,           setSampleRate]            = useState('4');
  const [maxCurrentThreshold,  setMaxCurrentThreshold]   = useState('0.70');
  const [minVoltageThreshold,  setMinVoltageThreshold]   = useState('190');
  const [savedSuccess,         setSavedSuccess]          = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-5 pb-16 max-w-4xl">
      {/* ── Page header ── */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <Settings className="h-5 w-5 text-cyan-400" />
          <h2 className="text-base font-bold text-white">Cloud & ESP32 Integration Settings</h2>
        </div>
        <p className="text-[11px] text-slate-600">
          Configure MQTT telemetry endpoints, safety thresholds, and cloud database parameters.
        </p>
      </div>

      {/* ── System Mode Banner ── */}
      <div className="glass-card-violet rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-violet-950/60 p-2.5 border border-violet-800/50">
            <Cpu className="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">System Operating Mode</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Currently: <span className="text-cyan-300 font-semibold">College Demo Simulator</span> with reactive state engine.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsArchitectureModalOpen(true)}
          className="btn-cyan shrink-0 rounded-xl text-xs"
        >
          <Cpu className="h-3.5 w-3.5" /> View IoT Pipeline
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Cloud Settings */}
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3 mb-1">
              <Cloud className="h-4 w-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-white">Cloud MQTT & Database</h3>
            </div>

            <div>
              <label className="section-label mb-2 block">MQTT Broker Endpoint</label>
              <div className="relative">
                <Wifi className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-600" />
                <input
                  type="text" value={mqttBroker}
                  onChange={(e) => setMqttBroker(e.target.value)}
                  className="tech-input font-mono-tech pl-9 w-full text-[11px]"
                />
              </div>
            </div>

            <div>
              <label className="section-label mb-2 block">Firebase Realtime DB URL</label>
              <div className="relative">
                <Database className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-600" />
                <input
                  type="text" value={firebaseUrl}
                  onChange={(e) => setFirebaseUrl(e.target.value)}
                  className="tech-input font-mono-tech pl-9 w-full text-[11px]"
                />
              </div>
            </div>

            <div>
              <label className="section-label mb-2 block">Telemetry Sampling Interval</label>
              <select
                value={sampleRate}
                onChange={(e) => setSampleRate(e.target.value)}
                className="tech-select w-full"
              >
                <option value="1">1 Second — High Speed Live</option>
                <option value="4">4 Seconds — Standard Demo</option>
                <option value="10">10 Seconds — Power Save</option>
              </select>
            </div>
          </div>

          {/* Safety Thresholds */}
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3 mb-1">
              <Shield className="h-4 w-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-white">ESP32 Safety Thresholds</h3>
            </div>

            <div>
              <label className="section-label mb-2 block">ACS712 Max Current Limit (A)</label>
              <input
                type="number" step="0.05" value={maxCurrentThreshold}
                onChange={(e) => setMaxCurrentThreshold(e.target.value)}
                className="tech-input font-mono-tech w-full"
              />
              <p className="text-[10px] text-slate-700 mt-1">Trip fault if current exceeds this value.</p>
            </div>

            <div>
              <label className="section-label mb-2 block">ZMPT101B Min Voltage Limit (V)</label>
              <input
                type="number" value={minVoltageThreshold}
                onChange={(e) => setMinVoltageThreshold(e.target.value)}
                className="tech-input font-mono-tech w-full"
              />
              <p className="text-[10px] text-slate-700 mt-1">Trip undervoltage fault below this threshold.</p>
            </div>

            <button
              type="button"
              onClick={resetSystem}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/8 bg-slate-800/50 px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-700/60 transition-all"
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              Restore Default Parameters
            </button>
          </div>
        </div>

        {/* Save bar */}
        <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
          {savedSuccess ? (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Parameters saved successfully!
            </span>
          ) : (
            <span className="text-[11px] text-slate-600">
              Changes take effect immediately on ESP32 telemetry parsing engine.
            </span>
          )}

          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-extrabold text-slate-950 transition-all"
            style={{ background: 'linear-gradient(135deg, #00E5FF, #00F5A0)', boxShadow: '0 0 20px rgba(0,229,255,0.3)' }}
          >
            <Save className="h-4 w-4" /> Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};
