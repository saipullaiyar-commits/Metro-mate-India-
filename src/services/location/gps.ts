/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LatLng, Station } from '../../types';
import { calculateDistanceKm } from '../../adapters/helper';

export interface LocationState {
  coords: LatLng | null;
  accuracy: number | null;
  speedKmh: number;
  heading: number | null;
  isIndoor: boolean;
  geofenceState: 'OUTSIDE' | 'APPROACHING' | 'AT_ENTRANCE' | 'INSIDE';
  nearestStation: Station | null;
  nearestStationDistM: number;
  permissionStatus: 'prompt' | 'granted' | 'denied' | 'unsupported';
  errorMessage: string | null;
}

// 1D Kalman Filter for GPS smoothing
class KalmanFilter {
  private q: number; // process noise
  private r: number; // measurement noise
  private x: number = 0; // value
  private p: number = 1; // estimation error covariance
  private k: number = 0; // kalman gain
  private initialized: boolean = false;

  constructor(processNoise = 0.0001, measurementNoise = 0.001) {
    this.q = processNoise;
    this.r = measurementNoise;
  }

  filter(measurement: number): number {
    if (!this.initialized) {
      this.x = measurement;
      this.initialized = true;
      return this.x;
    }
    this.p = this.p + this.q;
    this.k = this.p / (this.p + this.r);
    this.x = this.x + this.k * (measurement - this.x);
    this.p = (1 - this.k) * this.p;
    return this.x;
  }
}

export class LocationEngine {
  private latFilter = new KalmanFilter();
  private lngFilter = new KalmanFilter();
  private watchId: number | null = null;
  private listeners: ((state: LocationState) => void)[] = [];

  private currentState: LocationState = {
    coords: null,
    accuracy: null,
    speedKmh: 0,
    heading: null,
    isIndoor: false,
    geofenceState: 'OUTSIDE',
    nearestStation: null,
    nearestStationDistM: Infinity,
    permissionStatus: 'prompt',
    errorMessage: null,
  };

  private stationsList: Station[] = [];

  setStations(stations: Station[]) {
    this.stationsList = stations;
    if (this.currentState.coords) {
      this.evaluateGeofences(this.currentState.coords);
    }
  }

  subscribe(listener: (state: LocationState) => void) {
    this.listeners.push(listener);
    listener(this.currentState);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l({ ...this.currentState }));
  }

  startWatching() {
    if (!('geolocation' in navigator)) {
      this.currentState.permissionStatus = 'unsupported';
      this.currentState.errorMessage = 'Geolocation is not supported by your browser.';
      this.notify();
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 5000,
    };

    this.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const rawLat = pos.coords.latitude;
        const rawLng = pos.coords.longitude;
        const rawAccuracy = pos.coords.accuracy;

        // Discard outdoor fixes with accuracy worse than 50 meters to prevent jumping
        const isDegraded = rawAccuracy > 50;

        // Detect indoor handover: accuracy degrades heavily or indoors reported
        const isIndoor = rawAccuracy > 35;

        // Apply Kalman filter
        const smoothLat = this.latFilter.filter(rawLat);
        const smoothLng = this.lngFilter.filter(rawLng);

        const speedKmh = pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 0;
        const heading = pos.coords.heading ?? null;

        const smoothedCoords: LatLng = { lat: smoothLat, lng: smoothLng };

        this.currentState = {
          ...this.currentState,
          coords: smoothedCoords,
          accuracy: rawAccuracy,
          speedKmh,
          heading,
          isIndoor,
          permissionStatus: 'granted',
          errorMessage: null,
        };

        this.evaluateGeofences(smoothedCoords);
        this.notify();
      },
      (err) => {
        let msg = 'Failed to obtain GPS position';
        if (err.code === err.PERMISSION_DENIED) {
          this.currentState.permissionStatus = 'denied';
          msg = 'Location permission was denied. You can manually choose any metro station.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'GPS signal unavailable. Using scheduled timetable data.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'GPS acquisition timed out.';
        }
        this.currentState.errorMessage = msg;
        this.notify();
      },
      options
    );
  }

  stopWatching() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  // Geofence calculation against loaded stations
  private evaluateGeofences(userLoc: LatLng) {
    if (this.stationsList.length === 0) return;

    let closest: Station | null = null;
    let minDistM = Infinity;

    for (const s of this.stationsList) {
      const distKm = calculateDistanceKm(userLoc.lat, userLoc.lng, s.coordinates.lat, s.coordinates.lng);
      const distM = distKm * 1000;
      if (distM < minDistM) {
        minDistM = distM;
        closest = s;
      }
    }

    let geofence: LocationState['geofenceState'] = 'OUTSIDE';
    if (minDistM <= 30) {
      geofence = 'INSIDE';
    } else if (minDistM <= 75) {
      geofence = 'AT_ENTRANCE';
    } else if (minDistM <= 200) {
      geofence = 'APPROACHING';
    }

    this.currentState.nearestStation = closest;
    this.currentState.nearestStationDistM = Math.round(minDistM);
    this.currentState.geofenceState = geofence;
  }
}

export const locationEngine = new LocationEngine();
