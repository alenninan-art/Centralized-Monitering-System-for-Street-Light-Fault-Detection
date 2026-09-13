export type LightStatus = 'working' | 'fault' | 'warning' | 'offline';

export type FaultType =
  | 'lamp_failure'
  | 'open_circuit'
  | 'overcurrent'
  | 'undervoltage'
  | 'overvoltage'
  | 'power_failure'
  | 'communication_failure'
  | 'none';

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'none';

export interface StreetLight {
  id: string; // e.g., 'SL-001'
  name: string;
  location: string;
  lat: number;
  lng: number;
  status: LightStatus;
  voltage: number; // Volts (V)
  current: number; // Amperes (A)
  power: number; // Watts (W)
  energyConsumption: number; // kWh
  lightIntensity: number; // % (LDR Sensor)
  temperature: number; // Celsius (°C)
  faultType: FaultType;
  severity: Severity;
  lastUpdated: string;
  installationDate: string;
  esp32DeviceId: string;
  relayState: boolean; // Remote On/Off
  dimmingLevel: number; // 0-100%
  zone: string;
}

export interface TelemetryPoint {
  timestamp: string;
  timeLabel: string;
  voltage: number;
  current: number;
  power: number;
  lightIntensity: number;
  temperature: number;
}

export interface FaultRecord {
  faultId: string;
  poleId: string;
  location: string;
  faultType: FaultType;
  faultTypeName: string;
  severity: Severity;
  detectedTime: string;
  resolvedTime: string | null;
  status: 'unresolved' | 'resolved' | 'under_maintenance';
  description: string;
}

export interface AlertNotification {
  id: string;
  poleId: string;
  location: string;
  title: string;
  message: string;
  severity: Severity;
  timestamp: string;
  read: boolean;
}

export interface SystemStats {
  totalLights: number;
  workingCount: number;
  faultCount: number;
  warningCount: number;
  offlineCount: number;
  totalPowerWatts: number;
  energySavedPercent: number;
  avgVoltage: number;
  uptimePercent: number;
}

export interface IoTArchitectureNode {
  id: string;
  title: string;
  type: 'sensor' | 'microcontroller' | 'network' | 'cloud' | 'frontend';
  description: string;
  specs: string[];
  status: 'active' | 'transmitting' | 'idle';
}

export interface HardwareComponent {
  id: string;
  name: string;
  quantity: string;
  purpose: string;
  category: 'controller' | 'sensor' | 'actuator' | 'power' | 'wiring' | 'enclosure';
  esp32Pinout: string;
  voltageRating: string;
  status: 'connected' | 'sampling' | 'standby';
  iconName: string;
}
