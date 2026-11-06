/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IndoorGraph, IndoorNode, IndoorEdge } from '../../types';

export type PathProfile = 'fastest' | 'step_free' | 'least_crowded' | 'avoid_stairs';

export interface RouteStep {
  id: string;
  instruction: string;
  icon: 'walk' | 'stairs' | 'escalator' | 'lift' | 'security' | 'afc_gate' | 'platform' | 'entrance';
  distanceMeters: number;
  level: number;
  node: IndoorNode;
}

export interface NavigationRoute {
  totalDistanceMeters: number;
  estimatedSeconds: number;
  steps: RouteStep[];
  pathNodes: IndoorNode[];
}

export class IndoorPathfinder {
  static findPath(
    graph: IndoorGraph,
    startNodeId: string,
    targetNodeId: string,
    profile: PathProfile = 'fastest'
  ): NavigationRoute | null {
    const nodeMap = new Map<string, IndoorNode>();
    graph.nodes.forEach((n) => nodeMap.set(n.id, n));

    if (!nodeMap.has(startNodeId) || !nodeMap.has(targetNodeId)) {
      return null;
    }

    // Build adjacency list
    const adj = new Map<string, { to: string; weight: number; edge: IndoorEdge }[]>();
    graph.nodes.forEach((n) => adj.set(n.id, []));

    graph.edges.forEach((edge) => {
      // Check accessibility constraints
      if (profile === 'step_free') {
        if (edge.type === 'stairs' || edge.type === 'escalator') return; // Only lifts and level walks
      } else if (profile === 'avoid_stairs') {
        if (edge.type === 'stairs') return;
      }

      let penalty = 1.0;
      if (edge.type === 'stairs') penalty = 1.6;
      else if (edge.type === 'escalator') penalty = 0.9;
      else if (edge.type === 'lift') penalty = 1.2;

      const weight = edge.distanceMeters * penalty;

      adj.get(edge.from)?.push({ to: edge.to, weight, edge });
      // Bi-directional paths for indoor walking and lifts
      adj.get(edge.to)?.push({ to: edge.from, weight, edge });
    });

    // Dijkstra / A*
    const distances = new Map<string, number>();
    const previous = new Map<string, { nodeId: string; edge: IndoorEdge }>();
    const unvisited = new Set<string>();

    graph.nodes.forEach((n) => {
      distances.set(n.id, Infinity);
      unvisited.add(n.id);
    });

    distances.set(startNodeId, 0);

    while (unvisited.size > 0) {
      let currentId: string | null = null;
      let minDis = Infinity;

      for (const id of unvisited) {
        const d = distances.get(id) ?? Infinity;
        if (d < minDis) {
          minDis = d;
          currentId = id;
        }
      }

      if (!currentId || minDis === Infinity) break;
      if (currentId === targetNodeId) break;

      unvisited.delete(currentId);

      const neighbors = adj.get(currentId) || [];
      for (const { to, weight, edge } of neighbors) {
        if (!unvisited.has(to)) continue;
        const alt = minDis + weight;
        if (alt < (distances.get(to) ?? Infinity)) {
          distances.set(to, alt);
          previous.set(to, { nodeId: currentId, edge });
        }
      }
    }

    if (!previous.has(targetNodeId) && startNodeId !== targetNodeId) {
      return null;
    }

    // Reconstruct path
    const pathNodes: IndoorNode[] = [];
    const steps: RouteStep[] = [];
    let curr = targetNodeId;
    let totalDist = 0;

    const pathEdges: IndoorEdge[] = [];

    while (curr !== startNodeId) {
      const prevData = previous.get(curr);
      if (!prevData) break;
      pathNodes.unshift(nodeMap.get(curr)!);
      pathEdges.unshift(prevData.edge);
      totalDist += prevData.edge.distanceMeters;
      curr = prevData.nodeId;
    }
    pathNodes.unshift(nodeMap.get(startNodeId)!);

    // Build human-friendly turn-by-turn guidance
    for (let i = 0; i < pathNodes.length; i++) {
      const node = pathNodes[i];
      const nextNode = pathNodes[i + 1];
      const edge = pathEdges[i];

      let icon: RouteStep['icon'] = 'walk';
      let instruction = `Proceed to ${node.label}`;

      if (node.type === 'entrance') {
        icon = 'entrance';
        instruction = `Enter via ${node.label}`;
      } else if (node.type === 'security') {
        icon = 'security';
        instruction = 'Pass through CISF security bag scanner & metal detector';
      } else if (node.type === 'afc_gate') {
        icon = 'afc_gate';
        instruction = 'Tap your Smart Card or scan QR ticket at AFC Fare Gate';
      } else if (node.type === 'platform') {
        icon = 'platform';
        instruction = `Arrive at ${node.label}. Wait behind yellow safety strip`;
      } else if (edge) {
        if (edge.type === 'escalator') {
          icon = 'escalator';
          instruction = `Take escalator to ${nextNode?.label || 'next level'}`;
        } else if (edge.type === 'lift') {
          icon = 'lift';
          instruction = `Take elevator to ${nextNode?.label || 'next level'}`;
        } else if (edge.type === 'stairs') {
          icon = 'stairs';
          instruction = `Take stairs to ${nextNode?.label || 'next level'}`;
        }
      }

      steps.push({
        id: `step-${i}`,
        instruction,
        icon,
        distanceMeters: edge ? edge.distanceMeters : 0,
        level: node.level,
        node,
      });
    }

    // Average walking speed ~ 1.2 m/s + 15s security + 5s gate tap
    const estSeconds = Math.round(totalDist / 1.2) + 25;

    return {
      totalDistanceMeters: Math.round(totalDist),
      estimatedSeconds: estSeconds,
      steps,
      pathNodes,
    };
  }
}

// Multilingual Web Speech API Voice Guidance
export class VoiceGuidanceService {
  private static synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
  private static enabled = false;

  static toggle(enable?: boolean): boolean {
    this.enabled = enable !== undefined ? enable : !this.enabled;
    if (!this.enabled && this.synth) {
      this.synth.cancel();
    }
    return this.enabled;
  }

  static isEnabled(): boolean {
    return this.enabled;
  }

  static speak(text: string, lang: string = 'en-IN') {
    if (!this.enabled || !this.synth) return;
    this.synth.cancel(); // Stop ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    this.synth.speak(utterance);
  }
}
