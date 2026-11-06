/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { useMetroStore } from '../state/useMetroStore';
import { Station, Arrival } from '../types';
import { calculateDistanceKm } from '../adapters/helper';
import {
  Search,
  Navigation,
  Train,
  Clock,
  Accessibility,
  ArrowRight,
  Compass,
  MapPin,
  Sparkles,
  Layers,
} from 'lucide-react';

export const MapScreen: React.FC = () => {
  const {
    activeAdapter,
    stations,
    lines,
    activeStation,
    setActiveStation,
    arrivals,
    locationState,
    googleMapsApiKey,
    setActiveTab,
    startTrip,
  } = useMetroStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStationDetail, setSelectedStationDetail] = useState<Station | null>(null);
  const [bottomSheetHeight, setBottomSheetHeight] = useState<'collapsed' | 'half' | 'expanded'>('half');

  // Filter stations based on search
  const filteredStations = stations.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nativeName.includes(searchQuery)
  );

  // Compute nearest stations sorted by distance from user location or city center
  const userLat = locationState.coords?.lat || activeAdapter.center.lat;
  const userLng = locationState.coords?.lng || activeAdapter.center.lng;

  const sortedStations = [...stations].sort((a, b) => {
    const da = calculateDistanceKm(userLat, userLng, a.coordinates.lat, a.coordinates.lng);
    const db = calculateDistanceKm(userLat, userLng, b.coordinates.lat, b.coordinates.lng);
    return da - db;
  });

  const mapCenter = activeStation ? activeStation.coordinates : activeAdapter.center;

  const handleSelectStation = (station: Station) => {
    setActiveStation(station);
    setSelectedStationDetail(station);
  };

  const handleStartWalk3D = (station: Station) => {
    setActiveStation(station);
    setActiveTab('walk');
  };

  const handleBoardTrain = (station: Station) => {
    if (stations.length >= 2) {
      const dest = stations.find((s) => s.id !== station.id) || stations[1];
      startTrip(station.id, dest.id, station.lines[0]);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 overflow-hidden">
      {/* Top Search Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 max-w-lg mx-auto">
        <div className="relative flex items-center shadow-xl">
          <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeAdapter.displayName} stations...`}
            className="w-full h-11 pl-10 pr-4 bg-slate-900/90 border border-slate-700/80 rounded-2xl text-sm text-white placeholder-slate-400 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-lg"
          />
        </div>
      </div>

      {/* Main Map View Container */}
      <div className="flex-1 w-full h-full relative">
        {googleMapsApiKey ? (
          <APIProvider apiKey={googleMapsApiKey}>
            <Map
              defaultCenter={mapCenter}
              center={mapCenter}
              defaultZoom={13}
              zoom={13}
              mapId="DEMO_MAP_ID"
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              className="w-full h-full"
              gestureHandling="greedy"
              disableDefaultUI={true}
            >
              {/* Station Markers */}
              {stations.map((stn) => {
                const lineObj = lines.find((l) => stn.lines.includes(l.id)) || lines[0];
                const isSelected = activeStation?.id === stn.id;
                return (
                  <AdvancedMarker
                    key={stn.id}
                    position={stn.coordinates}
                    onClick={() => handleSelectStation(stn)}
                  >
                    <div
                      className={`cursor-pointer transition-transform transform ${
                        isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                      }`}
                    >
                      <Pin
                        background={lineObj?.color || '#0284C7'}
                        borderColor="#FFFFFF"
                        glyphColor="#FFFFFF"
                        scale={isSelected ? 1.2 : 0.9}
                      />
                    </div>
                  </AdvancedMarker>
                );
              })}

              {/* User Location Blue Dot */}
              {locationState.coords && (
                <AdvancedMarker position={locationState.coords}>
                  <div className="relative flex items-center justify-center">
                    <div className="w-5 h-5 rounded-full bg-sky-500 border-2 border-white shadow-lg animate-pulse" />
                    <div className="absolute -inset-2 rounded-full bg-sky-500/20" />
                  </div>
                </AdvancedMarker>
              )}
            </Map>
          </APIProvider>
        ) : (
          /* High-Fidelity SVG / Canvas Styled Transit Grid fallback when key is initializing */
          <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
            {/* Background metro network schematic grid */}
            <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />

            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
              {/* Transit line schematic curves */}
              <path
                d="M 50,300 C 200,300 300,150 500,150 S 700,450 900,450"
                fill="none"
                stroke={lines[0]?.color || '#EAB308'}
                strokeWidth="6"
              />
              <path
                d="M 150,100 C 350,100 450,400 750,400 S 850,200 1050,200"
                fill="none"
                stroke={lines[1]?.color || '#2563EB'}
                strokeWidth="6"
              />
            </svg>

            <div className="z-10 max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 backdrop-blur-md shadow-2xl">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center mx-auto mb-3">
                <Train className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">
                {activeAdapter.displayName} Network Map
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Interactive real-time metro tracking, lines, and station guides for {activeAdapter.operator}.
              </p>
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                {lines.map((l) => (
                  <span
                    key={l.id}
                    className="px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: `${l.color}25`, color: l.color }}
                  >
                    {l.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Draggable Nearest Stations Bottom Sheet */}
      <div
        className={`absolute bottom-16 left-0 right-0 z-30 bg-slate-900/95 border-t border-slate-800 rounded-t-3xl shadow-2xl backdrop-blur-xl transition-all duration-300 ${
          bottomSheetHeight === 'collapsed'
            ? 'h-14'
            : bottomSheetHeight === 'half'
            ? 'h-[44%]'
            : 'h-[75%]'
        }`}
      >
        {/* Grab Handle Header */}
        <div
          onClick={() =>
            setBottomSheetHeight(
              bottomSheetHeight === 'collapsed'
                ? 'half'
                : bottomSheetHeight === 'half'
                ? 'expanded'
                : 'collapsed'
            )
          }
          className="w-full py-2.5 cursor-pointer flex flex-col items-center justify-center select-none"
        >
          <div className="w-10 h-1.5 bg-slate-700 rounded-full mb-1" />
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {bottomSheetHeight === 'collapsed' ? 'Swipe Up for Nearest Stations' : 'Nearest Metro Stations'}
          </span>
        </div>

        {/* Stations Scrollable List */}
        <div className="overflow-y-auto px-4 pb-6 space-y-2.5 h-[calc(100%-42px)]">
          {sortedStations.map((stn) => {
            const distKm = calculateDistanceKm(userLat, userLng, stn.coordinates.lat, stn.coordinates.lng);
            const walkMin = Math.max(1, Math.round(distKm * 12));
            const isSelected = activeStation?.id === stn.id;
            const lineObj = lines.find((l) => stn.lines.includes(l.id)) || lines[0];

            return (
              <div
                key={stn.id}
                onClick={() => handleSelectStation(stn)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800/90 border-sky-500 shadow-md'
                    : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: lineObj?.color || '#38BDF8' }}
                      />
                      <h4 className="text-sm font-bold text-white leading-tight">
                        {stn.name}
                      </h4>
                      {stn.isInterchange && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                          Interchange
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 mb-2">
                      {stn.nativeName} · {distKm} km ({walkMin} min walk)
                    </p>

                    {/* Next Train Arrivals Pill */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-md">
                        LIVE · Next in 3 min
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        towards {lines[0]?.name || 'Terminal'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartWalk3D(stn);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-xl flex items-center gap-1 shadow-md transition-all active:scale-95"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>3D Walk</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBoardTrain(stn);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl flex items-center gap-1 transition-all"
                    >
                      <Train className="w-3.5 h-3.5" />
                      <span>Board</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Station Detail Modal */}
      {selectedStationDetail && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center p-0 md:p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl md:rounded-3xl p-5 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {selectedStationDetail.name}
                </h3>
                <p className="text-sm text-slate-400">
                  {selectedStationDetail.nativeName} · {activeAdapter.operator}
                </p>
              </div>
              <button
                onClick={() => setSelectedStationDetail(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Operating Times */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-800/60 p-3 rounded-2xl mb-4">
              <div>
                <span className="text-slate-400 block">First Train</span>
                <span className="font-bold text-emerald-400 text-sm">
                  {selectedStationDetail.firstTrain}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Last Train</span>
                <span className="font-bold text-amber-400 text-sm">
                  {selectedStationDetail.lastTrain}
                </span>
              </div>
            </div>

            {/* Gates & Entrances */}
            <div className="mb-4">
              <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Gates & Street Entrances
              </h5>
              <div className="space-y-1.5">
                {selectedStationDetail.entrances.map((g, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-800/40 border border-slate-800"
                  >
                    <div>
                      <span className="font-bold text-sky-400 mr-2">{g.gateNumber}</span>
                      <span className="text-slate-200">{g.streetName}</span>
                    </div>
                    {g.accessible && (
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded">
                        Step-Free Lift
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Station Facilities */}
            <div className="mb-5">
              <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Station Facilities
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {selectedStationDetail.facilities.map((f, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setSelectedStationDetail(null);
                  handleStartWalk3D(selectedStationDetail);
                }}
                className="py-3 px-4 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg"
              >
                <Compass className="w-4 h-4" />
                <span>Navigate in 3D</span>
              </button>
              <button
                onClick={() => {
                  setSelectedStationDetail(null);
                  handleBoardTrain(selectedStationDetail);
                }}
                className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2"
              >
                <Train className="w-4 h-4" />
                <span>Board Train</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
