'use client';

import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { getMap } from '@/actions/stima';

export type StimaMapHandle = {
  panTo: (lat: number, lng: number) => void;
};

// Default center (Nairobi, Kenya)
const DEFAULT_CENTER = { lat: -1.2921, lng: 36.8219 };

export const StimaMap = forwardRef<StimaMapHandle, {}>((props, ref) => {
  const [reports, setReports] = useState<any[]>([]);
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [zoom, setZoom] = useState(13);

  useImperativeHandle(ref, () => ({
    panTo(lat: number, lng: number) {
      setCenter({ lat, lng });
      setZoom(16);
    },
  }));

  useEffect(() => {
    // Fetch initial map data
    const fetchMap = async () => {
      const data = await getMap();
      setReports(data);
    };
    fetchMap();

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
        {reports.map((report, idx) => (
          <AdvancedMarker key={idx} position={{ lat: parseFloat(report.lat), lng: parseFloat(report.lng) }}>
            <Pin
              background={report.hasStima ? '#22c55e' : '#ef4444'}
              borderColor={report.hasStima ? '#166534' : '#991b1b'}
              glyphColor={report.hasStima ? '#ffffff' : '#000000'}
            />
          </AdvancedMarker>
        ))}
      </Map>
    </div>
  );
});

StimaMap.displayName = 'StimaMap';
