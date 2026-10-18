import React, { lazy, Suspense } from 'react';
import { IoTProvider, useIoT } from './context/IoTContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/views/DashboardView';
import { StreetLightsView } from './components/views/StreetLightsView';
import { FaultDetectionView } from './components/views/FaultDetectionView';
import { SensorDataView } from './components/views/SensorDataView';
import { FaultHistoryView } from './components/views/FaultHistoryView';
import { AlertsView } from './components/views/AlertsView';
import { SettingsView } from './components/views/SettingsView';
import { HardwareSetupView } from './components/hardware/HardwareSetupView';
import { FaultSimulatorDock } from './components/simulation/FaultSimulatorDock';
import { IoTArchitectureModal } from './components/architecture/IoTArchitectureModal';
import { LightDetailModal } from './components/details/LightDetailModal';

const MapView = lazy(() =>
  import('./components/views/MapView').then(({ MapView }) => ({ default: MapView }))
);

const MainContent: React.FC = () => {
  const { activeTab } = useIoT();

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-950">
      <div key={activeTab} className="page-transition">
        {activeTab === 'dashboard'       && <DashboardView />}
        {activeTab === 'street_lights'   && <StreetLightsView />}
        {activeTab === 'fault_detection' && <FaultDetectionView />}
        {activeTab === 'map'             && (
          <Suspense fallback={<div className="p-6 text-sm text-cyan-400">Loading map tools…</div>}>
            <MapView />
          </Suspense>
        )}
        {activeTab === 'sensors'         && <SensorDataView />}
        {activeTab === 'hardware'        && <HardwareSetupView />}
        {activeTab === 'history'         && <FaultHistoryView />}
        {activeTab === 'alerts'          && <AlertsView />}
        {activeTab === 'settings'        && <SettingsView />}
      </div>
    </main>
  );
};

export function App() {
  return (
    <IoTProvider>
      <div className="app-shell flex h-screen w-screen flex-col overflow-hidden bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
        <Header />

        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <MainContent />
        </div>

        <FaultSimulatorDock />
        <IoTArchitectureModal />
        <LightDetailModal />
      </div>
    </IoTProvider>
  );
}

export default App;
