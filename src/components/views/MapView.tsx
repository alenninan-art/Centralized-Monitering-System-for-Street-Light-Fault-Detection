import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useIoT } from '../../context/IoTContext';
import { MapPin, Layers, AlertTriangle, CheckCircle2, WifiOff, Zap, Filter } from 'lucide-react';
import type { StreetLight } from '../../types/iot';

maplibregl.setWorkerUrl(`${import.meta.env.BASE_URL}maplibre-gl-worker.mjs`);

// ── CARTO vector tile config ───────────────────────────────────────────────
const CARTO_API_KEY = 'cb1_4475_1_ed5176ee76c1508082e98380';

// Status → colour mapping (matches the rest of the dashboard)
const STATUS_COLORS: Record<string, { fill: string; glow: string; pulse: boolean }> = {
  working: { fill: '#00F5A0', glow: 'rgba(0,245,160,0.5)',  pulse: false },
  fault:   { fill: '#FF3B5C', glow: 'rgba(255,59,92,0.8)',  pulse: true  },
  warning: { fill: '#FFB020', glow: 'rgba(255,176,32,0.7)', pulse: true  },
  offline: { fill: '#475569', glow: 'rgba(71,85,105,0.3)',  pulse: false },
};

const STATUS_ICONS: Record<string, string> = {
  working: '💡',
  fault:   '🔴',
  warning: '🟠',
  offline: '⚫',
};

const KOCHI_ROAD_CENTER: [number, number] = [76.28299, 9.98251];

// Build an animated SVG/HTML marker element
function createMarkerEl(light: StreetLight): HTMLDivElement {
  const cfg = STATUS_COLORS[light.status] ?? STATUS_COLORS.offline;
  const el  = document.createElement('div');
  el.className = 'carto-marker';

  // outer ring (pulse for faults/warnings)
  const pulse = cfg.pulse
    ? `<span style="
        position:absolute;inset:-6px;border-radius:50%;
        background:${cfg.fill};opacity:0.25;
        animation:markerPulse 1.8s ease-in-out infinite;
      "></span>`
    : '';

  el.innerHTML = `
    <div style="
      position:relative;
      width:28px;height:28px;
      background:${cfg.fill};
      border:2.5px solid #0f172a;
      border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 0 18px ${cfg.glow},0 2px 8px rgba(0,0,0,0.6);
      cursor:pointer;
      transition:transform 0.2s ease;
    ">
      ${pulse}
      <span style="font-size:13px;line-height:1;position:relative;z-index:1">${STATUS_ICONS[light.status] ?? '💡'}</span>
    </div>`;

  el.style.cssText = 'width:28px;height:28px;';
  el.addEventListener('mouseenter', () => {
    (el.firstElementChild as HTMLElement).style.transform = 'scale(1.25)';
  });
  el.addEventListener('mouseleave', () => {
    (el.firstElementChild as HTMLElement).style.transform = 'scale(1)';
  });

  return el;
}

