import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import { isRmpEnrolled } from '@/utils/storeUtils';
import { isStoreOpen } from '@/utils/storeHoursUtils';
import type { Tables } from '@/integrations/supabase/types';

// Fix Leaflet default marker icons in bundled apps using CDN URLs
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

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: MARKER_SHADOW,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const grayIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
  shadowUrl: MARKER_SHADOW,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function isStoreOpenNow(store: Store): boolean | null {
  return isStoreOpen(store.google_opening_hours as any);
}

function FitBounds({ stores, locationSearch }: { stores: StoreWithDistance[]; locationSearch: { lat: number; lng: number } | null }) {
  const map = useMap();

  useEffect(() => {
    const validStores = stores.filter(s => s.Latitude && s.Longitude);
    if (validStores.length > 0) {
      const bounds = L.latLngBounds(
        validStores.map(s => [s.Latitude!, s.Longitude!] as [number, number])
      );
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    } else if (locationSearch) {
      map.setView([locationSearch.lat, locationSearch.lng], 12);
    }
  }, [stores, locationSearch, map]);

  return null;
}

export const StoreMapView: React.FC<StoreMapViewProps> = ({ stores, locationSearch }) => {
  const center = useMemo<[number, number]>(() => {
    if (locationSearch) return [locationSearch.lat, locationSearch.lng];
    const valid = stores.find(s => s.Latitude && s.Longitude);
    if (valid) return [valid.Latitude!, valid.Longitude!];
    return [39.8283, -98.5795]; // US center
  }, [stores, locationSearch]);

  const validStores = useMemo(
    () => stores.filter(s => s.Latitude && s.Longitude),
    [stores]
  );

  return (
    <div className="rounded-lg overflow-hidden border border-border" style={{ height: '500px' }}>
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds stores={validStores} locationSearch={locationSearch} />
        {validStores.map((store) => {
          const openStatus = isStoreOpenNow(store);
          const icon = openStatus === true ? greenIcon : grayIcon;
          const isRmp = isRmpEnrolled(store.Incentive_Program);

          return (
            <Marker
              key={store.id}
              position={[store.Latitude!, store.Longitude!]}
              icon={icon}
            >
              <Popup>
                <div className="min-w-[200px] text-sm">
                  <p className="font-semibold text-foreground text-base mb-1">
                    {store.Store_Name || 'Unknown Store'}
                  </p>
                  <p className="text-muted-foreground text-xs mb-1.5">
                    {store.Store_Type || 'Store'}
                  </p>
                  <div className="flex gap-1 mb-1.5">
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-800">
                      ✓ EBT
                    </span>
                    {isRmp && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-800">
                        🍽️ RMP
                      </span>
                    )}
                  </div>
                  {store.Store_Street_Address && (
                    <p className="text-xs text-muted-foreground mb-1">
                      <MapPin className="inline h-3 w-3 mr-0.5" />
                      {store.Store_Street_Address}, {store.City}, {store.State}
                    </p>
                  )}
                  {store.distance !== undefined && (
                    <p className="text-xs text-muted-foreground mb-2">
                      <Navigation className="inline h-3 w-3 mr-0.5" />
                      {store.distance.toFixed(1)} mi away
                    </p>
                  )}
                  <Link
                    to={`/store/${store.id}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    View Details <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
