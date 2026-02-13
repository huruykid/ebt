// Plain Leaflet map (no react-leaflet wrapper) - React 18 compatible — build v2
import React, { useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import { isRmpEnrolled } from '@/utils/storeUtils';
import { isStoreOpen } from '@/utils/storeHoursUtils';
import type { Tables } from '@/integrations/supabase/types';

// Fix Leaflet default marker icons using CDN URLs
const MARKER_ICON = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const MARKER_ICON_2X = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const MARKER_SHADOW = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: MARKER_ICON_2X,
  iconUrl: MARKER_ICON,
  shadowUrl: MARKER_SHADOW,
});

type Store = Tables<'snap_stores'>;

interface StoreWithDistance extends Store {
  distance?: number;
}

interface StoreMapViewProps {
  stores: StoreWithDistance[];
  locationSearch: { lat: number; lng: number } | null;
}

const GREEN_ICON_URL = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png';
const GRAY_ICON_URL = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png';

const greenIcon = new L.Icon({
  iconUrl: GREEN_ICON_URL,
  shadowUrl: MARKER_SHADOW,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const grayIcon = new L.Icon({
  iconUrl: GRAY_ICON_URL,
  shadowUrl: MARKER_SHADOW,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function isStoreOpenNow(store: Store): boolean | null {
  return isStoreOpen(store.google_opening_hours as any);
}

export const StoreMapView: React.FC<StoreMapViewProps> = ({ stores, locationSearch }) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  const center = useMemo<[number, number]>(() => {
    if (locationSearch) return [locationSearch.lat, locationSearch.lng];
    const valid = stores.find(s => s.Latitude && s.Longitude);
    if (valid) return [valid.Latitude!, valid.Longitude!];
    return [39.8283, -98.5795];
  }, [stores, locationSearch]);

  const validStores = useMemo(
    () => stores.filter(s => s.Latitude && s.Longitude),
    [stores]
  );

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center,
      zoom: 12,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    markersRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = null;
    };
  }, []);

  // Update markers when stores change
  useEffect(() => {
    const map = mapRef.current;
    const markerGroup = markersRef.current;
    if (!map || !markerGroup) return;

    markerGroup.clearLayers();

    validStores.forEach((store) => {
      const openStatus = isStoreOpenNow(store);
      const icon = openStatus === true ? greenIcon : grayIcon;
      const isRmp = isRmpEnrolled(store.Incentive_Program);

      const marker = L.marker([store.Latitude!, store.Longitude!], { icon });

      const popupContent = `
        <div style="min-width:200px;font-size:14px;">
          <p style="font-weight:600;font-size:16px;margin:0 0 4px 0;">${store.Store_Name || 'Unknown Store'}</p>
          <p style="color:#666;font-size:12px;margin:0 0 6px 0;">${store.Store_Type || 'Store'}</p>
          <div style="display:flex;gap:4px;margin-bottom:6px;">
            <span style="display:inline-flex;align-items:center;padding:2px 6px;border-radius:9999px;font-size:10px;font-weight:600;background:#dcfce7;color:#166534;">✓ EBT</span>
            ${isRmp ? '<span style="display:inline-flex;align-items:center;padding:2px 6px;border-radius:9999px;font-size:10px;font-weight:600;background:#f3e8ff;color:#6b21a8;">🍽️ RMP</span>' : ''}
          </div>
          ${store.Store_Street_Address ? `<p style="font-size:12px;color:#666;margin:0 0 4px 0;">📍 ${store.Store_Street_Address}, ${store.City}, ${store.State}</p>` : ''}
          ${store.distance !== undefined ? `<p style="font-size:12px;color:#666;margin:0 0 8px 0;">🧭 ${store.distance.toFixed(1)} mi away</p>` : ''}
          <a href="/store/${store.id}" style="font-size:12px;font-weight:500;color:#3b82f6;text-decoration:none;">View Details →</a>
        </div>
      `;

      marker.bindPopup(popupContent);
      markerGroup.addLayer(marker);
    });

    // Fit bounds
    if (validStores.length > 0) {
      const bounds = L.latLngBounds(
        validStores.map(s => [s.Latitude!, s.Longitude!] as [number, number])
      );
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    } else if (locationSearch) {
      map.setView([locationSearch.lat, locationSearch.lng], 12);
    }
  }, [validStores, locationSearch]);

  return (
    <div
      ref={containerRef}
      className="rounded-lg overflow-hidden border border-border"
      style={{ height: '500px', width: '100%' }}
    />
  );
};