// Dark-themed popup HTML
function buildPopupHTML(light: StreetLight): string {
  const cfg = STATUS_COLORS[light.status] ?? STATUS_COLORS.offline;
  const statusLabel: Record<string, string> = {
    working: '#00F5A0',
    fault:   '#FF3B5C',
    warning: '#FFB020',
    offline: '#64748b',
  };
  const statusBg: Record<string, string> = {
    working: '#022c22',
    fault:   '#1f0609',
    warning: '#1c1000',
    offline: '#0f1729',
  };
  const lat = typeof light.lat === 'number' ? light.lat : 0;
  const lng = typeof light.lng === 'number' ? light.lng : 0;
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  const coordText = `${Math.abs(lat).toFixed(6)}° ${latDir}, ${Math.abs(lng).toFixed(6)}° ${lngDir}`;
  const locText = (light.location || 'MG Road corridor, Kochi').replace(' (demo layout)', '');

  return `
    <div style="
      min-width:260px;max-width:300px;
      background:#050B18;
      color:#f8fafc;
      padding:16px;
      border-radius:16px;
      font-family:'Inter',system-ui,sans-serif;
      border:1.5px solid rgba(0,229,255,0.15);
      box-shadow:0 24px 40px rgba(0,0,0,0.7),0 0 30px rgba(0,229,255,0.06);
    ">
      <!-- Header -->
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <div>
          <span style="font-size:15px;font-weight:800;color:#00E5FF;letter-spacing:0.05em;">${light.id}</span>
          <div style="font-size:10px;color:#475569;margin-top:2px;font-weight:600;">${light.esp32DeviceId}</div>
        </div>
        <span style="
          font-size:9px;font-weight:900;text-transform:uppercase;
          padding:4px 10px;border-radius:9999px;
          background:${statusBg[light.status]};
          color:${statusLabel[light.status]};
          border:1px solid ${cfg.fill}33;
          letter-spacing:0.08em;
        ">${light.status}</span>
      </div>

      <!-- Coordinates & Location Box -->
      <div style="
        font-size:11px;color:#94a3b8;
        margin-bottom:12px;
        background:#020617;padding:8px 10px;border-radius:10px;
        border:1px solid rgba(0,229,255,0.18);
      ">
        <div style="display:flex;align-items:center;gap:6px;">
          <span style="font-size:12px;">📍</span>
          <span style="font-weight:700;color:#00E5FF;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:11px;letter-spacing:0.02em;">
            ${coordText}
          </span>
        </div>
        <div style="margin-top:3px;padding-left:19px;font-size:9.5px;color:#64748b;font-weight:500;">
          ${locText}
        </div>
      </div>

      <!-- Sensor readings -->
      <div style="
        display:grid;grid-template-columns:repeat(3,1fr);gap:6px;
        margin-bottom:12px;
      ">
        ${[
          { label: 'VOLTAGE', value: `${light.voltage}V`, color: '#FFB020' },
          { label: 'CURRENT', value: `${light.current.toFixed(2)}A`, color: '#00E5FF' },
          { label: 'POWER',   value: `${light.power}W`,   color: '#00F5A0' },
        ].map(s => `
          <div style="
            background:#020617;padding:8px 4px;border-radius:8px;text-align:center;
            border:1px solid rgba(255,255,255,0.04);
          ">
            <div style="font-size:9px;color:#475569;font-weight:700;margin-bottom:3px;">${s.label}</div>
            <div style="font-size:12px;font-weight:800;color:${s.color};font-family:monospace;">${s.value}</div>
          </div>
        `).join('')}
      </div>

      <!-- LDR + Temp -->
      <div style="display:flex;justify-content:space-between;font-size:10px;color:#64748b;margin-bottom:12px;">
        <span>🌡 ${light.temperature}°C</span>
        <span>💡 LDR: ${light.lightIntensity}%</span>
        <span>⚡ ${light.dimmingLevel}% dim</span>
      </div>

      ${light.status === 'fault' ? `
        <div style="
          background:#2d0410;color:#fecdd3;
          padding:8px 12px;border-radius:10px;
          font-size:11px;font-weight:700;
          border:1px solid #881337;
          margin-bottom:12px;
        ">
          🚨 Fault: <strong>${light.faultType.replace(/_/g, ' ')}</strong>
        </div>` : ''}

      <!-- CTA Button -->
      <button id="inspect-btn-${light.id}" style="
        width:100%;
        background:linear-gradient(135deg,#00E5FF22,#00E5FF11);
        color:#00E5FF;
        border:1px solid #00E5FF44;
        padding:9px 14px;
        border-radius:10px;
        font-size:11px;font-weight:800;
        cursor:pointer;letter-spacing:0.05em;
        transition:background 0.2s;
      " onmouseover="this.style.background='linear-gradient(135deg,#00E5FF44,#00E5FF22)'"
         onmouseout="this.style.background='linear-gradient(135deg,#00E5FF22,#00E5FF11)'">
        VIEW DETAILS &amp; SPECS →
      </button>
    </div>
  `;
}

type FilterStatus = 'all' | 'working' | 'fault' | 'warning' | 'offline';

