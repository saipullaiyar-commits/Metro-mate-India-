/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LatLng {
  lat: number;
  lng: number;
}

export interface LatLngBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export type TicketMode = 'qr' | 'token' | 'card';

export interface Entrance {
  gateNumber: string;
  streetName: string;
  accessible: boolean;
  coordinates?: LatLng;
}

export interface Station {
  id: string;
  name: string;
  nativeName: string;
  cityId: string;
  lines: string[];
  coordinates: LatLng;
  isInterchange: boolean;
  facilities: string[];
  entrances: Entrance[];
  firstTrain: string;
  lastTrain: string;
  platformCount: number;
  layoutType?: 'underground' | 'elevated' | 'at-grade';
  crowdLevel?: 'LOW' | 'MODERATE' | 'HIGH';
}

export interface TrainLivery {
  primaryColor: string;
  stripeColor: string;
  bodyMaterial: 'stainless-steel' | 'white-aluminum' | 'metallic-silver';
  accentColor: string;
}

export interface Line {
  id: string;
  name: string;
  nativeName: string;
  cityId: string;
  color: string;
  textColor: string;
  isUnderground: boolean;
  stations: string[]; // station IDs in order
  coachCount: number;
  operatorLivery: TrainLivery;
}

export interface Arrival {
  id: string;
  stationId: string;
  lineId: string;
  destination: string;
  platform: string;
  etaSeconds: number;
  scheduledTime: string;
  status: 'ARRIVING' | 'APPROACHING' | 'AT_PLATFORM' | 'SCHEDULED' | 'DELAYED' | 'DEPARTED';
  crowdLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'UNKNOWN';
  provenance: 'LIVE' | 'SCHEDULED' | 'ESTIMATED' | 'OFFLINE-CACHED';
}

export interface Fare {
  tokenFare: number;
  smartCardFare: number;
  offPeakFare?: number;
  durationMinutes: number;
  distanceKm: number;
  interchanges: number;
}

export interface TicketingMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
  supportedApps: string[];
}

export interface TicketingGuide {
  methods: TicketingMethod[];
  modes: TicketMode[];
  tips: string[];
  rules: string[];
  mistakes: string[];
}

export interface TicketSummary {
  operator: string;
  ticketType: string;
  origin: string | null;
  destination: string | null;
  passengerCount: number;
  farePaid: number | null;
  purchaseTime: string | null;
  validUntil: string | null;
  ticketId: string | null;
  confidenceScore: number;
  statusHints: string | null;
  rawPayload?: string | null;
}

export interface SavedTicket extends TicketSummary {
  id: string;
  savedAt: string;
  cityId?: string;
}

export interface ParsedPhysicalTicket {
  origin: string;
  destination: string;
  lineName?: string;
  platformNumber?: string;
  entranceGate?: string;
  farePaid?: number;
  ticketType?: string;
  navigationSteps: string[];
  summary: string;
}

export interface IndoorNode {
  id: string;
  label: string;
  type: 'entrance' | 'concourse' | 'security' | 'afc_gate' | 'stairs' | 'escalator' | 'lift' | 'platform';
  level: number;
  x: number;
  y: number;
  z: number;
  platformId?: string;
  gateNumber?: string;
}

export interface IndoorEdge {
  from: string;
  to: string;
  distanceMeters: number;
  type: 'walk' | 'stairs' | 'escalator' | 'lift';
  accessible: boolean;
}

export interface IndoorGraph {
  nodes: IndoorNode[];
  edges: IndoorEdge[];
}

export interface StationLevel {
  level: number;
  name: string;
  heightMeters: number;
}

export interface StationLayout {
  stationId: string;
  levels: StationLevel[];
  graph: IndoorGraph;
  isTemplate?: boolean;
}

export interface ActiveTrip {
  originStationId: string;
  destStationId: string;
  lineId: string;
  currentStationId: string;
  nextStationId: string;
  stopsRemaining: number;
  totalStops: number;
  isBoarded: boolean;
  carriagePosition: 'standing' | 'sitting';
  speedKmh: number;
  doorOpeningSide: 'LEFT' | 'RIGHT';
  estimatedArrivalTimestamp: number;
  interchangeAtStationId?: string;
}

export interface MetroAdapter {
  cityId: string;
  displayName: string;
  nativeName: string;
  bounds: LatLngBounds;
  center: LatLng;
  operator: string;
  languageCode: string;
  dataQuality: {
    realtime: boolean;
    staticSchedule: boolean;
    indoorMaps: boolean;
    fareApi: boolean;
  };
  getStations(): Promise<Station[]>;
  getLines(): Promise<Line[]>;
  getArrivals(stationId: string): Promise<Arrival[]>;
  getFare(fromId: string, toId: string, mode: TicketMode): Promise<Fare>;
  getStationLayout(stationId: string): Promise<StationLayout | null>;
  getTicketingGuide(): TicketingGuide;
  verifyTicket?(payload: string): Promise<{ valid: boolean; message: string }>;
}
