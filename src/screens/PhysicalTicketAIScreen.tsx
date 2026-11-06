/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useMetroStore } from '../state/useMetroStore';
import { ParsedPhysicalTicket, SavedTicket } from '../types';
import { saveTicketToWallet } from '../services/cache/db';
import {
  Sparkles,
  Train,
  CheckCircle2,
  Navigation,
  ArrowRight,
  ShieldCheck,
  MessageSquare,
  Compass,
} from 'lucide-react';

export const PhysicalTicketAIScreen: React.FC = () => {
  const {
    activeAdapter,
    stations,
    lines,
    setActiveStation,
    setActiveTab,
    setParsedPhysicalTicket,
  } = useMetroStore();

  const [bulkInput, setBulkInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [parsedTicket, setParsedTicket] = useState<ParsedPhysicalTicket | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const samplePrompts = [
    `Bought a ₹30 token at Rajiv Chowk counter for Blue Line platform 3 towards Noida Electronic City via Gate 2`,
    `Got a ₹40 paper ticket at Majestic Bangalore counter going to Whitefield. Guard told me to take escalator to Platform 1`,
    `Purchased Mumbai Metro Line 1 token for ₹20 from Ghatkopar to Andheri via Gate 1`,
  ];

  const handleAnalyzeBulk = async (textToParse?: string) => {
    const text = textToParse || bulkInput;
    if (!text.trim()) return;

    setIsAnalyzing(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/tickets/parse-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userText: text,
          currentCity: activeAdapter.displayName,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ticket) {
        throw new Error(data.error || 'Failed to parse ticket notes');
      }

      const ticket: ParsedPhysicalTicket = data.ticket;
      setParsedTicket(ticket);
      setParsedPhysicalTicket(ticket);

      // Auto-save to IndexedDB wallet
      const saved: SavedTicket = {
        id: `phys-${Date.now()}`,
        operator: activeAdapter.operator,
        ticketType: ticket.ticketType || 'Physical Token / Paper Ticket',
        origin: ticket.origin,
        destination: ticket.destination,
        passengerCount: 1,
        farePaid: ticket.farePaid || null,
        purchaseTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        validUntil: 'Today (180 min)',
        ticketId: `TOKEN-${Math.floor(100000 + Math.random() * 900000)}`,
        confidenceScore: 0.95,
        statusHints: `Platform: ${ticket.platformNumber || '1'} · Gate: ${ticket.entranceGate || '1'}`,
        savedAt: new Date().toISOString(),
        cityId: activeAdapter.cityId,
      };
      await saveTicketToWallet(saved);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error communicating with AI parser.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStartNavigation = () => {
    if (!parsedTicket) return;
    const matchOrigin = stations.find(
      (s) =>
        s.name.toLowerCase().includes(parsedTicket.origin.toLowerCase()) ||
        parsedTicket.origin.toLowerCase().includes(s.name.toLowerCase())
    ) || stations[0];

    setActiveStation(matchOrigin);
    setActiveTab('map');
  };

  return (
    <div className="w-full h-full bg-slate-50 text-slate-900 overflow-y-auto px-4 py-5 pb-28 max-w-xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Physical Ticket AI Assistant
          </h2>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Tell us about the counter token, paper slip, or instructions given to you at {activeAdapter.displayName}. Gemini AI will extract platforms, gates, and generate step-by-step navigation.
        </p>
      </div>

      {/* Input Form Box */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-md space-y-4">
        <label className="block text-xs font-bold text-slate-700">
          Enter Your Ticket Details in Bulk:
        </label>
        <textarea
          value={bulkInput}
          onChange={(e) => setBulkInput(e.target.value)}
          placeholder="e.g. Bought a single journey token at counter 3 for ₹30 to go to Indiranagar via Purple Line. Guard told me to take Gate 2 and wait at Platform 1."
          rows={4}
          className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
        />

        {/* Sample chips */}
        <div>
          <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
            Quick samples to try:
          </span>
          <div className="space-y-1.5">
            {samplePrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => {
                  setBulkInput(p);
                  handleAnalyzeBulk(p);
                }}
                className="w-full text-left p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 text-[11px] text-slate-600 transition-colors"
              >
                "{p}"
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => handleAnalyzeBulk()}
          disabled={isAnalyzing || !bulkInput.trim()}
          className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-2xl font-bold text-xs shadow-lg flex items-center justify-center gap-2 active:scale-98 transition-transform"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{isAnalyzing ? 'Analyzing with Gemini AI...' : 'Parse & Navigate'}</span>
        </button>

        {errorMsg && (
          <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
            {errorMsg}
          </p>
        )}
      </div>

      {/* Result Card matching Image 3 modern white card */}
      {parsedTicket && (
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xl space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="text-xs font-bold text-slate-900">
                Ticket Details Extracted & Saved
              </span>
            </div>
            <span className="text-[11px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">
              {parsedTicket.ticketType || 'Token'}
            </span>
          </div>

          <p className="text-xs text-slate-700 font-medium leading-relaxed">
            {parsedTicket.summary}
          </p>

          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-400 block mb-0.5">Origin Station</span>
              <span className="font-bold text-slate-900">{parsedTicket.origin}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-400 block mb-0.5">Destination</span>
              <span className="font-bold text-slate-900">{parsedTicket.destination}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-400 block mb-0.5">Boarding Platform</span>
              <span className="font-bold text-emerald-600">{parsedTicket.platformNumber || 'Platform 1'}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-400 block mb-0.5">Entrance Gate</span>
              <span className="font-bold text-sky-600">{parsedTicket.entranceGate || 'Gate 1'}</span>
            </div>
          </div>

          {/* Navigation Steps */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Your Navigation Steps:
            </h4>
            <div className="space-y-1.5">
              {parsedTicket.navigationSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 text-xs text-slate-700 p-2.5 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleStartNavigation}
            className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-xl shadow-slate-900/10 active:scale-98 transition-transform"
          >
            <Navigation className="w-4 h-4 text-sky-400" />
            <span>Open Map Walking Directions to {parsedTicket.origin}</span>
          </button>
        </div>
      )}
    </div>
  );
};