export const MapView: React.FC = () => {
  const { streetLights, selectedPoleId, setSelectedPoleId, inspectPoleDetails } = useIoT();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef          = useRef<maplibregl.Map | null>(null);
  const markersRef      = useRef<Record<string, { marker: maplibregl.Marker; popup: maplibregl.Popup }>>({});
  const loadTimeoutRef  = useRef<number | null>(null);

  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [mapLoaded,    setMapLoaded]    = useState(false);
  const [mapError,     setMapError]     = useState(false);
  const [mapStyle,     setMapStyle]     = useState<'dark' | 'voyager'>('dark');

  const defaultCenter = KOCHI_ROAD_CENTER;

  // ── 1. Init MapLibre ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const styleUrl =
      mapStyle === 'dark'
        ? `https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json`
        : `https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json`;

    const map = new maplibregl.Map({
      container:   mapContainerRef.current,
      style:       styleUrl,
      center:      defaultCenter,
      zoom:        15.5,
      pitch:       0,
      bearing:     0,
      // Pass CARTO API key for authenticated requests
      transformRequest: (url: string) => {
        if (url.includes('basemaps.cartocdn.com')) {
          return {
            url: url.includes('?')
              ? `${url}&api_key=${CARTO_API_KEY}`
              : `${url}?api_key=${CARTO_API_KEY}`,
          };
        }
        return { url };
      },
    });

    // Nav controls (zoom + compass)
    map.addControl(new maplibregl.NavigationControl(), 'bottom-right');

    // Scale bar
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 100, unit: 'metric' }), 'bottom-left');

    loadTimeoutRef.current = window.setTimeout(() => setMapError(true), 15000);
    map.on('load', () => {
      if (loadTimeoutRef.current !== null) window.clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
      setMapLoaded(true);
      setMapError(false);
    });

    mapRef.current = map;

    // Inject pulse keyframe into document
    if (!document.getElementById('marker-pulse-style')) {
      const style = document.createElement('style');
      style.id = 'marker-pulse-style';
      style.textContent = `
        @keyframes markerPulse {
          0%,100% { transform: scale(1);   opacity: 0.25; }
          50%      { transform: scale(1.6); opacity: 0.05; }
        }
        .maplibregl-popup-content {
          background: transparent !important;
          padding: 0 !important;
          border-radius: 0 !important;
          box-shadow: none !important;
        }
        .maplibregl-popup-tip { display: none !important; }
        .maplibregl-popup-close-button {
          color: #64748b !important;
          font-size: 18px !important;
          right: 8px !important;
          top: 8px !important;
          background: transparent !important;
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      if (loadTimeoutRef.current !== null) window.clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // ── 2. Sync markers whenever streetLights or filter changes ──────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    // Remove all existing markers & popups
    Object.values(markersRef.current).forEach(({ marker, popup }) => {
      popup.remove();
      marker.remove();
    });
    markersRef.current = {};

    // Filter list
    const visible = filterStatus === 'all'
      ? streetLights
      : streetLights.filter((l) => l.status === filterStatus);

    visible.forEach((light) => {
      const mapLight = { ...light, location: 'MG Road corridor, Kochi' };
      const el    = createMarkerEl(light);
      const popup = new maplibregl.Popup({
        offset: 20,
        closeButton: true,
        maxWidth: '320px',
      }).setHTML(buildPopupHTML(mapLight));

      popup.on('open', () => {
        // Wire the inspect button inside the popup
        setTimeout(() => {
          const btn = document.getElementById(`inspect-btn-${light.id}`);
          if (btn) btn.onclick = () => inspectPoleDetails(light.id);
        }, 50);
      });

      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([light.lng, light.lat])
        .setPopup(popup)
        .addTo(map);

      markersRef.current[light.id] = { marker, popup };
    });
  }, [streetLights, filterStatus, mapLoaded]);

  // ── 3. Fly to selected pole ───────────────────────────────────────────────
  useEffect(() => {
    if (!selectedPoleId || !mapRef.current || !mapLoaded) return;
    const marker = markersRef.current[selectedPoleId]?.marker;
    if (!marker) return;

    mapRef.current.flyTo({
      center:   marker.getLngLat().toArray(),
      zoom:     18,
      pitch:    45,
      duration: 1500,
      essential: true,
    });

    setTimeout(() => {
      const entry = markersRef.current[selectedPoleId];
      if (entry && !entry.popup.isOpen()) entry.marker.togglePopup();
    }, 1600);
  }, [selectedPoleId, mapLoaded]);

  const focusPoleOnMap = (light: StreetLight) => {
    setFilterStatus('all');
    setSelectedPoleId(light.id);

    mapRef.current?.flyTo({
      center: [light.lng, light.lat],
      zoom: 18,
      pitch: 45,
      duration: 1500,
      essential: true,
    });

    window.setTimeout(() => {
      const entry = markersRef.current[light.id];
      if (entry && !entry.popup.isOpen()) entry.marker.togglePopup();
    }, 1600);
  };

  // ── 4. Style toggle (dark / voyager) ─────────────────────────────────────
  const handleStyleToggle = () => {
    const next = mapStyle === 'dark' ? 'voyager' : 'dark';
    setMapStyle(next);
    if (mapRef.current) {
      setMapLoaded(false);
      setMapError(false);
      if (loadTimeoutRef.current !== null) window.clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = window.setTimeout(() => setMapError(true), 15000);
      const styleUrl =
        next === 'dark'
          ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
          : 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';
      mapRef.current.setStyle(styleUrl);
      mapRef.current.once('style.load', () => {
        if (loadTimeoutRef.current !== null) window.clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
        setMapLoaded(true);
        setMapError(false);
      });
    }
  };

  // counts
  const counts = {
    total:   streetLights.length,
    working: streetLights.filter(l => l.status === 'working').length,
    fault:   streetLights.filter(l => l.status === 'fault').length,
    warning: streetLights.filter(l => l.status === 'warning').length,
    offline: streetLights.filter(l => l.status === 'offline').length,
  };

  const FILTERS: { key: FilterStatus; label: string; color: string; count: number }[] = [
    { key: 'all',     label: 'All',     color: 'border-cyan-500/50 text-cyan-400 bg-cyan-950/40',    count: counts.total   },
    { key: 'working', label: 'Working', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/40', count: counts.working },
    { key: 'fault',   label: 'Fault',   color: 'border-rose-500/40 text-rose-400 bg-rose-950/40',    count: counts.fault   },
    { key: 'warning', label: 'Warning', color: 'border-amber-500/40 text-amber-400 bg-amber-950/40', count: counts.warning },
    { key: 'offline', label: 'Offline', color: 'border-slate-600/40 text-slate-400 bg-slate-800/40', count: counts.offline },
  ];

  return (
    <div className="space-y-4 pb-12">
      {/* ── Page header ── */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="h-5 w-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white">GPS Location Tracking &amp; GIS Visualization</h2>
              <span className="rounded-full bg-cyan-950/60 px-2 py-0.5 text-[10px] text-cyan-400 border border-cyan-800/40 font-bold">
                CARTO VECTOR
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              Kochi, Kerala · MG Road demo corridor · {counts.total} roadside poles
            </p>
          </div>

          {/* Style toggle */}
          <button
            onClick={handleStyleToggle}
            className="flex items-center gap-2 rounded-xl border border-white/8 bg-slate-800/50 px-4 py-2 text-xs font-bold text-slate-400 hover:text-white hover:border-cyan-500/40 transition-all"
          >
            <Layers className="h-3.5 w-3.5" />
            {mapStyle === 'dark' ? 'Switch to Voyager' : 'Switch to Dark'}
          </button>
        </div>

        {/* ── Status filter chips ── */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-white/5">
          <Filter className="h-3.5 w-3.5 text-slate-600 shrink-0" />
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilterStatus(f.key)}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11px] font-bold transition-all ${
                filterStatus === f.key
                  ? f.color
                  : 'border-white/5 bg-transparent text-slate-600 hover:text-slate-400'
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${
                f.key === 'all'     ? 'bg-cyan-400' :
                f.key === 'working' ? 'bg-emerald-400' :
                f.key === 'fault'   ? 'bg-rose-400 animate-pulse' :
                f.key === 'warning' ? 'bg-amber-400' : 'bg-slate-500'
              }`} />
              {f.label}
              <span className="opacity-70">{f.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Map container ── */}
      <div className="relative overflow-hidden rounded-2xl border border-white/5 shadow-2xl"
        style={{ height: '680px', boxShadow: '0 0 60px rgba(0,229,255,0.05), 0 25px 50px rgba(0,0,0,0.6)' }}
      >
        {/* MapLibre canvas */}
        <div ref={mapContainerRef} className="h-full w-full" />

        {/* Loading overlay */}
        {!mapLoaded && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#050B18]/90 gap-3">
            {mapError ? (
              <p className="max-w-sm px-6 text-center text-xs font-semibold text-amber-300">
                The map is taking too long to load. Check your connection and try switching map style.
              </p>
            ) : (
              <>
                <div className="h-8 w-8 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin" />
                <p className="text-xs font-bold text-cyan-400 tracking-widest uppercase">Loading CARTO vector tiles…</p>
              </>
            )}
          </div>
        )}

        {/* ── Fault Quick-Pan panel (top-right overlay) ── */}
        <div className="absolute top-4 right-4 z-20 w-52 rounded-2xl border border-white/8 bg-[#050B18]/90 p-4 shadow-2xl backdrop-blur-xl">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-1.5">
            <AlertTriangle className="h-3 w-3 text-rose-500" />
            Faults &amp; Offline
          </p>

          {counts.fault === 0 && counts.offline === 0 ? (
            <div className="text-center py-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-500/50 mx-auto mb-1" />
              <p className="text-[11px] text-emerald-400 font-semibold">All Nodes Clear</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-52 overflow-y-auto pr-0.5">
              {streetLights
                .filter(l => l.status === 'fault' || l.status === 'offline')
                .map(light => (
                  <button
                    key={light.id}
                    onClick={() => focusPoleOnMap(light)}
                    className={`flex w-full items-center justify-between rounded-xl p-2.5 text-[10px] font-bold transition-all ${
                      light.status === 'fault'
                        ? 'bg-rose-950/60 text-rose-300 hover:bg-rose-900/60 border border-rose-900/50'
                        : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700/70 border border-slate-600/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-left">
                      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                        light.status === 'fault' ? 'bg-rose-400 animate-pulse' : 'bg-slate-400'
                      }`} />
                      <div>
                        <div className="font-black">{light.id}</div>
                        <div className={`font-semibold text-[9px] truncate max-w-24 ${
                          light.status === 'fault' ? 'text-rose-500' : 'text-slate-400'
                        }`}>
                          {light.status === 'offline' ? 'Offline' : light.faultType.replace(/_/g,' ')}
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] bg-rose-800/80 px-2 py-0.5 rounded-lg text-white font-black">Pan →</span>
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* ── Stats strip (bottom-left overlay) ── */}
        <div className="absolute bottom-8 left-4 z-20 flex items-center gap-2 rounded-2xl border border-white/8 bg-[#050B18]/85 px-4 py-3 backdrop-blur-xl">
          {[
            { icon: <Zap className="h-3 w-3 text-cyan-400" />, label: 'Nodes',   value: counts.total,   cls: 'text-cyan-300'   },
            { icon: <CheckCircle2 className="h-3 w-3 text-emerald-400" />, label: 'Working', value: counts.working, cls: 'text-emerald-300' },
            { icon: <AlertTriangle className="h-3 w-3 text-rose-400" />, label: 'Fault',   value: counts.fault,   cls: 'text-rose-300'   },
            { icon: <WifiOff className="h-3 w-3 text-slate-500" />, label: 'Offline', value: counts.offline, cls: 'text-slate-400'  },
          ].map((s, i) => (
            <React.Fragment key={s.label}>
              {i > 0 && <div className="w-px h-6 bg-white/5" />}
              <div className="text-center px-2">
                <div className="flex items-center justify-center gap-1 mb-0.5">{s.icon}</div>
                <div className={`font-mono-tech font-black text-sm ${s.cls}`}>{s.value}</div>
                <div className="text-[9px] text-slate-600 font-semibold">{s.label}</div>
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* ── Legend strip (bottom-right, just above nav controls) ── */}
        <div className="absolute bottom-20 right-4 z-20 flex flex-col gap-1.5 rounded-xl border border-white/8 bg-[#050B18]/85 px-3 py-2.5 backdrop-blur-xl text-[10px]">
          {[
            { color: 'bg-emerald-400', label: 'Working' },
            { color: 'bg-rose-500',    label: 'Fault',   pulse: true },
            { color: 'bg-amber-400',   label: 'Warning', pulse: true },
            { color: 'bg-slate-500',   label: 'Offline' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-2 font-semibold text-slate-300">
              <span className={`h-2.5 w-2.5 rounded-full ${l.color} ${l.pulse ? 'animate-pulse' : ''}`} />
              {l.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
