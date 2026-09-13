import React, { useEffect, useRef } from 'react';
import { useIoT } from '../../context/IoTContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';

export const MapView: React.FC = () => {
  const { streetLights, selectedPoleId, setSelectedPoleId, inspectPoleDetails } = useIoT();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});

  const defaultLat = 12.9716;
  const defaultLng = 77.5946;

  const createMarkerIcon = (status: string) => {
    let colorClass = '#10b981';
    let glowClass = 'rgba(16, 185, 129, 0.5)';
    let symbol = '💡';

    if (status === 'fault') {
      colorClass = '#f43f5e';
      glowClass = 'rgba(244, 63, 94, 0.9)';
      symbol = '🔴';
    } else if (status === 'warning') {
      colorClass = '#f59e0b';
      glowClass = 'rgba(245, 158, 11, 0.7)';
      symbol = '🟠';
    } else if (status === 'offline') {
      colorClass = '#64748b';
      glowClass = 'rgba(100, 116, 139, 0.4)';
      symbol = '⚫';
    }

    const html = `
      <div style="
        position: relative;
        width: 38px;
        height: 38px;
        background: ${colorClass};
        border: 3px solid #0f172a;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 18px ${glowClass};
        cursor: pointer;
        transition: transform 0.2s ease;
      ">
        <span style="font-size: 18px;">${symbol}</span>
      </div>
    `;

    return L.divIcon({
      html,
      className: 'custom-leaflet-marker',
      iconSize: [38, 38],
      iconAnchor: [19, 19],
      popupAnchor: [0, -20],
    });
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [defaultLat, defaultLng],
      zoom: 16.5,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    streetLights.forEach((light) => {
      const icon = createMarkerIcon(light.status);
      const marker = L.marker([light.lat, light.lng], { icon }).addTo(map);

      const popupHtml = `
        <div style="
          min-width: 250px;
          background-color: #0f172a;
          color: #f8fafc;
          padding: 14px;
          border-radius: 14px;
          font-family: system-ui, sans-serif;
          border: 1.5px solid #334155;
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);
        ">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <strong style="font-size: 16px; color: #38bdf8;">${light.id}</strong>
            <span style="
              font-size: 11px;
              font-weight: 800;
              text-transform: uppercase;
              padding: 3px 8px;
              border-radius: 9999px;
              background-color: ${
                light.status === 'working'
                  ? '#064e3b'
                  : light.status === 'fault'
                  ? '#881337'
                  : '#451a03'
              };
              color: ${
                light.status === 'working'
                  ? '#34d399'
                  : light.status === 'fault'
                  ? '#fb7185'
                  : '#fbbf24'
              };
            ">${light.status}</span>
          </div>

          <p style="font-size: 12px; color: #cbd5e1; margin: 0 0 10px 0;">📍 ${light.location}</p>

          <div style="
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 6px;
            background: #020617;
            padding: 8px;
            border-radius: 10px;
            text-align: center;
            font-size: 11px;
            margin-bottom: 12px;
          ">
            <div>
              <span style="color: #64748b; display: block; font-size: 9px; font-weight: 700;">VOLTAGE</span>
              <strong style="color: #e2e8f0; font-size: 12px;">${light.voltage}V</strong>
            </div>
            <div>
              <span style="color: #64748b; display: block; font-size: 9px; font-weight: 700;">CURRENT</span>
              <strong style="color: #e2e8f0; font-size: 12px;">${light.current}A</strong>
            </div>
            <div>
              <span style="color: #64748b; display: block; font-size: 9px; font-weight: 700;">POWER</span>
              <strong style="color: #38bdf8; font-size: 12px;">${light.power}W</strong>
            </div>
          </div>

          ${
            light.status === 'fault'
              ? `<div style="
                  background: #4c0519;
                  color: #fecdd3;
                  padding: 8px;
                  border-radius: 8px;
                  font-size: 11px;
                  margin-bottom: 10px;
                  font-weight: 600;
                ">
                  🚨 Fault: <strong>${light.faultType.replace(/_/g, ' ')}</strong>
                </div>`
              : ''
          }

          <button id="inspect-btn-${light.id}" style="
            width: 100%;
            background: #0284c7;
            color: white;
            border: none;
            padding: 8px 14px;
            border-radius: 10px;
            font-size: 12px;
            font-weight: 800;
            cursor: pointer;
            transition: background 0.2s ease;
          ">
            View Fault Location & Specs →
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`inspect-btn-${light.id}`);
        if (btn) {
          btn.onclick = () => {
            inspectPoleDetails(light.id);
          };
        }
      });

      markersRef.current[light.id] = marker;
    });
  }, [streetLights]);

  useEffect(() => {
    if (!selectedPoleId) return;
    const targetPole = streetLights.find((l) => l.id === selectedPoleId);
    const map = mapInstanceRef.current;
    if (targetPole && map) {
      map.flyTo([targetPole.lat, targetPole.lng], 18, { duration: 1.2 });

      const marker = markersRef.current[selectedPoleId];
      if (marker) {
        setTimeout(() => marker.openPopup(), 1300);
      }
    }
  }, [selectedPoleId]);

  return (
    <div className="space-y-4 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <MapPin className="h-7 w-7 text-cyan-400" />
            GPS Location Tracking & GIS Map Visualization
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Real-time geolocation mapping of street light poles with interactive status markers.
          </p>
        </div>

        <div className="flex items-center space-x-4 rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-sm">
          <span className="flex items-center space-x-1.5">
            <span className="h-3 w-3 rounded-full bg-emerald-500 shadow-md shadow-emerald-500" />
            <span className="text-slate-200 font-bold">Working</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="h-3 w-3 rounded-full bg-rose-500 shadow-md shadow-rose-500 animate-pulse" />
            <span className="text-slate-200 font-bold">Fault</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="h-3 w-3 rounded-full bg-amber-500 shadow-md shadow-amber-500" />
            <span className="text-slate-200 font-bold">Warning</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="h-3 w-3 rounded-full bg-slate-500" />
            <span className="text-slate-400 font-bold">Offline</span>
          </span>
        </div>
      </div>

      <div className="relative h-[700px] w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
        <div ref={mapContainerRef} className="h-full w-full z-10" />

        <div className="absolute top-4 right-4 z-20 max-w-sm rounded-xl border border-slate-800 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-md hidden sm:block">
          <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2.5">
            Fault Node Quick Pan
          </p>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {streetLights.filter((l) => l.status === 'fault').length === 0 ? (
              <p className="text-sm text-emerald-400 font-semibold">No active faults on map</p>
            ) : (
              streetLights
                .filter((l) => l.status === 'fault')
                .map((light) => (
                  <button
                    key={light.id}
                    onClick={() => setSelectedPoleId(light.id)}
                    className="flex w-full items-center justify-between rounded-lg bg-rose-950/60 p-2.5 text-xs font-extrabold text-rose-200 hover:bg-rose-900 border border-rose-900 transition-all"
                  >
                    <span>{light.id} - {light.location.split('-')[0]}</span>
                    <span className="text-xs bg-rose-800 px-2 py-0.5 rounded text-white font-bold">
                      Pan →
                    </span>
                  </button>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
