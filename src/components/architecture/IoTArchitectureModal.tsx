import React, { useState } from 'react';
import { useIoT } from '../../context/IoTContext';
import { IOT_ARCHITECTURE_NODES } from '../../data/mockStreetLights';
import {
  X,
  Cpu,
  Zap,
  Code,
  CheckCircle2,
  ArrowRight,
  Database,
} from 'lucide-react';

export const IoTArchitectureModal: React.FC = () => {
  const { isArchitectureModalOpen, setIsArchitectureModalOpen } = useIoT();
  const [selectedStep, setSelectedStep] = useState<number>(0);

  if (!isArchitectureModalOpen) return null;

  const currentStep = IOT_ARCHITECTURE_NODES[selectedStep];

  const sampleJsonPayload = JSON.stringify(
    {
      deviceId: 'ESP32-SL-003',
      poleId: 'SL-003',
      timestamp: Date.now(),
      sensors: {
        acVoltage_V: 230.4,
        acCurrent_A: 0.0,
        power_W: 0.0,
        ldrIntensity_lux: 0,
        temperature_C: 42.1,
      },
      gps: {
        lat: 12.9701,
        lng: 77.5976,
      },
      faultCode: 'ERR_LAMP_FAILURE',
      relayStatus: 1,
    },
    null,
    2
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-2xl border border-cyan-500/30 bg-slate-900 p-6 shadow-2xl shadow-cyan-950/50 max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => setIsArchitectureModalOpen(false)}
          className="absolute right-4 top-4 rounded-lg bg-slate-800 p-2 text-slate-400 hover:bg-slate-700 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
          <div className="rounded-xl bg-cyan-500/20 p-3 text-cyan-400 border border-cyan-500/30">
            <Cpu className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              IoT System Hardware & Cloud Data Flow Architecture
            </h2>
            <p className="text-xs text-slate-400">
              Complete End-to-End Pipeline: Sensors → ESP32 Microcontroller → Cloud → Control Center Dashboard
            </p>
          </div>
        </div>

        <div className="mt-6">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {IOT_ARCHITECTURE_NODES.map((node, index) => {
              const isActive = selectedStep === index;
              return (
                <button
                  key={node.id}
                  onClick={() => setSelectedStep(index)}
                  className={`flex flex-col items-center justify-center rounded-xl p-3 text-center transition-all border ${
                    isActive
                      ? 'border-cyan-400 bg-cyan-950/50 text-cyan-300 shadow-md shadow-cyan-950'
                      : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    Stage {index + 1}
                  </span>
                  <span className="mt-1 text-xs font-bold truncate max-w-full">
                    {node.title.split('.')[1] || node.title}
                  </span>
                  {index < 4 && (
                    <ArrowRight className="mt-1 h-3 w-3 text-slate-600 hidden sm:block" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <span className="rounded-md bg-cyan-950 px-2 py-0.5 text-xs font-bold text-cyan-400 border border-cyan-800">
                {currentStep.title}
              </span>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Ready for ESP32 Payload
              </span>
            </div>
            <span className="text-xs text-slate-500 uppercase tracking-wide">
              Layer: {currentStep.type}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {currentStep.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3.5">
              <h4 className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 mb-2">
                <Zap className="h-3.5 w-3.5" /> Hardware / Component Modules
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {currentStep.specs.map((spec, i) => (
                  <li key={i} className="flex items-center space-x-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3.5">
              <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-2">
                <Code className="h-3.5 w-3.5" /> Live MQTT/JSON Payload Schema
              </h4>
              <pre className="text-[10px] text-cyan-200 bg-slate-950 p-2.5 rounded border border-slate-800 font-mono overflow-x-auto max-h-36">
                {sampleJsonPayload}
              </pre>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-4 text-xs text-emerald-300">
          <div className="flex items-center space-x-2 mb-2 sm:mb-0">
            <Database className="h-5 w-5 text-emerald-400 shrink-0" />
            <span>
              <strong>Hardware Ready Architecture:</strong> Cleanly separated data layer allows simple swap from dummy state to live ESP32 REST/MQTT endpoint.
            </span>
          </div>
          <button
            onClick={() => setIsArchitectureModalOpen(false)}
            className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 shadow-md shadow-emerald-950 shrink-0"
          >
            Close & Return to Monitor
          </button>
        </div>
      </div>
    </div>
  );
};
