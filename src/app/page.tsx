'use client';

import { useRef, useState } from 'react';
import { CheckForm } from '@/components/CheckForm';
import { ReportForm } from '@/components/ReportForm';
import { StimaMap, StimaMapHandle } from '@/components/StimaMap';
import { Zap } from 'lucide-react';

export default function Home() {
  const mapRef = useRef<StimaMapHandle>(null);
  const mapSectionRef = useRef<HTMLDivElement>(null);

  // States to toggle between forms
  const [activeForm, setActiveForm] = useState<'check' | 'report'>('check');

  const scrollToMap = (lat: number, lng: number) => {
    // Pan Map
    if (mapRef.current) {
      mapRef.current.panTo(lat, lng);
    }
    // Scroll page to map smoothly
    if (mapSectionRef.current) {
      mapSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleWantToReport = (lat: number, lng: number) => {
    setActiveForm('report');
    // Pre-filling the form with coordinates accurately requires a slightly different approach,
    // but toggling to the report tab is the main user experience flow.
    // In a real scenario we'd pass the coordinate to ReportForm via state or context.
  };

  return (
    <main className="min-h-screen flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-br from-yellow-400 via-yellow-300 to-orange-400 py-20 px-4 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-10 left-10 opacity-20 transform -rotate-12"><Zap size={120} /></div>
        <div className="absolute bottom-10 right-10 opacity-20 transform rotate-12"><Zap size={200} /></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center justify-center p-4 bg-white/30 backdrop-blur-sm rounded-full mb-6 shadow-xl animate-bounce">
            <Zap className="text-yellow-600 w-10 h-10" fill="currentColor" />
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6 drop-shadow-sm">
            Kwenu Kuna Stima?
          </h1>
          <p className="text-xl md:text-2xl font-bold text-slate-800 mb-12 max-w-2xl mx-auto drop-shadow-md">
            Usiteseke na giza peke yako. Angalia kama majirani wako na stima, ama uwaambie nyinyi mko nayo!
          </p>

          {/* Form Tabs */}
          <div className="max-w-xl mx-auto">
            <div className="flex gap-2 bg-white/20 backdrop-blur-md p-1 rounded-2xl mb-6 border border-white/30">
              <button
                onClick={() => setActiveForm('check')}
                className={`flex-1 py-3 px-6 rounded-xl font-bold text-lg transition-all shadow-sm ${
                  activeForm === 'check' 
                    ? 'bg-white text-yellow-600 shadow-md transform scale-105' 
                    : 'text-slate-800 hover:bg-white/40'
                }`}
              >
                Angalia Stima
              </button>
              <button
                onClick={() => setActiveForm('report')}
                className={`flex-1 py-3 px-6 rounded-xl font-bold text-lg transition-all shadow-sm ${
                  activeForm === 'report' 
                    ? 'bg-slate-800 text-yellow-400 shadow-md transform scale-105' 
                    : 'text-slate-800 hover:bg-white/40'
                }`}
              >
                Sema Kama Iko
              </button>
            </div>

            {/* Render Active Form */}
            <div className="relative">
              {activeForm === 'check' ? (
                <div key="check" className="animate-in slide-in-from-left-8 fade-in duration-300">
                  <CheckForm onResult={scrollToMap} onWantToReport={handleWantToReport} />
                </div>
              ) : (
                <div key="report" className="animate-in slide-in-from-right-8 fade-in duration-300">
                  <ReportForm onReported={scrollToMap} />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section ref={mapSectionRef} className="w-full max-w-6xl mx-auto py-20 px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-slate-800 mb-4">Ramani Ya Stima</h2>
          <p className="text-slate-500 font-medium">Ona mahali stima iko na mahali imepotea.</p>
        </div>
        
        <StimaMap ref={mapRef} />
      </section>
      
      <footer className="w-full text-center py-8 text-slate-400 font-medium">
        Made with 💛 & 💡 kwa ajili ya Wakenya
      </footer>
    </main>
  );
}
