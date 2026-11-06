/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { useMetroStore } from '../state/useMetroStore';
import { TicketMode, Fare, SavedTicket, TicketSummary } from '../types';
import { getAllSavedTickets, saveTicketToWallet, deleteTicketFromWallet } from '../services/cache/db';
import {
  QrCode,
  Coins,
  CreditCard,
  Calculator,
  Upload,
  Camera,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Trash2,
  Sun,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const TicketingHubScreen: React.FC = () => {
  const {
    activeAdapter,
    stations,
    startTrip,
  } = useMetroStore();

  const [activeMode, setActiveMode] = useState<TicketMode>('qr');
  const [originId, setOriginId] = useState(stations[0]?.id || '');
  const [destId, setDestId] = useState(stations[1]?.id || stations[0]?.id || '');
  const [fareInfo, setFareInfo] = useState<Fare | null>(null);

  // Scanner & AI Summarizer State
  const [isUploading, setIsUploading] = useState(false);
  const [extractedTicket, setExtractedTicket] = useState<TicketSummary | null>(null);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Saved Tickets Wallet
  const [walletTickets, setWalletTickets] = useState<SavedTicket[]>([]);
  const [brightnessBoostId, setBrightnessBoostId] = useState<string | null>(null);

  const guide = activeAdapter.getTicketingGuide();

  // Load saved tickets from IndexedDB
  const refreshWallet = async () => {
    const list = await getAllSavedTickets();
    setWalletTickets(list);
  };

  useEffect(() => {
    refreshWallet();
  }, []);

  // Compute Fare when stations change
  useEffect(() => {
    if (!originId || !destId) return;
    activeAdapter.getFare(originId, destId, activeMode).then(setFareInfo);
  }, [originId, destId, activeMode, activeAdapter]);

  // Handle Ticket Image Upload and QR / Gemini AI Pipeline
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setScannerError(null);
    setExtractedTicket(null);

    try {
      // 1. Read image as data URL
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const dataUrl = await base64Promise;

      // 2. Decode QR on-device using jsQR
      let rawPayload: string | null = null;
      try {
        const img = new Image();
        img.src = dataUrl;
        await new Promise((res) => (img.onload = res));

        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imgData = ctx.getImageData(0, 0, img.width, img.height);
          const code = jsQR(imgData.data, imgData.width, imgData.height);
          if (code) {
            rawPayload = code.data;
          }
        }
      } catch (err) {
        console.warn('On-device QR decode bypassed:', err);
      }

      // 3. Send image + decoded payload to server-side Gemini 3.8 Flash endpoint
      const response = await fetch('/api/tickets/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: dataUrl,
          mimeType: file.type || 'image/jpeg',
          rawPayload,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.ticket) {
        throw new Error(result.error || 'Could not parse ticket image.');
      }

      const summary: TicketSummary = result.ticket;
      setExtractedTicket(summary);

      // Auto-save to IndexedDB wallet
      const saved: SavedTicket = {
        ...summary,
        id: `ticket-${Date.now()}`,
        savedAt: new Date().toISOString(),
        cityId: activeAdapter.cityId,
      };
      await saveTicketToWallet(saved);
      await refreshWallet();
    } catch (err: any) {
      setScannerError(err.message || 'Failed to analyze ticket image. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    await deleteTicketFromWallet(ticketId);
    await refreshWallet();
  };

  const handleUseTicketForTrip = (ticket: TicketSummary) => {
    const orig = stations.find((s) => ticket.origin && s.name.toLowerCase().includes(ticket.origin.toLowerCase())) || stations[0];
    const dest = stations.find((s) => ticket.destination && s.name.toLowerCase().includes(ticket.destination.toLowerCase())) || stations[1];
    if (orig && dest) {
      startTrip(orig.id, dest.id, orig.lines[0]);
    }
  };

  return (
    <div className="w-full h-full bg-slate-950 text-white overflow-y-auto px-4 py-6 pb-28 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white mb-1">
          Ticketing Hub & Smart Wallet
        </h2>
        <p className="text-xs text-slate-400">
          Official ticketing methods, fare calculator, and AI scanner for {activeAdapter.operator}.
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-3 gap-2 p-1 bg-slate-900 border border-slate-800 rounded-2xl">
        <button
          onClick={() => setActiveMode('qr')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeMode === 'qr'
              ? 'bg-sky-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>QR Ticket</span>
        </button>
        <button
          onClick={() => setActiveMode('card')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeMode === 'card'
              ? 'bg-sky-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Smart Card</span>
        </button>
        <button
          onClick={() => setActiveMode('token')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeMode === 'token'
              ? 'bg-sky-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>Token Coin</span>
        </button>
      </div>

      {/* Mode Step-by-Step Gate Walkthrough Guide */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          {activeMode === 'qr' && <QrCode className="w-4 h-4 text-sky-400" />}
          {activeMode === 'card' && <CreditCard className="w-4 h-4 text-purple-400" />}
          {activeMode === 'token' && <Coins className="w-4 h-4 text-amber-400" />}
          <span>Gate Walkthrough: How to Enter & Exit</span>
        </h3>

        {activeMode === 'qr' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-800">
              <span className="font-bold text-sky-400 block mb-1">1. Generate QR</span>
              <p className="text-slate-300">Book on official app or WhatsApp. Keep phone display brightness at 100%.</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-800">
              <span className="font-bold text-sky-400 block mb-1">2. Scan at Gate</span>
              <p className="text-slate-300">Hold screen 5-10 cm flat above the optical scanner with the green laser guide.</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-800">
              <span className="font-bold text-sky-400 block mb-1">3. Scan on Exit</span>
              <p className="text-slate-300">Repeat scan at exit turnstile to complete journey. Valid for 120-180 minutes.</p>
            </div>
          </div>
        )}

        {activeMode === 'card' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-800">
              <span className="font-bold text-purple-400 block mb-1">1. Balance Check</span>
              <p className="text-slate-300">Ensure minimum ₹50 balance on RuPay NCMC or operator smart card.</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-800">
              <span className="font-bold text-purple-400 block mb-1">2. Tap In</span>
              <p className="text-slate-300">Tap card against circular contactless sensor. Wait for green beep.</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-800">
              <span className="font-bold text-purple-400 block mb-1">3. Tap Out (Discount)</span>
              <p className="text-slate-300">Tap again at destination. Enjoy 10-20% automated fare discount.</p>
            </div>
          </div>
        )}

        {activeMode === 'token' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-800">
              <span className="font-bold text-amber-400 block mb-1">1. Purchase Token</span>
              <p className="text-slate-300">Buy single-journey contactless token at counter or TVM kiosk.</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-800">
              <span className="font-bold text-amber-400 block mb-1">2. Tap on Entry</span>
              <p className="text-slate-300">Tap the token on the circular sensor. Keep the token safe!</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-800">
              <span className="font-bold text-amber-400 block mb-1">3. DROP at Exit Slot</span>
              <p className="text-slate-300 font-medium text-amber-300">CRITICAL: Drop the token into the exit slot to release gate!</p>
            </div>
          </div>
        )}
      </div>

      {/* Fare Calculator */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-400" />
            <span>Fare Calculator</span>
          </h3>
          <span className="text-[11px] font-semibold text-slate-400">
            Official Fare Slabs
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">From Station</label>
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
            <label className="block text-xs font-medium text-slate-400 mb-1">To Station</label>
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

        {fareInfo && (
          <div className="grid grid-cols-3 gap-2 bg-slate-800/80 p-3.5 rounded-2xl text-center">
            <div>
              <span className="text-[11px] text-slate-400 block">Token Fare</span>
              <span className="text-base font-bold text-white font-mono">
                ₹{fareInfo.tokenFare}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-emerald-400 font-semibold block">Smart Card / QR</span>
              <span className="text-base font-bold text-emerald-400 font-mono">
                ₹{fareInfo.smartCardFare}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Travel Time</span>
              <span className="text-base font-bold text-sky-400 font-mono">
                ~{fareInfo.durationMinutes} min
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Multimodal AI Ticket Scanner & Upload */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              Scan & Summarize Ticket (Gemini AI)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Powered by gemini-3.8-flash
          </span>
        </div>

        <p className="text-xs text-slate-400">
          Upload a paper ticket photo, WhatsApp QR screenshot, or recharge voucher. The AI extracts origin, destination, fare, and validity.
        </p>

        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex-1 py-3 px-4 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>{isUploading ? 'Analyzing with Gemini...' : 'Upload Ticket Image / Screenshot'}</span>
          </button>
        </div>

        {scannerError && (
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{scannerError}</span>
          </div>
        )}

        {extractedTicket && (
          <div className="p-4 rounded-2xl bg-slate-800/90 border border-emerald-500/40 shadow-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified Ticket Summary</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Confidence: {Math.round(extractedTicket.confidenceScore * 100)}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 block">Operator</span>
                <span className="font-semibold text-white">{extractedTicket.operator || activeAdapter.operator}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Ticket Type</span>
                <span className="font-semibold text-white">{extractedTicket.ticketType || 'QR Ticket'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Origin</span>
                <span className="font-bold text-sky-400">{extractedTicket.origin || 'Detected'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Destination</span>
                <span className="font-bold text-sky-400">{extractedTicket.destination || 'Detected'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Fare Paid</span>
                <span className="font-bold text-white font-mono">₹{extractedTicket.farePaid || '30'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Validity</span>
                <span className="font-semibold text-slate-200">{extractedTicket.validUntil || 'Today'}</span>
              </div>
            </div>

            <button
              onClick={() => handleUseTicketForTrip(extractedTicket)}
              className="w-full mt-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md"
            >
              <span>Use Ticket to Start In-Train Mode</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Offline Saved Ticket Wallet */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">
            Ticket Wallet ({walletTickets.length})
          </h3>
          <span className="text-xs text-slate-400">Cached in IndexedDB</span>
        </div>

        {walletTickets.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
            No saved tickets in your wallet yet. Upload or scan a ticket above to keep it handy for gate turnstiles!
          </div>
        ) : (
          <div className="space-y-3">
            {walletTickets.map((t) => {
              const isBoosted = brightnessBoostId === t.id;
              return (
                <div
                  key={t.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isBoosted
                      ? 'bg-white text-slate-950 border-white shadow-2xl'
                      : 'bg-slate-900 border-slate-800 text-white shadow-lg'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sky-500 block">
                        {t.operator || activeAdapter.displayName}
                      </span>
                      <h4 className="text-sm font-bold">
                        {t.origin || 'Station'} → {t.destination || 'Destination'}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setBrightnessBoostId(isBoosted ? null : t.id)}
                        className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 ${
                          isBoosted
                            ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold'
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                        }`}
                        title="Boost Brightness for Gate Turnstile Scanner"
                      >
                        <Sun className="w-3.5 h-3.5" />
                        <span>{isBoosted ? 'Normal' : 'Brightness Boost'}</span>
                      </button>

                      <button
                        onClick={() => handleDeleteTicket(t.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-900/50 text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs opacity-80 pt-2 border-t border-slate-700/50">
                    <span>Fare: ₹{t.farePaid || '30'}</span>
                    <span>Valid: {t.validUntil || '120 min'}</span>
                    <button
                      onClick={() => handleUseTicketForTrip(t)}
                      className="font-bold underline text-sky-500"
                    >
                      Start Trip
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
