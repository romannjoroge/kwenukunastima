'use client';

import { useState } from 'react';
import { LocationAutocomplete } from './LocationAutocomplete';
import { checkIfStima } from '@/actions/stima';
import { Search, ZapOff, Zap, HelpCircle } from 'lucide-react';

interface CheckFormProps {
  onResult: (lat: number, lng: number) => void;
  onWantToReport: (place: google.maps.places.PlaceResult) => void;
}

export function CheckForm({ onResult, onWantToReport }: CheckFormProps) {
  const [selectedPlace, setSelectedPlace] = useState<google.maps.places.PlaceResult | null>(null);
  const [status, setStatus] = useState<boolean | 'unknown' | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    if (!selectedPlace || !selectedPlace.geometry?.location) return;

    setLoading(true);
    setStatus(null);
    const lat = selectedPlace.geometry.location.lat();
    const lng = selectedPlace.geometry.location.lng();

    const res = await checkIfStima(lat, lng);
    setStatus(res.status);
    setLoading(false);

    if (res.status !== 'unknown') {
      onResult(lat, lng);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-xl border border-yellow-100 transform transition-all hover:scale-[1.01]">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Search className="text-yellow-500" />
        Kuna stima base yenu?
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-2">Weka Location Yako</label>
          <LocationAutocomplete onPlaceSelect={setSelectedPlace} />
        </div>
        
        <button
          onClick={handleCheck}
          disabled={!selectedPlace || loading}
          className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-yellow-300/50 transition-all active:scale-95 flex items-center justify-center gap-2 text-lg"
        >
          {loading ? 'Inaangalia...' : 'Angalia'}
        </button>

        {status !== null && (
          <div className="mt-8 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-4">
            {status === true && (
              <div className="flex flex-col items-center text-center space-y-3 p-4 bg-green-50 rounded-2xl">
                <div className="bg-green-100 p-3 rounded-full"><Zap className="w-8 h-8 text-green-600" /></div>
                <h3 className="font-bold text-green-800 text-xl">Wako na stima! 💡</h3>
                <p className="text-green-600 text-sm">Zima hiyo generator, stima iko.</p>
              </div>
            )}
            {status === false && (
              <div className="flex flex-col items-center text-center space-y-3 p-4 bg-red-50 rounded-2xl">
                <div className="bg-red-100 p-3 rounded-full"><ZapOff className="w-8 h-8 text-red-600" /></div>
                <h3 className="font-bold text-red-800 text-xl">Hakuna stima! 🕯️</h3>
                <p className="text-red-600 text-sm">Nunua mishumaa, giza ingali.</p>
              </div>
            )}
            {status === 'unknown' && (
              <div className="flex flex-col items-center text-center space-y-4 p-4 bg-slate-50 rounded-2xl">
                <div className="bg-slate-200 p-3 rounded-full"><HelpCircle className="w-8 h-8 text-slate-600" /></div>
                <h3 className="font-bold text-slate-800 text-xl">Hatujui vizuri... 🤔</h3>
                <p className="text-slate-600 text-sm">Hakuna mtu amereport hii area recently.</p>
                <button 
                  onClick={() => selectedPlace && onWantToReport(selectedPlace)}
                  className="bg-slate-800 text-white px-6 py-2 rounded-full font-semibold hover:bg-slate-700 transition-colors shadow-md"
                >
                  Sema kama uko na stima
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
