/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useMetroStore } from './state/useMetroStore';
import { TopBar } from './components/TopBar';
import { BottomNav } from './components/BottomNav';
import { ActiveTripPill } from './components/ActiveTripPill';
import { QuotaBanner } from './components/QuotaBanner';
import { ExploreScreen } from './screens/ExploreScreen';
import { MapScreen } from './screens/MapScreen';
import { PhysicalTicketAIScreen } from './screens/PhysicalTicketAIScreen';
import { TicketingHubScreen } from './screens/TicketingHubScreen';
import { StationScene } from './three/StationScene';
import { CarriageScene } from './three/CarriageScene';
import { Navigation, ShieldCheck } from 'lucide-react';

export default function App() {
  const {
    activeTab,
    activeCityId,
    setCity,
    setGoogleMapsApiKey,
    initializeLocation,
    locationState,
    refreshArrivals,
  } = useMetroStore();

  const [showLocationExplainer, setShowLocationExplainer] = useState(false);

  useEffect(() => {
    // Load initial city
    setCity(activeCityId);

    // Fetch config for Google Maps API Key
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.googleMapsApiKey) {
          setGoogleMapsApiKey(data.googleMapsApiKey);
        }
      })
      .catch((err) => console.warn('Config fetch bypassed:', err));

    if (locationState.permissionStatus === 'prompt') {
      setShowLocationExplainer(true);
    }

    // 15s train arrivals poll interval
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        refreshArrivals();
      }
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const handleGrantLocation = () => {
    setShowLocationExplainer(false);
    initializeLocation();
  };

  const handleSkipLocation = () => {
    setShowLocationExplainer(false);
  };

  return (
    <div className="relative w-screen h-screen flex flex-col bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Google Maps Quota Banner */}
      <QuotaBanner />

      {/* Top Application Bar matching Image 3 */}
      <TopBar />

      {/* Main Screen Area */}
      <main className="flex-1 w-full relative overflow-hidden">
        {activeTab === 'explore' && <ExploreScreen />}
        {activeTab === 'map' && <MapScreen />}
        {activeTab === 'ticket_ai' && <PhysicalTicketAIScreen />}
        {activeTab === 'wallet' && <TicketingHubScreen />}
        {activeTab === 'walk' && <StationScene />}
        {activeTab === 'ride' && <CarriageScene />}
      </main>

      {/* Floating Active Trip Pill */}
      <ActiveTripPill />

      {/* Floating Pill Bottom Navigation matching Image 3 */}
      <BottomNav />

      {/* Location Explainer Modal */}
      {showLocationExplainer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 text-center shadow-2xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto shadow-inner">
              <Navigation className="w-7 h-7 animate-pulse" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Enable Live Transit Location
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                MetroMate uses your on-device GPS to locate station entrances, give walking ETA, and detect when you reach the station gates.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={handleGrantLocation}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold shadow-md transition-all active:scale-95"
              >
                Allow Location Access
              </button>
              <button
                onClick={handleSkipLocation}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl text-xs font-semibold transition-colors"
              >
                Choose City Manually
              </button>
            </div>

            <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% On-Device Privacy · No External Tracking</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
