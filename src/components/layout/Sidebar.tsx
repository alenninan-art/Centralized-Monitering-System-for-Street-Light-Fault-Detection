import React, { useState } from 'react';
import { useIoT, type NavigationTab } from '../../context/IoTContext';
import {
  LayoutDashboard,
  Lightbulb,
  AlertTriangle,
  MapPin,
  LineChart,
  History,
  Bell,
  Settings,
  Activity,
  Cpu,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeVariant?: 'danger' | 'cyan' | 'amber' | 'neutral';
  sublabel?: string;
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, systemStats, alerts } = useIoT();
  const [collapsed, setCollapsed] = useState(false);

  const unreadAlertsCount = alerts.filter((a) => !a.read).length;

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, sublabel: 'Overview' },
    {
      id: 'street_lights',
      label: 'Street Lights',
      icon: Lightbulb,
      badge: systemStats.totalLights,
      badgeVariant: 'neutral',
      sublabel: 'All Nodes',
    },
    {
      id: 'fault_detection',
      label: 'Fault Detection',
      icon: AlertTriangle,
      badge: systemStats.faultCount > 0 ? systemStats.faultCount : undefined,
      badgeVariant: 'danger',
      sublabel: 'Active Issues',
    },
    { id: 'map', label: 'Location Map', icon: MapPin, sublabel: 'GPS Tracking' },
    { id: 'sensors', label: 'Sensor Data', icon: LineChart, sublabel: 'Telemetry' },
    {
      id: 'hardware',
      label: 'Hardware / BOM',
      icon: Cpu,
      badge: '17',
      badgeVariant: 'cyan',
      sublabel: 'Components',
    },
    { id: 'history', label: 'Fault History', icon: History, sublabel: 'Log' },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: Bell,
      badge: unreadAlertsCount > 0 ? unreadAlertsCount : undefined,
      badgeVariant: 'amber',
      sublabel: 'Notifications',
    },
    { id: 'settings', label: 'Settings & Cloud', icon: Settings, sublabel: 'Configuration' },
  ];

  const badgeClass = (variant?: string) => {
    switch (variant) {
      case 'danger':  return 'bg-rose-950/80 text-rose-400 border border-rose-800/60';
      case 'cyan':    return 'bg-cyan-950/80 text-cyan-400 border border-cyan-800/60';
      case 'amber':   return 'bg-amber-950/80 text-amber-400 border border-amber-800/60';
      default:        return 'bg-slate-800/80 text-slate-400 border border-slate-700/50';
    }
  };

  return (
    <aside
      className={`relative flex flex-col justify-between border-r border-white/5 bg-[#030914]/90 backdrop-blur-2xl text-slate-300 transition-all duration-300 z-20 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
      style={{ boxShadow: '1px 0 0 rgba(0,229,255,0.06)' }}
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 z-30 flex h-6 w-6 items-center justify-center rounded-full border border-cyan-500/30 bg-[#030914] text-cyan-400 hover:border-cyan-400 hover:bg-cyan-950/60 transition-all"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        {!collapsed && (
          <p className="section-label px-4 mb-3">Control Center</p>
        )}

        <nav className="space-y-0.5 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={collapsed ? item.label : undefined}
                className={`group relative flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'nav-item-active text-cyan-300'
                    : 'text-slate-400 hover:bg-white/4 hover:text-slate-200'
                } ${collapsed ? 'justify-center' : 'justify-between'}`}
              >
                <div className={`flex items-center ${collapsed ? '' : 'gap-3'}`}>
                  <Icon
                    className={`h-4.5 w-4.5 shrink-0 transition-colors ${
                      isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                    }`}
                  />
                  {!collapsed && (
                    <div className="text-left">
                      <p className={`text-xs font-semibold leading-none ${isActive ? 'text-cyan-300' : ''}`}>
                        {item.label}
                      </p>
                      <p className={`text-[10px] mt-0.5 leading-none ${isActive ? 'text-cyan-500/70' : 'text-slate-600'}`}>
                        {item.sublabel}
                      </p>
                    </div>
                  )}
                </div>

                {!collapsed && item.badge !== undefined && (
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${badgeClass(item.badgeVariant)}`}>
                    {item.badge}
                  </span>
                )}

                {/* Collapsed badge dot */}
                {collapsed && item.badge !== undefined && item.badgeVariant === 'danger' && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom: Network Telemetry Panel */}
      {!collapsed && (
        <div className="m-2 rounded-xl border border-white/5 bg-[#020617]/80 p-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-cyan-400" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Network Telemetry</span>
            </div>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${
              systemStats.faultCount > 0
                ? 'bg-rose-950/60 text-rose-400 border-rose-800/40'
                : 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40'
            }`}>
              {systemStats.uptimePercent}% UP
            </span>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { label: 'Total', value: systemStats.totalLights, color: 'text-cyan-300' },
              { label: 'Working', value: systemStats.workingCount, color: 'text-emerald-400' },
              { label: 'Faults', value: systemStats.faultCount, color: systemStats.faultCount > 0 ? 'text-rose-400' : 'text-slate-500' },
              { label: 'Offline', value: systemStats.offlineCount, color: 'text-slate-400' },
            ].map((s) => (
              <div key={s.label} className="rounded-lg bg-[#020617] p-2 border border-white/3 text-center">
                <p className="text-[9px] text-slate-600 font-semibold uppercase">{s.label}</p>
                <p className={`text-sm font-black mt-0.5 ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Power load */}
          <div className="flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-1 text-slate-500">
              <Zap className="h-3 w-3 text-amber-400" />
              <span>Power Load</span>
            </div>
            <span className="font-mono font-bold text-cyan-300">{(systemStats.totalPowerWatts / 1000).toFixed(2)} kW</span>
          </div>

          {/* Uptime bar */}
          <div className="progress-bar-bg h-1">
            <div className="progress-bar-fill" style={{ width: `${systemStats.uptimePercent}%` }} />
          </div>

          {/* Last sync */}
          <div className="flex items-center gap-1 text-[9px] text-slate-600">
            <TrendingUp className="h-3 w-3 text-cyan-600" />
            <span>Last sync: Just now</span>
          </div>
        </div>
      )}

      {/* Collapsed: small power indicator */}
      {collapsed && (
        <div className="m-2 rounded-xl border border-white/5 bg-[#020617]/80 p-2 flex flex-col items-center gap-1">
          <Zap className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-[9px] font-mono text-cyan-400">{(systemStats.totalPowerWatts / 1000).toFixed(1)}k</span>
        </div>
      )}
    </aside>
  );
};
