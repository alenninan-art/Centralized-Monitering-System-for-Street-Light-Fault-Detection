import React, { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';
import type {
  StreetLight,
  FaultRecord,
  AlertNotification,
  FaultType,
  SystemStats,
  Severity,
} from '../types/iot';
import {
  INITIAL_STREET_LIGHTS,
  INITIAL_FAULTS,
  INITIAL_ALERTS,
} from '../data/mockStreetLights';
import confetti from 'canvas-confetti';

export type NavigationTab =
  | 'dashboard'
  | 'street_lights'
  | 'fault_detection'
  | 'map'
  | 'sensors'
  | 'history'
  | 'alerts'
  | 'settings'
  | 'hardware';

interface IoTContextType {
  streetLights: StreetLight[];
  faultHistory: FaultRecord[];
  alerts: AlertNotification[];
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  selectedPoleId: string | null;
  setSelectedPoleId: (id: string | null) => void;
  isDetailModalOpen: boolean;
  setIsDetailModalOpen: (open: boolean) => void;
  isArchitectureModalOpen: boolean;
  setIsArchitectureModalOpen: (open: boolean) => void;
  lastSimulatedEvent: string | null;
  setLastSimulatedEvent: (msg: string | null) => void;
  systemStats: SystemStats;
  
  // Actions
  simulateFault: (poleId: string, faultType: FaultType) => void;
  resolveFault: (poleId: string) => void;
  toggleRelay: (poleId: string) => void;
  setDimming: (poleId: string, level: number) => void;
  locatePoleOnMap: (poleId: string) => void;
  inspectPoleDetails: (poleId: string) => void;
  markAlertRead: (alertId: string) => void;
  clearAllAlerts: () => void;
  resetSystem: () => void;
}

const IoTContext = createContext<IoTContextType | undefined>(undefined);

export const IoTProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [streetLights, setStreetLights] = useState<StreetLight[]>(INITIAL_STREET_LIGHTS);
  const [faultHistory, setFaultHistory] = useState<FaultRecord[]>(INITIAL_FAULTS);
  const [alerts, setAlerts] = useState<AlertNotification[]>(INITIAL_ALERTS);
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [selectedPoleId, setSelectedPoleId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState<boolean>(false);
  const [lastSimulatedEvent, setLastSimulatedEvent] = useState<string | null>(null);

  // Compute stats dynamically from street light state
  const systemStats = useMemo<SystemStats>(() => {
    const totalLights = streetLights.length;
    const workingCount = streetLights.filter((l) => l.status === 'working').length;
    const faultCount = streetLights.filter((l) => l.status === 'fault').length;
    const warningCount = streetLights.filter((l) => l.status === 'warning').length;
    const offlineCount = streetLights.filter((l) => l.status === 'offline').length;

    const totalPowerWatts = streetLights.reduce((acc, l) => acc + l.power, 0);
    const avgVoltage =
      workingCount > 0
        ? Math.round(
            streetLights
              .filter((l) => l.status === 'working' || l.status === 'warning')
              .reduce((acc, l) => acc + l.voltage, 0) / (workingCount + warningCount)
          )
        : 0;

    const energySavedPercent = Math.round(
      100 - (totalPowerWatts / (totalLights * 100)) * 100
    );

    const uptimePercent = Number(
      (((totalLights - faultCount - offlineCount) / totalLights) * 100).toFixed(1)
    );

    return {
      totalLights,
      workingCount,
      faultCount,
      warningCount,
      offlineCount,
      totalPowerWatts: Math.round(totalPowerWatts * 10) / 10,
      energySavedPercent: Math.max(0, Math.min(100, energySavedPercent)),
      avgVoltage,
      uptimePercent,
    };
  }, [streetLights]);

  // Live simulation tick every 4 seconds to make sensor telemetry look real-time
  useEffect(() => {
    const timer = setInterval(() => {
      setStreetLights((prevLights) =>
        prevLights.map((light) => {
          if (light.status !== 'working') return light;

          const voltDelta = (Math.random() - 0.5) * 2;
          const currDelta = (Math.random() - 0.5) * 0.02;
          const newVolt = Math.max(220, Math.min(240, Math.round((light.voltage + voltDelta) * 10) / 10));
          const newCurr = Math.max(0.35, Math.min(0.50, Math.round((light.current + currDelta) * 100) / 100));
          const newPower = Math.round(newVolt * newCurr * 10) / 10;

          return {
            ...light,
            voltage: newVolt,
            current: newCurr,
            power: light.relayState ? newPower : 0,
            lastUpdated: 'Just now',
          };
        })
      );
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  // Action: Simulate Fault
  const simulateFault = (poleId: string, faultType: FaultType) => {
    const targetPole = streetLights.find((l) => l.id === poleId);
    if (!targetPole) return;

    let newStatus: StreetLight['status'] = 'fault';
    let newVoltage = targetPole.voltage;
    let newCurrent = targetPole.current;
    let newPower = targetPole.power;
    let newLightIntensity = targetPole.lightIntensity;
    let severity: Severity = 'high';
    let faultTypeName = 'Hardware Fault';
    let description = 'Abnormal condition detected by sensor payload.';

    switch (faultType) {
      case 'lamp_failure':
        faultTypeName = 'Lamp Failure';
        severity = 'high';
        newVoltage = 230;
        newCurrent = 0.0;
        newPower = 0;
        newLightIntensity = 0;
        description = 'LDR sensor reads 0 Lux while relay is energized with 230V line input.';
        break;

      case 'overcurrent':
        faultTypeName = 'Overcurrent Condition';
        severity = 'critical';
        newVoltage = 218;
        newCurrent = 2.95;
        newPower = 643.2;
        newLightIntensity = 100;
        description = 'Current sensor ACS712 recorded 2.95A (Safety limit: 0.70A). Thermal risk!';
        break;

      case 'undervoltage':
        newStatus = 'warning';
        faultTypeName = 'Undervoltage Sag';
        severity = 'medium';
        newVoltage = 175;
        newCurrent = 0.31;
        newPower = 54.2;
        newLightIntensity = 50;
        description = 'ZMPT101B reported grid voltage dropped below critical limit of 190V.';
        break;

      case 'overvoltage':
        newStatus = 'warning';
        faultTypeName = 'Overvoltage Spike';
        severity = 'high';
        newVoltage = 265;
        newCurrent = 0.58;
        newPower = 153.7;
        newLightIntensity = 100;
        description = 'Grid voltage spiked to 265V. Component protection trip risk.';
        break;

      case 'power_failure':
        faultTypeName = 'Total Power Failure';
        severity = 'critical';
        newVoltage = 0;
        newCurrent = 0.0;
        newPower = 0;
        newLightIntensity = 0;
        description = '0V line voltage detected. Feeder cable fault or breaker tripped.';
        break;

      case 'open_circuit':
        faultTypeName = 'Open Circuit Break';
        severity = 'high';
        newVoltage = 230;
        newCurrent = 0.0;
        newPower = 0;
        newLightIntensity = 0;
        description = 'Infinite resistance path detected across lamp terminals.';
        break;

      case 'communication_failure':
        newStatus = 'offline';
        faultTypeName = 'ESP32 Comm Timeout';
        severity = 'medium';
        newVoltage = 0;
        newCurrent = 0.0;
        newPower = 0;
        newLightIntensity = 0;
        description = 'No MQTT ping response received from ESP32 MAC endpoint for > 5 min.';
        break;
    }

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setStreetLights((prev) =>
      prev.map((l) =>
        l.id === poleId
          ? {
              ...l,
              status: newStatus,
              faultType,
              severity,
              voltage: newVoltage,
              current: newCurrent,
              power: newPower,
              lightIntensity: newLightIntensity,
              lastUpdated: 'Just now',
            }
          : l
      )
    );

    const newFaultRecord: FaultRecord = {
      faultId: `FLT-${Math.floor(9000 + Math.random() * 900)}`,
      poleId,
      location: targetPole.location,
      faultType,
      faultTypeName,
      severity,
      detectedTime: timeString,
      resolvedTime: null,
      status: 'unresolved',
      description,
    };
    setFaultHistory((prev) => [newFaultRecord, ...prev]);

    const newAlert: AlertNotification = {
      id: `ALT-${Date.now().toString().slice(-4)}`,
      poleId,
      location: targetPole.location,
      title: `${severity.toUpperCase()}: ${faultTypeName.toUpperCase()}`,
      message: `${targetPole.id} (${targetPole.location}) triggered ${faultTypeName}. ${description}`,
      severity,
      timestamp: timeString,
      read: false,
    };
    setAlerts((prev) => [newAlert, ...prev]);

    setLastSimulatedEvent(`🚨 FAULT SIMULATED: ${targetPole.id} - ${faultTypeName} detected!`);
    setTimeout(() => setLastSimulatedEvent(null), 6000);
  };

  const resolveFault = (poleId: string) => {
    const targetPole = streetLights.find((l) => l.id === poleId);
    if (!targetPole) return;

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setStreetLights((prev) =>
      prev.map((l) =>
        l.id === poleId
          ? {
              ...l,
              status: 'working',
              faultType: 'none',
              severity: 'none',
              voltage: 230,
              current: 0.42,
              power: 96.6,
              lightIntensity: 88,
              relayState: true,
              dimmingLevel: 100,
              lastUpdated: 'Just now',
            }
          : l
      )
    );

    setFaultHistory((prev) =>
      prev.map((rec) =>
        rec.poleId === poleId && rec.status !== 'resolved'
          ? { ...rec, status: 'resolved', resolvedTime: timeString }
          : rec
      )
    );

    const newAlert: AlertNotification = {
      id: `ALT-${Date.now().toString().slice(-4)}`,
      poleId,
      location: targetPole.location,
      title: `FAULT RESOLVED`,
      message: `Street light ${targetPole.id} on ${targetPole.location} has been successfully restored to Working status.`,
      severity: 'low',
      timestamp: timeString,
      read: false,
    };
    setAlerts((prev) => [newAlert, ...prev]);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {
      // fallback
    }

    setLastSimulatedEvent(`✅ RESOLVED: ${targetPole.id} restored to Working condition.`);
    setTimeout(() => setLastSimulatedEvent(null), 5000);
  };

  const toggleRelay = (poleId: string) => {
    setStreetLights((prev) =>
      prev.map((l) => {
        if (l.id !== poleId) return l;
        const nextRelay = !l.relayState;
        return {
          ...l,
          relayState: nextRelay,
          power: nextRelay ? 96.6 : 0,
          current: nextRelay ? 0.42 : 0,
          lightIntensity: nextRelay ? l.lightIntensity || 85 : 0,
          lastUpdated: 'Just now',
        };
      })
    );
  };

  const setDimming = (poleId: string, level: number) => {
    setStreetLights((prev) =>
      prev.map((l) => {
        if (l.id !== poleId) return l;
        const normalizedLevel = Math.max(0, Math.min(100, level));
        const powerRatio = normalizedLevel / 100;
        return {
          ...l,
          dimmingLevel: normalizedLevel,
          lightIntensity: normalizedLevel,
          power: Math.round(96.6 * powerRatio * 10) / 10,
          current: Math.round(0.42 * powerRatio * 100) / 100,
          lastUpdated: 'Just now',
        };
      })
    );
  };

  const locatePoleOnMap = (poleId: string) => {
    setSelectedPoleId(poleId);
    setActiveTab('map');
  };

  const inspectPoleDetails = (poleId: string) => {
    setSelectedPoleId(poleId);
    setIsDetailModalOpen(true);
  };

  const markAlertRead = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, read: true } : a))
    );
  };

  const clearAllAlerts = () => {
    setAlerts([]);
  };

  const resetSystem = () => {
    setStreetLights(INITIAL_STREET_LIGHTS);
    setFaultHistory(INITIAL_FAULTS);
    setAlerts(INITIAL_ALERTS);
    setLastSimulatedEvent('System restored to default prototype state.');
    setTimeout(() => setLastSimulatedEvent(null), 4000);
  };

  return (
    <IoTContext.Provider
      value={{
        streetLights,
        faultHistory,
        alerts,
        activeTab,
        setActiveTab,
        selectedPoleId,
        setSelectedPoleId,
        isDetailModalOpen,
        setIsDetailModalOpen,
        isArchitectureModalOpen,
        setIsArchitectureModalOpen,
        lastSimulatedEvent,
        setLastSimulatedEvent,
        systemStats,
        simulateFault,
        resolveFault,
        toggleRelay,
        setDimming,
        locatePoleOnMap,
        inspectPoleDetails,
        markAlertRead,
        clearAllAlerts,
        resetSystem,
      }}
    >
      {children}
    </IoTContext.Provider>
  );
};

export const useIoT = () => {
  const context = useContext(IoTContext);
  if (!context) {
    throw new Error('useIoT must be used within an IoTProvider');
  }
  return context;
};
