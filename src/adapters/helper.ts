/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Arrival, StationLayout, IndoorGraph, IndoorNode, IndoorEdge, StationLevel, Station } from '../types';

export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Generate realistic headway-based arrivals based on current clock time
export function generateHeadwayArrivals(
  stationId: string,
  lineId: string,
  destinations: { dest: string; platform: string }[],
  headwayMinutes: number = 4
): Arrival[] {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const currentSeconds = now.getSeconds();

  const arrivals: Arrival[] = [];

  destinations.forEach((d, idx) => {
    // Generate next 2 trains per direction
    for (let i = 0; i < 2; i++) {
      const cycleOffsetSec = ((currentMinutes % headwayMinutes) * 60 + currentSeconds + idx * 90 + i * headwayMinutes * 60) % (headwayMinutes * 60);
      const remainingSec = headwayMinutes * 60 - cycleOffsetSec + i * headwayMinutes * 60;
      
      let status: Arrival['status'] = 'SCHEDULED';
      if (remainingSec <= 30) status = 'AT_PLATFORM';
      else if (remainingSec <= 75) status = 'ARRIVING';
      else if (remainingSec <= 150) status = 'APPROACHING';

      const arrivalTime = new Date(now.getTime() + remainingSec * 1000);
      const timeStr = arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      arrivals.push({
        id: `${stationId}-${lineId}-${idx}-${i}`,
        stationId,
        lineId,
        destination: d.dest,
        platform: d.platform,
        etaSeconds: remainingSec,
        scheduledTime: timeStr,
        status,
        crowdLevel: remainingSec < 120 ? 'HIGH' : 'MODERATE',
        provenance: 'SCHEDULED', // Clearly labeled
      });
    }
  });

  return arrivals.sort((a, b) => a.etaSeconds - b.etaSeconds);
}

