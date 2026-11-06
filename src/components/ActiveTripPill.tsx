/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useMetroStore } from '../state/useMetroStore';
import { Train, ArrowRight } from 'lucide-react';

export const ActiveTripPill: React.FC = () => {
  const { activeTrip, stations, setActiveTab, activeTab } = useMetroStore();

  if (!activeTrip || activeTab === 'ride') return null;

  const nextStation = stations.find((s) => s.id === activeTrip.nextStationId);

  return (
    <div
      onClick={() => setActiveTab('ride')}
      className="fixed bottom-20 left-4 right-4 z-40 max-w-sm mx-auto cursor-pointer"
    >
      <div className="bg-gradient-to-r from-sky-600 to-indigo-600 rounded-2xl p-3 shadow-2xl flex items-center justify-between text-white border border-sky-400/40 backdrop-blur-md animate-in slide-in-from-bottom-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Train className="w-4 h-4 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-sky-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>ON-TRAIN · Next: {nextStation?.name || 'Upcoming'}</span>
            </div>
            <p className="text-xs font-semibold text-white">
              {activeTrip.stopsRemaining} stops remaining
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs font-bold bg-white/20 px-2.5 py-1 rounded-xl">
          <span>View</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};
