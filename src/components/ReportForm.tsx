'use client';

import { useState } from 'react';
import { LocationAutocomplete } from './LocationAutocomplete';
import { setIfStima } from '@/actions/stima';
import { Megaphone, Zap, ZapOff } from 'lucide-react';

interface ReportFormProps {
  onReported: (lat: number, lng: number) => void;
  initialPlace?: google.maps.places.PlaceResult | null;
}

export function ReportForm({ onReported, initialPlace }: ReportFormProps) {
  const [selectedPlace, setSelectedPlace] = useState<google.maps.places.PlaceResult | null>(initialPlace || null);
  const [hasStima, setHasStima] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const handleReport = async () => {
    if (!selectedPlace || !selectedPlace.geometry?.location || hasStima === null) return;

    setLoading(true);
    const lat = selectedPlace.geometry.location.lat();
    const lng = selectedPlace.geometry.location.lng();

    const res = await setIfStima(lat, lng, hasStima);
    setLoading(false);

    if (res.success) {
      onReported(lat, lng);
      // Reset
      setHasStima(null);
    } else {
      alert("Imeleta shida. Jaribu tena baadaye.");
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-xl border border-yellow-100 transform transition-all hover:scale-[1.01]">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Megaphone className="text-yellow-500" />
        Sema kama ukona stima
      </h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-2">Location ya Kwenu</label>
          <LocationAutocomplete onPlaceSelect={setSelectedPlace} initialPlace={initialPlace} />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-3">Hali Ya Stima</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setHasStima(true)}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                hasStima === true 
                  ? 'border-green-500 bg-green-50 text-green-700 shadow-inner' 
                  : 'border-slate-200 hover:border-green-300 text-slate-600'
              }`}
            >
              <Zap className={hasStima === true ? 'text-green-600' : 'text-slate-400'} />
              <span className="font-bold">Iko! 💡</span>
            </button>
            <button
              onClick={() => setHasStima(false)}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                hasStima === false 
                  ? 'border-red-500 bg-red-50 text-red-700 shadow-inner' 
                  : 'border-slate-200 hover:border-red-300 text-slate-600'
              }`}
            >
              <ZapOff className={hasStima === false ? 'text-red-600' : 'text-slate-400'} />
              <span className="font-bold">Imeenda! 🕯️</span>
            </button>
          </div>
        </div>

        <button
          onClick={handleReport}
          disabled={!selectedPlace || hasStima === null || loading}
          className="w-full bg-slate-800 hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 text-lg"
        >
          {loading ? 'Inatuma...' : 'Sema'}
        </button>
      </div>
    </div>
  );
}
