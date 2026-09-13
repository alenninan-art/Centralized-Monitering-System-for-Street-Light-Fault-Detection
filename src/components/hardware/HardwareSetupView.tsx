import React, { useState, useEffect } from 'react';
import { PROJECT_HARDWARE_BOM } from '../../data/mockStreetLights';
import { useIoT } from '../../context/IoTContext';
import {
  Cpu,
  Layers,
  Terminal,
  CheckCircle2,
  Cable,
  Search,
} from 'lucide-react';

export const HardwareSetupView: React.FC = () => {
  const { streetLights } = useIoT();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const initialLogs = [
      `[00:00:01.102] [ESP32-CORE] Booting Tensilica Xtensa Dual-Core 240MHz...`,
      `[00:00:01.215] [ESP32-WIFI] Connecting to SSID: SmartCity_Gateway_AP... Connected! IP: 192.168.1.104`,
      `[00:00:01.450] [MQTT] Connected to Broker: mqtt://smartcity.iot-cloud.net:1883`,
      `[00:00:01.680] [NEO-6M] GPS Satellite Lock Acquired. Satellites: 9 | Lat: 12.9716, Lng: 77.5946`,
      `[00:00:02.010] [ZMPT101B] AC Voltage Sensor Calibration Zero-Point: 2.50V (Offset: 0.02V)`,
      `[00:00:02.120] [ACS712] Current Sensor Sensitivity: 185mV/A initialized on GPIO 34.`,
      `[00:00:02.250] [LDR-ADC] GPIO 32 Light Intensity: 88% Lux. Relay 1: ENERGIZED (ON).`,
    ];
    setLogs(initialLogs);

    const interval = setInterval(() => {
      const timeStamp = new Date().toISOString().split('T')[1].slice(0, 12);
      const randomLight = streetLights[Math.floor(Math.random() * streetLights.length)];

      const logMsg = `[${timeStamp}] [${randomLight.esp32DeviceId}] TELEMETRY PUB > Pole: ${randomLight.id} | V: ${randomLight.voltage}V | I: ${randomLight.current}A | P: ${randomLight.power}W | Lux: ${randomLight.lightIntensity}% | Status: ${randomLight.status.toUpperCase()}`;

      setLogs((prev) => [logMsg, ...prev.slice(0, 25)]);
    }, 3000);

    return () => clearInterval(interval);
  }, [streetLights]);

  const categories = Array.from(new Set(PROJECT_HARDWARE_BOM.map((item) => item.category)));

  const filteredBOM = PROJECT_HARDWARE_BOM.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.esp32Pinout.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Cpu className="h-6 w-6 text-cyan-400" />
            Hardware Components Bill of Materials (BOM) & Circuit Setup
          </h2>
          <p className="text-xs text-slate-400">
            Complete prototype hardware specification, ESP32 GPIO pinout mapping, and live serial log monitor.
          </p>
        </div>

        <div className="flex items-center space-x-2 rounded-xl border border-cyan-500/30 bg-cyan-950/30 px-3.5 py-2 text-xs font-semibold text-cyan-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>17 Physical Components Registered</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
            <Cable className="h-4 w-4 text-cyan-400" />
            ESP32 Microcontroller GPIO Pinout Assignment
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 font-extrabold uppercase">ACS712 Current Sensor</span>
              <p className="font-mono font-bold text-cyan-300">ESP32 GPIO 34 (ADC1_CH6)</p>
              <p className="text-[10px] text-slate-400">VCC: 5V DC | OUT: Analog Signal</p>
            </div>

            <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 font-extrabold uppercase">ZMPT101B AC Voltage Sensor</span>
              <p className="font-mono font-bold text-amber-300">ESP32 GPIO 35 (ADC1_CH7)</p>
              <p className="text-[10px] text-slate-400">VCC: 5V DC | OUT: Analog AC Wave</p>
            </div>

            <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 font-extrabold uppercase">LDR Lux Intensity Sensor</span>
              <p className="font-mono font-bold text-emerald-300">ESP32 GPIO 32 (ADC1_CH4)</p>
              <p className="text-[10px] text-slate-400">VCC: 3.3V DC | AO: Lux Level</p>
            </div>

            <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 font-extrabold uppercase">NEO-6M GPS Location Module</span>
              <p className="font-mono font-bold text-purple-300">UART2 (TX2=17, RX2=16)</p>
              <p className="text-[10px] text-slate-400">Baud Rate: 9600 | NMEA Sentences</p>
            </div>

            <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 space-y-1 sm:col-span-2">
              <span className="text-[10px] text-slate-500 font-extrabold uppercase">5V Solid State Relay Module</span>
              <p className="font-mono font-bold text-rose-300">GPIO 26 (Relay 1), GPIO 27 (Relay 2)</p>
              <p className="text-[10px] text-slate-400">Optocoupled High-Voltage Switching for Lamp Load</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-2xl space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2 font-mono">
              <Terminal className="h-4 w-4" />
              ESP32 Live Serial Console Monitor (115200 Baud)
            </h3>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>

          <div className="h-64 rounded-xl bg-slate-900/90 p-3 font-mono text-[11px] text-cyan-200 overflow-y-auto space-y-1 border border-slate-800">
            {logs.map((log, i) => (
              <p
                key={i}
                className={
                  log.includes('FAULT') || log.includes('ERR')
                    ? 'text-rose-400 font-bold'
                    : log.includes('GPS')
                    ? 'text-purple-300'
                    : log.includes('TELEMETRY')
                    ? 'text-cyan-300'
                    : 'text-slate-400'
                }
              >
                {log}
              </p>
            ))}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span>UART TX/RX Telemetry Output Stream</span>
            <span className="text-emerald-400 font-semibold">Active Port: COM4</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-cyan-400" />
              Complete Prototype Hardware Inventory (17 Components)
            </h3>
            <p className="text-xs text-slate-400">
              Detailed breakdown of microcontrollers, sensors, relays, power units, and physical structure.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search component or pinout..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-56 sm:w-64 rounded-xl border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-200 focus:border-cyan-400 focus:outline-none"
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBOM.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-xl space-y-3 transition-all hover:border-cyan-500/40"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="rounded-lg bg-slate-900 p-1.5 text-cyan-400 border border-slate-800">
                    <Cpu className="h-4 w-4" />
                  </span>
                  <span>{item.name}</span>
                </h4>
                <span className="rounded-full bg-cyan-950 px-2.5 py-0.5 text-[10px] font-extrabold text-cyan-400 border border-cyan-800">
                  Qty: {item.quantity}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {item.purpose}
              </p>

              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>ESP32 Mapping:</span>
                  <strong className="font-mono text-cyan-300 text-right">{item.esp32Pinout}</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Voltage Rating:</span>
                  <span className="text-slate-200">{item.voltageRating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
