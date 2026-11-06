/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IndoorNode } from '../../types';

export interface PDRState {
  stepsCount: number;
  cadenceStepsPerMin: number;
  headingDegrees: number;
  currentX: number;
  currentZ: number;
  confidence: number; // 0 to 1
  isWalking: boolean;
  snappedNodeId: string | null;
}

export class PedestrianDeadReckoningEngine {
  private steps = 0;
  private lastStepTimestamp = 0;
  private stepIntervals: number[] = [];
  private stepLengthM = 0.72; // Average stride in meters

  private heading = 0;
  private filteredHeading = 0;

  private posX = 0;
  private posZ = 0;
  private confidence = 0.95;

  private isListening = false;
  private listeners: ((state: PDRState) => void)[] = [];

  // Accelerometer peak detection
  private lastAccelMag = 9.8;
  private accelDeltaHistory: number[] = [];
  private peakThreshold = 1.35; // m/s^2 above gravity

  start() {
    if (this.isListening || typeof window === 'undefined') return;

    if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', this.handleMotion, { passive: true });
    }
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', this.handleOrientation, { passive: true });
    }
    this.isListening = true;
  }

  stop() {
    if (!this.isListening || typeof window === 'undefined') return;
    window.removeEventListener('devicemotion', this.handleMotion);
    window.removeEventListener('deviceorientation', this.handleOrientation);
    this.isListening = false;
  }

  resetPosition(x: number, z: number, node?: IndoorNode) {
    this.posX = x;
    this.posZ = z;
    this.confidence = 1.0;
    this.notify(node?.id || null);
  }

  // Allow manual step trigger for testing / desktop devices
  triggerSimulatedStep() {
    this.registerStep();
  }

  private handleMotion = (e: DeviceMotionEvent) => {
    const acc = e.accelerationIncludingGravity;
    if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

    const mag = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);
    const delta = Math.abs(mag - this.lastAccelMag);
    this.lastAccelMag = mag;

    this.accelDeltaHistory.push(delta);
    if (this.accelDeltaHistory.length > 5) this.accelDeltaHistory.shift();

    const now = Date.now();
    // Peak detection with minimum 280ms refractory period between human footsteps
    if (delta > this.peakThreshold && now - this.lastStepTimestamp > 280) {
      this.registerStep();
    }
  };

  private handleOrientation = (e: DeviceOrientationEvent) => {
    if (e.alpha !== null) {
      // Magnetic compass heading
      const rawHeading = (e.alpha + 360) % 360;
      // Exponential smoothing filter for heading jitter reduction
      this.filteredHeading = this.filteredHeading * 0.85 + rawHeading * 0.15;
      this.heading = Math.round(this.filteredHeading);
    }
  };

  private registerStep() {
    const now = Date.now();
    const interval = this.lastStepTimestamp > 0 ? now - this.lastStepTimestamp : 600;
    this.lastStepTimestamp = now;

    this.steps++;
    this.stepIntervals.push(interval);
    if (this.stepIntervals.length > 6) this.stepIntervals.shift();

    // Advance position along heading angle
    const headingRad = (this.heading * Math.PI) / 180;
    const dx = Math.sin(headingRad) * this.stepLengthM;
    const dz = -Math.cos(headingRad) * this.stepLengthM;

    this.posX += dx;
    this.posZ += dz;

    // Slight confidence decay over un-anchored steps
    this.confidence = Math.max(0.4, this.confidence - 0.015);

    this.notify();
  }

  // Snap to closest valid node on graph (map matching)
  snapToNodes(nodes: IndoorNode[]): IndoorNode | null {
    if (nodes.length === 0) return null;

    let closest: IndoorNode | null = null;
    let minDisSq = Infinity;

    for (const n of nodes) {
      const dx = this.posX - n.x;
      const dz = this.posZ - n.z;
      const dSq = dx * dx + dz * dz;
      if (dSq < minDisSq) {
        minDisSq = dSq;
        closest = n;
      }
    }

    if (closest && minDisSq < 4.0) {
      // Re-anchor to node if within 2m
      this.posX = this.posX * 0.3 + closest.x * 0.7;
      this.posZ = this.posZ * 0.3 + closest.z * 0.7;
      this.confidence = Math.min(1.0, this.confidence + 0.15);
      return closest;
    }

    return null;
  }

  subscribe(listener: (state: PDRState) => void) {
    this.listeners.push(listener);
    this.notify();
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(snappedNodeId: string | null = null) {
    const now = Date.now();
    const isWalking = now - this.lastStepTimestamp < 1500;

    let cadence = 0;
    if (this.stepIntervals.length > 0) {
      const avgInterval = this.stepIntervals.reduce((a, b) => a + b, 0) / this.stepIntervals.length;
      cadence = Math.round((60 * 1000) / avgInterval);
    }

    const state: PDRState = {
      stepsCount: this.steps,
      cadenceStepsPerMin: isWalking ? cadence : 0,
      headingDegrees: this.heading,
      currentX: this.posX,
      currentZ: this.posZ,
      confidence: this.confidence,
      isWalking,
      snappedNodeId,
    };

    this.listeners.forEach((l) => l(state));
  }
}

export const pdrEngine = new PedestrianDeadReckoningEngine();
