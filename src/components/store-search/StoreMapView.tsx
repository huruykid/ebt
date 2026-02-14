// Plain Leaflet map (no react-leaflet wrapper) - React 18 compatible — build v3
import React, { useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import DOMPurify from 'dompurify';
import { isRmpEnrolled } from '@/utils/storeUtils';
import { isStoreOpen } from '@/utils/storeHoursUtils';
import type { Tables } from '@/integrations/supabase/types';

// Fix Leaflet default marker icons using local assets
const MARKER_ICON = '/map/marker-icon.png';
const MARKER_ICON_2X = '/map/marker-icon-2x.png';
const MARKER_SHADOW = '/map/marker-shadow.png';

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

const greenIcon = new L.Icon({
  iconUrl: '/map/marker-icon-2x-green.png',
  shadowUrl: MARKER_SHADOW,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const grayIcon = new L.Icon({
  iconUrl: '/map/marker-icon-2x-grey.png',
  shadowUrl: MARKER_SHADOW,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const userIcon = new L.DivIcon({
  html: '<div style="width:16px;height:16px;background:#3b82f6;border:3px solid #fff;border-radius:50%;box-shadow:0 0 0 2px #3b82f6,0 2px 6px rgba(0,0,0,0.3);"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  className: '',
});

/** Escape text for safe HTML insertion */
function escapeHtml(text: string): string {
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}

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

    // Add user location marker
    if (locationSearch) {
      const userMarker = L.marker([locationSearch.lat, locationSearch.lng], { icon: userIcon, zIndexOffset: 1000 });
      userMarker.bindPopup('<div style="font-size:14px;font-weight:600;">📍 Your Location</div>');
      markerGroup.addLayer(userMarker);
    }

    validStores.forEach((store) => {
      const openStatus = isStoreOpenNow(store);
      const icon = openStatus === true ? greenIcon : grayIcon;
      const isRmp = isRmpEnrolled(store.Incentive_Program);

      const marker = L.marker([store.Latitude!, store.Longitude!], { icon });

      const safeName = escapeHtml(store.Store_Name || 'Unknown Store');
      const safeType = escapeHtml(store.Store_Type || 'Store');
      const safeAddress = store.Store_Street_Address ? escapeHtml(store.Store_Street_Address) : '';
      const safeCity = store.City ? escapeHtml(store.City) : '';
      const safeState = store.State ? escapeHtml(store.State) : '';

      const popupContent = `
        <div style="min-width:200px;font-size:14px;">
          <p style="font-weight:600;font-size:16px;margin:0 0 4px 0;">${safeName}</p>
          <p style="color:#666;font-size:12px;margin:0 0 6px 0;">${safeType}</p>
          <div style="display:flex;gap:4px;margin-bottom:6px;">
            <span style="display:inline-flex;align-items:center;padding:2px 6px;border-radius:9999px;font-size:10px;font-weight:600;background:#dcfce7;color:#166534;">✓ EBT</span>
            ${isRmp ? '<span style="display:inline-flex;align-items:center;padding:2px 6px;border-radius:9999px;font-size:10px;font-weight:600;background:#f3e8ff;color:#6b21a8;">🍽️ RMP</span>' : ''}
          </div>
          ${safeAddress ? `<p style="font-size:12px;color:#666;margin:0 0 4px 0;">📍 ${safeAddress}, ${safeCity}, ${safeState}</p>` : ''}
          ${store.distance !== undefined ? `<p style="font-size:12px;color:#666;margin:0 0 8px 0;">🧭 ${store.distance.toFixed(1)} mi away</p>` : ''}
          <a href="/store/${store.id}" style="font-size:12px;font-weight:500;color:#3b82f6;text-decoration:none;">View Details →</a>
        </div>
      `;

      marker.bindPopup(popupContent);
      markerGroup.addLayer(marker);
    });

    // Fit bounds including user location
    const allPoints: [number, number][] = validStores.map(s => [s.Latitude!, s.Longitude!] as [number, number]);
    if (locationSearch) allPoints.push([locationSearch.lat, locationSearch.lng]);

    if (allPoints.length > 0) {
      const bounds = L.latLngBounds(allPoints);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
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
