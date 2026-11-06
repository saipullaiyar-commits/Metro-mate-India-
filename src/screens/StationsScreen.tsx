/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useMetroStore } from '../state/useMetroStore';
import { Station } from '../types';
import { calculateDistanceKm } from '../adapters/helper';
import {
  Train,
  Search,
  ArrowRight,
  Compass,
  AlertTriangle,
  Clock,
  Layers,
  MapPin,
  Sparkles,
} from 'lucide-react';

export const StationsScreen: React.FC = () => {
  const {
    activeAdapter,
    stations,
    lines,
    activeStation,
    setActiveStation,
    setActiveTab,
    startTrip,
  } = useMetroStore();

  const [search, setSearch] = useState('');
  const [selectedLineFilter, setSelectedLineFilter] = useState<string>('all');
  const [originId, setOriginId] = useState(stations[0]?.id || '');
  const [destId, setDestId] = useState(stations[1]?.id || stations[0]?.id || '');
  const [showPlanner, setShowPlanner] = useState(false);

  const filteredStations = stations.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.nativeName.includes(search);
    const matchesLine =
      selectedLineFilter === 'all' || s.lines.includes(selectedLineFilter);
    return matchesSearch && matchesLine;
  });

  const originStation = stations.find((s) => s.id === originId) || stations[0];
  const destStation = stations.find((s) => s.id === destId) || stations[1];

  // Route calculation between origin & destination
  const calculateRoute = () => {
    if (!originStation || !destStation) return null;
    const dist = calculateDistanceKm(
      originStation.coordinates.lat,
      originStation.coordinates.lng,
      destStation.coordinates.lat,
      destStation.coordinates.lng
    );

    const commonLine = originStation.lines.find((l) => destStation.lines.includes(l));
    const interchange = !commonLine;
    const duration = Math.max(5, Math.round(dist * 2.2));
    const fare = Math.min(60, Math.max(10, Math.round(dist * 2.4)));

    return {
      distanceKm: dist,
      durationMinutes: duration,
      interchange,
      fare,
      lineName: lines.find((l) => l.id === (commonLine || originStation.lines[0]))?.name || 'Main Line',
    };
  };

  const routePlan = calculateRoute();

  return (
    <div className="w-full h-full bg-slate-950 text-white overflow-y-auto px-4 py-6 pb-28 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white mb-1">
            Stations & Trip Planner
          </h2>
          <p className="text-xs text-slate-400">
            {stations.length} stations across {lines.length} lines on {activeAdapter.operator}
          </p>
        </div>
        <button
          onClick={() => setShowPlanner(!showPlanner)}
          className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
            showPlanner
              ? 'bg-sky-600 border-sky-500 text-white'
              : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
          }`}
        >
          {showPlanner ? 'Hide Planner' : 'Plan Trip'}
        </button>
      </div>

      {/* Trip Planner Card */}
      {showPlanner && (
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Train className="w-4 h-4 text-sky-400" />
              <span>Route & Interchange Planner</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Origin Station</label>
              <select
                value={originId}
                onChange={(e) => setOriginId(e.target.value)}
                className="w-full h-10 px-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {stations.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.nativeName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Destination Station</label>
              <select
                value={destId}
                onChange={(e) => setDestId(e.target.value)}
                className="w-full h-10 px-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {stations.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.nativeName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {routePlan && (
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">
                  Via {routePlan.lineName}
                </span>
                <span className="font-mono text-emerald-400 font-bold">
                  ₹{routePlan.fare} · ~{routePlan.durationMinutes} min ({routePlan.distanceKm} km)
                </span>
              </div>

              {routePlan.interchange ? (
                <div className="p-2.5 rounded-xl bg-purple-950/50 border border-purple-800 text-purple-300 text-xs">
                  <span className="font-bold">Interchange Required: </span>
                  Change lines at central junction station. Follow overhead signs to next platform.
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-xs">
                  <span className="font-bold">Direct Train: </span>
                  No interchange required. Board train on Platform 1.
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => {
                    setActiveStation(originStation);
                    setActiveTab('walk');
                  }}
                  className="py-2.5 px-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>3D Walk Origin</span>
                </button>
                <button
                  onClick={() => {
                    startTrip(originStation.id, destStation.id, originStation.lines[0]);
                  }}
                  className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Train className="w-3.5 h-3.5" />
                  <span>Start In-Train Mode</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search & Line Filters */}
      <div className="space-y-3">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search station in English or local script..."
            className="w-full h-11 pl-10 pr-4 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-md"
          />
        </div>

        {/* Line Badges Horizontal Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedLineFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              selectedLineFilter === 'all'
                ? 'bg-white text-slate-950 shadow-md'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All Lines ({stations.length})
          </button>
          {lines.map((l) => (
            <button
              key={l.id}
              onClick={() => setSelectedLineFilter(l.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                selectedLineFilter === l.id
                  ? 'text-white shadow-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
              style={{
                backgroundColor: selectedLineFilter === l.id ? l.color : undefined,
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: l.color }}
              />
              <span>{l.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Station List */}
      <div className="space-y-2.5">
        {filteredStations.map((stn) => {
          const lineObj = lines.find((l) => stn.lines.includes(l.id)) || lines[0];
          const isSelected = activeStation?.id === stn.id;

          return (
            <div
              key={stn.id}
              onClick={() => setActiveStation(stn)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 border-sky-500 shadow-lg'
                  : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900/90'
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
                    {stn.nativeName} · {stn.entrances.length} Gates · First Train: {stn.firstTrain}
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {stn.facilities.slice(0, 3).map((f, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveStation(stn);
                      setActiveTab('walk');
                    }}
                    className="p-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center"
                    title="Walk in 3D"
                  >
                    <Compass className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
