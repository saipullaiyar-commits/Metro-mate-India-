/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useMetroStore } from '../state/useMetroStore';
import { Station, Line, Arrival } from '../types';
import { calculateDistanceKm } from '../adapters/helper';
import {
  Search,
  SlidersHorizontal,
  Heart,
  Star,
  MapPin,
  Clock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Compass,
  Train,
  CheckCircle2,
  Navigation,
  Sparkles,
  ShieldCheck,
  ChevronLeft,
} from 'lucide-react';

export const ExploreScreen: React.FC = () => {
  const {
    activeAdapter,
    stations,
    lines,
    activeStation,
    setActiveStation,
    arrivals,
    locationState,
    setActiveTab,
    simulateAtStation,
    setSimulateAtStation,
  } = useMetroStore();

  const [selectedStation, setSelectedStation] = useState<Station | null>(activeStation || stations[0] || null);
  const [selectedSegmentTab, setSelectedSegmentTab] = useState<'schedule' | 'entrances' | 'ticket_ai' | 'fare'>('schedule');
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>('peak-morning');
  const [isFavorite, setIsFavorite] = useState(false);
  const [filterLineId, setFilterLineId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Physical Ticket bulk text state inside the station detail
  const [bulkTicketText, setBulkTicketText] = useState('');
  const [isParsingText, setIsParsingText] = useState(false);
  const [parsedResult, setParsedResult] = useState<any | null>(null);

  const userLat = locationState.coords?.lat || activeAdapter.center.lat;
  const userLng = locationState.coords?.lng || activeAdapter.center.lng;

  // Filter stations
  const filteredStations = stations.filter((s) => {
    const matchesLine = filterLineId === 'all' || s.lines.includes(filterLineId);
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nativeName.includes(searchQuery);
    return matchesLine && matchesSearch;
  });

  const handleParseBulkTicket = async () => {
    if (!bulkTicketText.trim()) return;
    setIsParsingText(true);
    try {
      const res = await fetch('/api/tickets/parse-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userText: bulkTicketText,
          currentCity: activeAdapter.displayName,
        }),
      });
      const data = await res.json();
      if (data.ticket) {
        setParsedResult(data.ticket);
      }
    } catch (e) {
      console.warn('Failed to parse physical ticket:', e);
    } finally {
      setIsParsingText(false);
    }
  };

  const isAtStation =
    locationState.geofenceState === 'AT_ENTRANCE' ||
    locationState.geofenceState === 'INSIDE' ||
    simulateAtStation;

  // If a station is selected, show the Image 3 Station Detail View!
  if (selectedStation) {
    const lineObj = lines.find((l) => selectedStation.lines.includes(l.id)) || lines[0];
    const distKm = calculateDistanceKm(userLat, userLng, selectedStation.coordinates.lat, selectedStation.coordinates.lng);
    const walkMin = Math.max(1, Math.round(distKm * 12));

    return (
      <div className="w-full h-full bg-slate-50 text-slate-900 overflow-y-auto pb-32">
        {/* Hero Visual Header with Gradient Scrim matching Image 3 */}
        <div className="relative w-full h-72 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 overflow-hidden">
          {/* Subtle architectural transit vector texture */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px]" />
          
          {/* Big authentic line glow ring */}
          <div
            className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full blur-3xl opacity-30"
            style={{ backgroundColor: lineObj?.color || '#0284C7' }}
          />

          {/* Top Bar with Back Arrow and Heart Icon matching Image 3 */}
          <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
            <button
              onClick={() => setSelectedStation(null)}
              className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md text-slate-800 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center shadow-lg transition-colors ${
                  isFavorite ? 'text-red-500 fill-red-500' : 'text-slate-700'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500' : ''}`} />
              </button>
            </div>
          </div>

          {/* Station Title on Hero Scrim */}
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: lineObj?.color || '#38BDF8' }}
              />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {lineObj?.name} · {activeAdapter.displayName}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white leading-tight">
              {selectedStation.name}
            </h1>
            <p className="text-sm font-medium text-slate-300">
              {selectedStation.nativeName}
            </p>
          </div>
        </div>

        {/* Content Container (Rounded Top Card matching Image 3) */}
        <div className="relative -mt-4 bg-white rounded-t-3xl shadow-xl px-5 pt-5 pb-8 space-y-6">
          {/* Grab Bar Indicator */}
          <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto -mt-2 mb-3" />

          {/* Metric Summary Chips (184 Reviews | #1 In Network | 4.9 Rating) */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Reviews</span>
              <span className="text-xs font-bold text-slate-800">184 Verified</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Ranking</span>
              <span className="text-xs font-bold text-slate-800">#1 Central</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-[11px] font-medium text-slate-400 block mb-0.5 flex items-center justify-center gap-1">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span>Rating</span>
              </span>
              <span className="text-xs font-bold text-slate-800">4.9 / 5.0</span>
            </div>
          </div>

          {/* Segmented Control Tabs matching Image 3 */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedSegmentTab('schedule')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedSegmentTab === 'schedule'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              Train Schedule
            </button>
            <button
              onClick={() => setSelectedSegmentTab('entrances')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedSegmentTab === 'entrances'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              Gates & Entrances ({selectedStation.entrances.length})
            </button>
            <button
              onClick={() => setSelectedSegmentTab('ticket_ai')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedSegmentTab === 'ticket_ai'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Physical Ticket AI</span>
            </button>
            <button
              onClick={() => setSelectedSegmentTab('fare')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedSegmentTab === 'fare'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              Fare & Amenities
            </button>
          </div>

          {/* Tab 1: Train Schedule with Accordion Timeline matching Image 3 */}
          {selectedSegmentTab === 'schedule' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Timetable & Headway Frequency</span>
                <span className="font-mono text-emerald-600 font-bold">First: {selectedStation.firstTrain}</span>
              </div>

              {/* Accordion 1: Morning Peak */}
              <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
                <button
                  onClick={() =>
                    setExpandedAccordion(expandedAccordion === 'peak-morning' ? null : 'peak-morning')
                  }
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
                      AM
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Morning Rush (06:00 - 10:30)</h4>
                      <p className="text-[11px] text-slate-500">Peak Frequency · Every 3.5 minutes</p>
                    </div>
                  </div>
                  {expandedAccordion === 'peak-morning' ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {expandedAccordion === 'peak-morning' && (
                  <div className="px-4 pb-4 pt-1 border-t border-slate-100 space-y-2 text-xs text-slate-600 bg-slate-50/50">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-100">
                      <span className="font-semibold text-slate-800">Platform 1 Towards Northbound Terminal</span>
                      <span className="font-mono text-emerald-600 font-bold">Next in 2 min</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-100">
                      <span className="font-semibold text-slate-800">Platform 2 Towards Southbound Terminal</span>
                      <span className="font-mono text-emerald-600 font-bold">Next in 4 min</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 2: Afternoon Normal */}
              <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
                <button
                  onClick={() =>
                    setExpandedAccordion(expandedAccordion === 'afternoon' ? null : 'afternoon')
                  }
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-xs">
                      PM
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Regular Service (10:30 - 17:00)</h4>
                      <p className="text-[11px] text-slate-500">Standard Interval · Every 5 minutes</p>
                    </div>
                  </div>
                  {expandedAccordion === 'afternoon' ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {expandedAccordion === 'afternoon' && (
                  <div className="px-4 pb-4 pt-1 border-t border-slate-100 space-y-2 text-xs text-slate-600 bg-slate-50/50">
                    <p className="p-2 bg-white rounded-xl border border-slate-100">
                      Evenly paced departures with air-conditioned coaches running every 5 to 6 minutes across all platforms.
                    </p>
                  </div>
                )}
              </div>

              {/* Accordion 3: Evening Rush */}
              <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
                <button
                  onClick={() =>
                    setExpandedAccordion(expandedAccordion === 'evening' ? null : 'evening')
                  }
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs">
                      EV
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Evening Commute (17:00 - 21:30)</h4>
                      <p className="text-[11px] text-slate-500">High Frequency · Every 3.5 minutes</p>
                    </div>
                  </div>
                  {expandedAccordion === 'evening' ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Entrances & Gates */}
          {selectedSegmentTab === 'entrances' && (
            <div className="space-y-2.5">
              <p className="text-xs text-slate-500">
                Choose an entrance gate to view street navigation and accessibility details:
              </p>
              {selectedStation.entrances.map((g, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-xs text-sky-700 bg-sky-100 px-2 py-0.5 rounded-md">
                        {g.gateNumber}
                      </span>
                      <h5 className="font-bold text-xs text-slate-900">{g.streetName}</h5>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {g.accessible ? 'Wheelchair & Stroller Accessible Lift' : 'Standard Staircase / Escalator'}
                    </span>
                  </div>

                  <button
                    onClick={() => setActiveTab('map')}
                    className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1 shadow-sm"
                  >
                    <Navigation className="w-3.5 h-3.5 text-sky-600" />
                    <span>Map</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: Physical Ticket AI Input */}
          {selectedSegmentTab === 'ticket_ai' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                <div className="flex items-center gap-2 mb-1 text-amber-900 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Bought a physical token or paper ticket?</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Tell us your ticket or token details in bulk (e.g. counter number, fare, destination, gate told by the guard). Gemini AI will summarize it and guide you step-by-step.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Enter Your Physical Ticket Details:
                </label>
                <textarea
                  value={bulkTicketText}
                  onChange={(e) => setBulkTicketText(e.target.value)}
                  placeholder="e.g. Bought a ₹40 single journey token at counter 2 for Blue Line to Noida Electronic City. Guard said enter Gate 1 and take escalator to Platform 3."
                  rows={3}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                
                {/* Sample quick fill prompts */}
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() =>
                      setBulkTicketText(
                        `Got a token at ${selectedStation.name} counter for 30 rupees going to terminal via Platform 1, Gate 1 entrance.`
                      )
                    }
                    className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium"
                  >
                    + Quick Sample Token
                  </button>
                </div>

                <button
                  onClick={handleParseBulkTicket}
                  disabled={isParsingText || !bulkTicketText.trim()}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-2xl font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{isParsingText ? 'AI Parsing Details...' : 'Summarize & Guide My Journey'}</span>
                </button>
              </div>

              {parsedResult && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-slate-900 space-y-3 shadow-md animate-in fade-in">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>AI Journey Summary Ready</span>
                  </div>

                  <p className="text-xs font-semibold text-emerald-950">
                    {parsedResult.summary}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-white/80 p-3 rounded-xl border border-emerald-100">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Departure Platform</span>
                      <span className="font-bold text-slate-900">{parsedResult.platformNumber || 'Platform 1'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Entry Gate</span>
                      <span className="font-bold text-slate-900">{parsedResult.entranceGate || 'Gate 1'}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Turn-by-turn Navigation Steps:
                    </span>
                    <ol className="list-decimal pl-4 text-xs text-slate-700 space-y-1">
                      {parsedResult.navigationSteps?.map((step: string, idx: number) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Fare & Amenities */}
          {selectedSegmentTab === 'fare' && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <h5 className="font-bold text-xs text-slate-900">Facilities Available</h5>
                <div className="flex flex-wrap gap-1.5">
                  {selectedStation.facilities.map((fac, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-medium"
                    >
                      {fac}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Full-Width Bottom CTA matching Image 3 (e.g. "Book for 2 person · $840") */}
        <div className="fixed bottom-20 left-4 right-4 z-40 max-w-lg mx-auto">
          {isAtStation ? (
            <button
              onClick={() => {
                setActiveStation(selectedStation);
                setActiveTab('walk');
              }}
              className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/20 active:scale-98 transition-transform"
            >
              <Compass className="w-5 h-5 animate-spin" />
              <span>You Are At Station · Enter 3D Concourse Walk</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setActiveStation(selectedStation);
                setActiveTab('map');
              }}
              className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-sm flex items-center justify-between px-6 shadow-xl shadow-slate-950/20 active:scale-98 transition-transform"
            >
              <span>Navigate to {selectedStation.entrances[0]?.gateNumber || 'Gate 1'}</span>
              <span className="font-mono text-xs opacity-75">~{walkMin} min walk ({distKm} km)</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // Otherwise, render the Main Discovery Feed matching Image 3 (Left Screen)
  return (
    <div className="w-full h-full bg-slate-50 text-slate-900 overflow-y-auto px-4 pt-4 pb-28 space-y-5">
      {/* Top Search Pill Header matching Image 3 */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Where do you want to go?"
            className="w-full h-12 pl-10 pr-4 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <button
          onClick={() => setSimulateAtStation(!simulateAtStation)}
          className={`h-12 px-3.5 rounded-full border text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors ${
            simulateAtStation
              ? 'bg-emerald-600 border-emerald-500 text-white'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
          title="Toggle Station Proximity Simulation"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">{simulateAtStation ? 'At Station' : 'Away'}</span>
        </button>
      </div>

      {/* Horizontal Category Pills matching Image 3: "Europe", "Asia", "South America" -> "All Lines", "Central", etc. */}
      <div>
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
          Select Corridor
        </h3>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setFilterLineId('all')}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              filterLineId === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            All Corridors ({stations.length})
          </button>
          {lines.map((l) => (
            <button
              key={l.id}
              onClick={() => setFilterLineId(l.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                filterLineId === l.id
                  ? 'text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
              style={{
                backgroundColor: filterLineId === l.id ? l.color : undefined,
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

      {/* Section: Top Picks (Horizontal Cards matching Image 3) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900">Top Station Hubs</h3>
          <span className="text-xs text-slate-400 font-semibold">{stations.length} hubs</span>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {filteredStations.slice(0, 4).map((stn) => {
            const lineObj = lines.find((l) => stn.lines.includes(l.id)) || lines[0];
            const distKm = calculateDistanceKm(userLat, userLng, stn.coordinates.lat, stn.coordinates.lng);
            return (
              <div
                key={stn.id}
                onClick={() => setSelectedStation(stn)}
                className="relative w-48 h-60 shrink-0 rounded-3xl overflow-hidden shadow-md cursor-pointer hover:shadow-xl transition-all group bg-gradient-to-tr from-slate-900 to-indigo-950"
              >
                {/* Background gradient card */}
                <div
                  className="absolute inset-0 opacity-40 group-hover:scale-105 transition-transform duration-500"
                  style={{
                    background: `linear-gradient(135deg, ${lineObj?.color}60, #0f172a)`,
                  }}
                />

                {/* Favorite Heart Icon matching Image 3 */}
                <div className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white">
                  <Heart className="w-4 h-4" />
                </div>

                {/* Rating Chip */}
                <div className="absolute top-3 left-3 z-10 px-2 py-1 rounded-full bg-black/40 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>4.9</span>
                </div>

                {/* Bottom Title on Scrim */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h4 className="text-sm font-bold leading-tight drop-shadow-sm mb-0.5">
                    {stn.name}
                  </h4>
                  <p className="text-[11px] text-slate-300 font-medium truncate">
                    {stn.nativeName} · {distKm} km
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section: Nearby Stations List matching Image 3 lower list */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900">All Stations & Stops</h3>
        <div className="space-y-2.5">
          {filteredStations.map((stn) => {
            const lineObj = lines.find((l) => stn.lines.includes(l.id)) || lines[0];
            const distKm = calculateDistanceKm(userLat, userLng, stn.coordinates.lat, stn.coordinates.lng);
            const walkMin = Math.max(1, Math.round(distKm * 12));

            return (
              <div
                key={stn.id}
                onClick={() => setSelectedStation(stn)}
                className="p-4 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm font-bold text-xs"
                    style={{ backgroundColor: lineObj?.color || '#0284C7' }}
                  >
                    <Train className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 leading-tight">
                      {stn.name}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {stn.nativeName} · {distKm} km (~{walkMin} min walk)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-slate-400 group-hover:text-slate-900">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
