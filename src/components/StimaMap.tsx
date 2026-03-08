'use client';

import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';
import { getMap } from '@/actions/stima';

const ReportCircle = ({ center, hasStima }: { center: { lat: number; lng: number }; hasStima: boolean }) => {
  const map = useMap();
  const [circle, setCircle] = useState<google.maps.Circle | null>(null);

  useEffect(() => {
    if (!map) return;

    const newCircle = new google.maps.Circle({
      strokeColor: hasStima ? '#166534' : '#991b1b',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: hasStima ? '#22c55e' : '#ef4444',
      fillOpacity: 0.35,
      map,
      center,
      radius: 100, // 100 meters
    });
    setCircle(newCircle);

    return () => {
      newCircle.setMap(null);
    };
  }, [map]);

  useEffect(() => {
    if (circle) {
      circle.setOptions({
        center,
        strokeColor: hasStima ? '#166534' : '#991b1b',
        fillColor: hasStima ? '#22c55e' : '#ef4444',
      });
    }
  }, [circle, center, hasStima]);

  return null;
};

export type StimaMapHandle = {
  panTo: (lat: number, lng: number) => void;
  refresh: () => Promise<void>;
};

// Default center (Nairobi, Kenya)
const DEFAULT_CENTER = { lat: -1.2921, lng: 36.8219 };

export const StimaMap = forwardRef<StimaMapHandle, {}>((props, ref) => {
  const [reports, setReports] = useState<any[]>([]);
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [zoom, setZoom] = useState(13);

  const fetchMapData = async () => {
    const data = await getMap();
    setReports(data);
  };

  useImperativeHandle(ref, () => ({
    panTo(lat: number, lng: number) {
      setCenter({ lat, lng });
      setZoom(16);
    },
    async refresh() {
      await fetchMapData();
    }
  }));

  useEffect(() => {
    // Fetch initial map data
    fetchMapData();

    // Set default location to user's location if available
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
  }, []);

  return (
    <div className="w-full h-[500px] rounded-2xl overflow-hidden shadow-2xl border-4 border-yellow-400 relative">
      <Map
        defaultZoom={13}
        center={center}
        zoom={zoom}
        onCameraChanged={(ev) => {
          setCenter(ev.detail.center);
          setZoom(ev.detail.zoom);
        }}
        mapId="KWENU_KUNA_STIMA_MAP_ID"
        disableDefaultUI={true}
      >
        {reports.map((report, idx) => {
          const position = { lat: parseFloat(report.lat), lng: parseFloat(report.lng) };
          return (
            <div key={idx}>
              <AdvancedMarker position={position}>
                <Pin
                  background={report.hasStima ? '#22c55e' : '#ef4444'}
                  borderColor={report.hasStima ? '#166534' : '#991b1b'}
                  glyphColor={report.hasStima ? '#ffffff' : '#000000'}
                />
              </AdvancedMarker>
              <ReportCircle center={position} hasStima={report.hasStima} />
            </div>
          );
        })}
      </Map>
    </div>
  );
});

StimaMap.displayName = 'StimaMap';
