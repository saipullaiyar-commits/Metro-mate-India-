/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MetroAdapter, Station, Line, Arrival, Fare, TicketingGuide, StationLayout } from '../types';
import { calculateDistanceKm, createDefaultStationLayout, generateHeadwayArrivals } from './helper';

export class GenericGoogleTransitAdapter implements MetroAdapter {
  cityId = 'generic';
  displayName = 'India Transit (Generic)';
  nativeName = 'भारतीय मेट्रो रेल प्रणाली';
  operator = 'Indian Urban Rail Transit Systems';
  languageCode = 'en';
  center = { lat: 20.5937, lng: 78.9629 };
  bounds = { north: 37.0, south: 8.0, east: 97.0, west: 68.0 };
  dataQuality = {
    realtime: false,
    staticSchedule: true,
    indoorMaps: false,
    fareApi: false,
  };

  private dynamicStations: Station[] = [
    {
      id: 'gen-central-station',
      name: 'Transit Terminal Center',
      nativeName: 'ट्रांजिट टर्मिनल सेंटर',
      cityId: 'generic',
      lines: ['gen-transit-line'],
      coordinates: { lat: 28.6139, lng: 77.209 },
      isInterchange: true,
      facilities: ['Lifts', 'Toilets', 'Customer Care'],
      entrances: [{ gateNumber: 'Gate 1', streetName: 'Main Entrance', accessible: true }],
      firstTrain: '06:00 AM',
      lastTrain: '11:00 PM',
      platformCount: 2,
      layoutType: 'elevated',
      crowdLevel: 'MODERATE',
    },
  ];

  private dynamicLines: Line[] = [
    {
      id: 'gen-transit-line',
      name: 'Transit Line',
      nativeName: 'ट्रांजिट लाइन',
      cityId: 'generic',
      color: '#0284C7',
      textColor: '#FFFFFF',
      isUnderground: false,
      coachCount: 4,
      stations: ['gen-central-station'],
      operatorLivery: {
        primaryColor: '#0284C7',
        stripeColor: '#0369A1',
        bodyMaterial: 'stainless-steel',
        accentColor: '#BAE6FD',
      },
    },
  ];

  async getStations(): Promise<Station[]> {
    return this.dynamicStations;
  }

  async getLines(): Promise<Line[]> {
    return this.dynamicLines;
  }

  async getArrivals(stationId: string): Promise<Arrival[]> {
    return generateHeadwayArrivals(stationId, 'gen-transit-line', [
      { dest: 'Terminal A', platform: 'Platform 1' },
      { dest: 'Terminal B', platform: 'Platform 2' },
    ], 8);
  }

  async getFare(fromId: string, toId: string): Promise<Fare> {
    const s1 = this.dynamicStations.find((s) => s.id === fromId) || this.dynamicStations[0];
    const s2 = this.dynamicStations.find((s) => s.id === toId) || this.dynamicStations[0];
    const dist = calculateDistanceKm(s1.coordinates.lat, s1.coordinates.lng, s2.coordinates.lat, s2.coordinates.lng) || 5;
    return {
      tokenFare: 20,
      smartCardFare: 18,
      durationMinutes: 12,
      distanceKm: dist,
      interchanges: 0,
    };
  }

  async getStationLayout(stationId: string): Promise<StationLayout | null> {
    const s = this.dynamicStations.find((x) => x.id === stationId);
    return s ? createDefaultStationLayout(s) : null;
  }

  getTicketingGuide(): TicketingGuide {
    return {
      methods: [
        {
          id: 'ncmc',
          name: 'NCMC RuPay Smart Card',
          description: 'Universal One Nation One Card interoperable across all Indian metros.',
          icon: 'CreditCard',
          supportedApps: ['Any Bank RuPay NCMC'],
        },
      ],
      modes: ['card', 'token'],
      tips: ['Check local station signage for operator specific ticketing.'],
      rules: ['Standard transit safety rules apply.'],
      mistakes: ['Ensure sufficient balance on NCMC card.'],
    };
  }
}
