'use client';
import { useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  useMap,
} from 'react-leaflet';
import type { LatLngExpression, LatLngBoundsExpression } from 'leaflet';

function FitBounds({ bounds }: { bounds: LatLngBoundsExpression }) {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(bounds, { padding: [20, 20] });
  }, [map, bounds]);
  return null;
}

/** path is [[lon, lat], ...]; Leaflet wants [lat, lon]. */
export default function ActivityMapInner({ path }: { path: [number, number][] }) {
  const latlngs: LatLngExpression[] = path.map(([lon, lat]) => [lat, lon]);
  const lats = path.map(([, lat]) => lat);
  const lons = path.map(([lon]) => lon);
  const bounds: LatLngBoundsExpression = [
    [Math.min(...lats), Math.min(...lons)],
    [Math.max(...lats), Math.max(...lons)],
  ];
  const start = latlngs[0];
  const end = latlngs[latlngs.length - 1];

  return (
    <MapContainer
      style={{ height: 360, width: '100%', borderRadius: 12 }}
      scrollWheelZoom={false}
      center={start}
      zoom={14}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Polyline positions={latlngs} pathOptions={{ color: '#58a6ff', weight: 4 }} />
      <CircleMarker center={start} radius={6} pathOptions={{ color: '#69f0ae', fillOpacity: 1 }} />
      <CircleMarker center={end} radius={6} pathOptions={{ color: '#ff5252', fillOpacity: 1 }} />
      <FitBounds bounds={bounds} />
    </MapContainer>
  );
}