// Procedural multi-level indoor graph generator for typical Indian metro layout
export function createDefaultStationLayout(station: Station): StationLayout {
  const isUnderground = station.layoutType === 'underground';
  
  const levels: StationLevel[] = isUnderground
    ? [
        { level: 0, name: 'Street Level (Entrances)', heightMeters: 0 },
        { level: -1, name: 'Concourse & Ticketing (Security & AFC Gates)', heightMeters: -5 },
        { level: -2, name: 'Platform Level (Train Boarding)', heightMeters: -11 },
      ]
    : [
        { level: 0, name: 'Ground Level (Entrances & Parking)', heightMeters: 0 },
        { level: 1, name: 'Concourse & Ticketing (Security & AFC Gates)', heightMeters: 6 },
        { level: 2, name: 'Platform Level (Train Boarding)', heightMeters: 13 },
      ];

  const l0 = levels[0].level;
  const l1 = levels[1].level;
  const l2 = levels[2].level;

  const nodes: IndoorNode[] = [];
  const edges: IndoorEdge[] = [];

  // Street Entrances (Gate 1, Gate 2)
  const gates = station.entrances.length > 0 ? station.entrances : [
    { gateNumber: 'Gate 1', streetName: 'Main Road Entrance', accessible: true },
    { gateNumber: 'Gate 2', streetName: 'Opposite Side Entrance', accessible: false },
  ];

  gates.forEach((g, i) => {
    const entranceNodeId = `entrance-gate-${i + 1}`;
    nodes.push({
      id: entranceNodeId,
      label: `${g.gateNumber}: ${g.streetName}`,
      type: 'entrance',
      level: l0,
      x: (i === 0 ? -15 : 15),
      y: 0,
      z: 20,
      gateNumber: g.gateNumber,
    });

    // Concourse foyer
    const foyerNodeId = `concourse-foyer-${i + 1}`;
    nodes.push({
      id: foyerNodeId,
      label: `Concourse Foyer ${i + 1}`,
      type: 'concourse',
      level: l1,
      x: (i === 0 ? -10 : 10),
      y: 0,
      z: 10,
    });

    // Escalator & Stairs between Street and Concourse
    edges.push({
      from: entranceNodeId,
      to: foyerNodeId,
      distanceMeters: 25,
      type: 'escalator',
      accessible: false,
    });

    if (g.accessible) {
      const liftStreet = `lift-street-${i + 1}`;
      const liftConcourse = `lift-concourse-${i + 1}`;
      nodes.push({
        id: liftStreet,
        label: `Elevator Street Gate ${g.gateNumber}`,
        type: 'lift',
        level: l0,
        x: (i === 0 ? -18 : 18),
        y: 0,
        z: 22,
      });
      nodes.push({
        id: liftConcourse,
        label: `Elevator Concourse ${i + 1}`,
        type: 'lift',
        level: l1,
        x: (i === 0 ? -12 : 12),
        y: 0,
        z: 12,
      });
      edges.push({
        from: entranceNodeId,
        to: liftStreet,
        distanceMeters: 5,
        type: 'walk',
        accessible: true,
      });
      edges.push({
        from: liftStreet,
        to: liftConcourse,
        distanceMeters: 10,
        type: 'lift',
        accessible: true,
      });
      edges.push({
        from: liftConcourse,
        to: foyerNodeId,
        distanceMeters: 5,
        type: 'walk',
        accessible: true,
      });
    }
  });

  // Security & Bag Scanners
  const securityNodeId = 'security-checkpoint';
  nodes.push({
    id: securityNodeId,
    label: 'CISF Security & Bag Scanner',
    type: 'security',
    level: l1,
    x: 0,
    y: 0,
    z: 5,
  });

  // Connect foyers to security
  gates.forEach((_, i) => {
    edges.push({
      from: `concourse-foyer-${i + 1}`,
      to: securityNodeId,
      distanceMeters: 15,
      type: 'walk',
      accessible: true,
    });
  });

  // AFC Fare Gates (Tap In)
  const afcGateNodeId = 'afc-gates';
  nodes.push({
    id: afcGateNodeId,
    label: 'Automatic Fare Collection (AFC) Gates',
    type: 'afc_gate',
    level: l1,
    x: 0,
    y: 0,
    z: -5,
  });

  edges.push({
    from: securityNodeId,
    to: afcGateNodeId,
    distanceMeters: 10,
    type: 'walk',
    accessible: true,
  });

  // Paid Concourse
  const paidConcourseId = 'paid-concourse-central';
  nodes.push({
    id: paidConcourseId,
    label: 'Paid Area Central Concourse',
    type: 'concourse',
    level: l1,
    x: 0,
    y: 0,
    z: -15,
  });

  edges.push({
    from: afcGateNodeId,
    to: paidConcourseId,
    distanceMeters: 8,
    type: 'walk',
    accessible: true,
  });

  // Platform 1 and Platform 2
  const p1Id = 'platform-1';
  const p2Id = 'platform-2';

  nodes.push({
    id: p1Id,
    label: 'Platform 1',
    type: 'platform',
    level: l2,
    x: -8,
    y: 0,
    z: -30,
    platformId: '1',
  });

  nodes.push({
    id: p2Id,
    label: 'Platform 2',
    type: 'platform',
    level: l2,
    x: 8,
    y: 0,
    z: -30,
    platformId: '2',
  });

  // Connect Paid Concourse to Platforms via Escalators and Accessible Lift
  edges.push({
    from: paidConcourseId,
    to: p1Id,
    distanceMeters: 30,
    type: 'escalator',
    accessible: false,
  });

  edges.push({
    from: paidConcourseId,
    to: p2Id,
    distanceMeters: 30,
    type: 'escalator',
    accessible: false,
  });

  // Central Concourse Lift to Platforms
  const centralLiftConcourse = 'central-platform-lift-concourse';
  const centralLiftPlatform = 'central-platform-lift-platform';

  nodes.push({
    id: centralLiftConcourse,
    label: 'Elevator to Platforms (Concourse)',
    type: 'lift',
    level: l1,
    x: 0,
    y: 0,
    z: -20,
  });

  nodes.push({
    id: centralLiftPlatform,
    label: 'Elevator Platform Landing',
    type: 'lift',
    level: l2,
    x: 0,
    y: 0,
    z: -30,
  });

  edges.push({
    from: paidConcourseId,
    to: centralLiftConcourse,
    distanceMeters: 6,
    type: 'walk',
    accessible: true,
  });

  edges.push({
    from: centralLiftConcourse,
    to: centralLiftPlatform,
    distanceMeters: 10,
    type: 'lift',
    accessible: true,
  });

  edges.push({
    from: centralLiftPlatform,
    to: p1Id,
    distanceMeters: 8,
    type: 'walk',
    accessible: true,
  });

  edges.push({
    from: centralLiftPlatform,
    to: p2Id,
    distanceMeters: 8,
    type: 'walk',
    accessible: true,
  });

  const graph: IndoorGraph = { nodes, edges };

  return {
    stationId: station.id,
    levels,
    graph,
    isTemplate: true,
  };
}
