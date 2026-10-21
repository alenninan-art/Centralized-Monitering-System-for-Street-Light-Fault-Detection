import React, { useState, useEffect } from 'react';
import { useIoT } from '../../context/IoTContext';
import {
  Bell,
  AlertTriangle,
  User,
  RotateCcw,
  Zap,
  ChevronDown,
} from 'lucide-react';

const LiveClock: React.FC = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="hidden lg:flex flex-col items-end">
      <span className="font-mono-tech text-xs font-bold text-cyan-300 tracking-wider">
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </span>
      <span className="text-[10px] text-slate-500 font-medium">
        {time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
      </span>
    </div>
  );
};

export const Header: React.FC = () => {
  const {
    alerts,
    resetSystem,
    markAlertRead,
    clearAllAlerts,
    setActiveTab,
    lastSimulatedEvent,
  } = useIoT();

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const unreadAlertsCount = alerts.filter((a) => !a.read).length;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/5 bg-[#020617]/90 px-4 md:px-6 backdrop-blur-2xl"
      style={{ boxShadow: '0 1px 0 rgba(0,229,255,0.08), 0 4px 24px rgba(0,0,0,0.5)' }}
    >
      {/* ── LEFT: Brand ── */}
      <div className="flex items-center gap-4">
        {/* Logo */}
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-600/20 border border-cyan-500/30"
          style={{ boxShadow: '0 0 20px rgba(0,229,255,0.2)' }}
        >
          <Zap className="h-5 w-5 text-cyan-400" strokeWidth={2.5} />
          {/* Live ping dot */}
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
          </span>
        </div>

        {/* Brand Text */}
        <div className="hidden sm:block">
          <h1 className="text-sm font-bold tracking-tight leading-none" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <span className="text-white">Smart</span>
            <span className="text-cyan-400">Street</span>
          </h1>
        </div>
      </div>

      {/* ── CENTER: Event toast ── */}
      {lastSimulatedEvent && (
        <div className="hidden max-w-md lg:flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-950/70 px-3 py-1.5 text-xs font-semibold text-amber-200 backdrop-blur-md"
          style={{ boxShadow: '0 0 20px rgba(255,176,32,0.15)' }}
        >
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-400 animate-pulse" />
          <span className="truncate">{lastSimulatedEvent}</span>
        </div>
      )}

      {/* ── RIGHT: Actions ── */}
      <div className="flex items-center gap-2">
        <LiveClock />

        {/* Divider */}
        <div className="hidden lg:block w-px h-6 bg-slate-800" />

        {/* Reset */}
        <button
          onClick={resetSystem}
          className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-2 text-slate-400 hover:border-cyan-500/40 hover:text-cyan-400 transition-all"
          title="Reset System"
        >
          <RotateCcw className="h-4 w-4" />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="relative rounded-xl border border-slate-700/50 bg-slate-900/50 p-2 text-slate-300 hover:border-rose-500/40 hover:text-rose-400 transition-all"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadAlertsCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white animate-pulse"
                style={{ boxShadow: '0 0 8px rgba(255,59,92,0.6)' }}
              >
                {unreadAlertsCount > 9 ? '9+' : unreadAlertsCount}
              </span>
            )}
          </button>

          {isNotificationOpen && (
            <div className="popover-enter absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-cyan-500/20 bg-[#050B18]/98 p-4 shadow-2xl z-50 backdrop-blur-2xl"
              style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 30px rgba(0,229,255,0.06)' }}
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm font-bold text-white">System Alerts</span>
                  <span className="rounded-full bg-cyan-950/80 px-2 py-0.5 text-[10px] text-cyan-400 border border-cyan-800/50 font-bold">
                    {alerts.length}
                  </span>
                </div>
                <button onClick={clearAllAlerts} className="text-[11px] font-semibold text-slate-500 hover:text-rose-400 transition-colors">
                  Clear all
                </button>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                {alerts.length === 0 ? (
                  <p className="py-6 text-center text-xs text-slate-600">No active alerts.</p>
                ) : (
                  alerts.slice(0, 8).map((alert) => (
                    <div
                      key={alert.id}
                      onClick={() => { markAlertRead(alert.id); setActiveTab('alerts'); setIsNotificationOpen(false); }}
                      className={`cursor-pointer rounded-xl p-3 border text-xs transition-all ${
                        alert.read
                          ? 'border-white/5 bg-white/2 opacity-60'
                          : alert.severity === 'critical'
                          ? 'border-rose-500/25 bg-rose-950/30'
                          : alert.severity === 'high'
                          ? 'border-amber-500/25 bg-amber-950/20'
                          : 'border-cyan-500/15 bg-cyan-950/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-bold ${
                          alert.severity === 'critical' ? 'text-rose-400' :
                          alert.severity === 'high' ? 'text-amber-400' : 'text-cyan-400'
                        }`}>{alert.title}</span>
                        <span className="text-[10px] text-slate-600 font-mono">{alert.timestamp}</span>
                      </div>
                      <p className="text-slate-400 line-clamp-2">{alert.message}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-3 pt-2 border-t border-white/5 text-center">
                <button onClick={() => { setActiveTab('alerts'); setIsNotificationOpen(false); }}
                  className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  View All Alerts →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Admin */}
        <div className="flex items-center gap-2 border-l border-white/5 pl-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600/20 to-cyan-600/20 border border-violet-500/30">
            <User className="h-4 w-4 text-violet-400" />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-white leading-none">IoT Admin</p>
            <p className="text-[10px] text-cyan-400 font-medium mt-0.5">Operator</p>
          </div>
          <ChevronDown className="hidden md:block h-3 w-3 text-slate-600" />
        </div>
      </div>
    </header>
  );
};
