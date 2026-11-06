/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useMetroStore, TabType } from '../state/useMetroStore';
import { Compass, Map, Sparkles, QrCode, Train } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, locationState, simulateAtStation } = useMetroStore();

  const isAtStation =
    locationState.geofenceState === 'AT_ENTRANCE' ||
    locationState.geofenceState === 'INSIDE' ||
    simulateAtStation;

  return (
    <div className="fixed bottom-4 left-0 right-0 z-40 pointer-events-none flex justify-center px-4">
      {/* Floating Pill Dock matching Image 3 */}
      <nav className="pointer-events-auto bg-slate-900/95 border border-slate-800 text-white rounded-full px-5 py-2.5 shadow-2xl shadow-slate-950/40 backdrop-blur-xl flex items-center gap-6">
        {/* Tab 1: Explore */}
        <button
          onClick={() => setActiveTab('explore')}
          className={`min-h-[44px] flex flex-col items-center justify-center transition-all ${
            activeTab === 'explore' ? 'text-sky-400 font-bold scale-105' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Train className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight">Explore</span>
        </button>

        {/* Tab 2: Map & Directions */}
        <button
          onClick={() => setActiveTab('map')}
          className={`min-h-[44px] flex flex-col items-center justify-center transition-all ${
            activeTab === 'map' ? 'text-sky-400 font-bold scale-105' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Map className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight">Map</span>
        </button>

        {/* Tab 3: Physical Ticket AI */}
        <button
          onClick={() => setActiveTab('ticket_ai')}
          className={`min-h-[44px] flex flex-col items-center justify-center transition-all ${
            activeTab === 'ticket_ai' ? 'text-sky-400 font-bold scale-105' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="text-[10px] mt-0.5 tracking-tight">Ticket AI</span>
        </button>

        {/* Tab 4: Wallet */}
        <button
          onClick={() => setActiveTab('wallet')}
          className={`min-h-[44px] flex flex-col items-center justify-center transition-all ${
            activeTab === 'wallet' ? 'text-sky-400 font-bold scale-105' : 'text-slate-400 hover:text-white'
          }`}
        >
          <QrCode className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight">Wallet</span>
        </button>

        {/* Conditional Tab: 3D Walk (ONLY unlocked when at station!) */}
        {isAtStation && (
          <button
            onClick={() => setActiveTab('walk')}
            className={`min-h-[44px] px-2.5 py-1 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-lg animate-pulse transition-all ${
              activeTab === 'walk' ? 'ring-2 ring-emerald-300' : ''
            }`}
          >
            <Compass className="w-4 h-4" />
            <span className="text-[10px] font-bold">3D Walk</span>
          </button>
        )}
      </nav>
    </div>
  );
};
