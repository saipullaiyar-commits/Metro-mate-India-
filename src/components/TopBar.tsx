/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useMetroStore } from '../state/useMetroStore';
import { getAllCities } from '../adapters';
import {
  Train,
  MapPin,
  Globe,
  ChevronDown,
  Navigation,
  SlidersHorizontal,
} from 'lucide-react';

export const TopBar: React.FC = () => {
  const {
    activeCityId,
    activeAdapter,
    setCity,
    language,
    setLanguage,
    locationState,
    initializeLocation,
    simulateAtStation,
    setSimulateAtStation,
  } = useMetroStore();

  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const cities = getAllCities();

  const isAtStation =
    locationState.geofenceState === 'AT_ENTRANCE' ||
    locationState.geofenceState === 'INSIDE' ||
    simulateAtStation;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 border-b border-slate-100 backdrop-blur-md px-4 py-3 flex items-center justify-between gap-3 shadow-xs">
      {/* Brand Wordmark matching Image 3 clean typography */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-8 h-8 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-sm">
          <Train className="w-4 h-4" />
        </div>
        <div>
          <span className="text-base font-extrabold tracking-tight text-slate-900">
            MetroMate
          </span>
        </div>
      </div>

      {/* Center: City Selector Capsule matching Image 3 Pill Buttons */}
      <div className="relative">
        <button
          onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
          className="h-9 px-3.5 bg-slate-100 hover:bg-slate-200/80 rounded-full text-xs font-bold text-slate-800 flex items-center gap-1.5 transition-colors shadow-2xs"
        >
          <MapPin className="w-3.5 h-3.5 text-sky-600" />
          <span className="truncate max-w-[120px] sm:max-w-[180px]">
            {activeAdapter.displayName}
          </span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>

        {isCityDropdownOpen && (
          <div className="absolute top-11 left-1/2 -translate-x-1/2 w-64 bg-white border border-slate-200 rounded-3xl shadow-2xl p-2.5 z-50 animate-in fade-in max-h-80 overflow-y-auto">
            <button
              onClick={() => {
                initializeLocation();
                setIsCityDropdownOpen(false);
              }}
              className="w-full text-left p-2.5 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-bold flex items-center gap-2 mb-2 transition-colors"
            >
              <Navigation className="w-3.5 h-3.5 text-sky-600" />
              <span>Auto-Detect My City (GPS)</span>
            </button>

            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
              Select City ({cities.length})
            </div>

            <div className="space-y-1">
              {cities.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setCity(c.id);
                    setIsCityDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                    activeCityId === c.id
                      ? 'bg-slate-900 text-white font-bold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{c.name}</span>
                  <span className="text-[10px] opacity-75">{c.nativeName}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Actions: Proximity status badge & Language */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* At-Station Geofence Status Badge */}
        <button
          onClick={() => setSimulateAtStation(!simulateAtStation)}
          className={`h-8 px-2.5 rounded-full text-[11px] font-bold flex items-center gap-1 transition-colors ${
            isAtStation
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
          title="Click to toggle Station Proximity Geofence for testing"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isAtStation ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
            }`}
          />
          <span className="hidden sm:inline">
            {isAtStation ? 'At Station' : 'Away (GPS)'}
          </span>
        </button>

        <button
          onClick={() => {
            const next = language === 'en' ? 'hi' : language === 'hi' ? 'native' : 'en';
            setLanguage(next);
          }}
          className="h-8 px-2.5 bg-slate-100 hover:bg-slate-200 rounded-full text-[11px] font-bold text-slate-700 flex items-center gap-1 transition-colors"
        >
          <Globe className="w-3 h-3 text-slate-500" />
          <span className="uppercase">{language}</span>
        </button>
      </div>
    </header>
  );
};
