/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useMetroStore } from '../state/useMetroStore';
import { AvatarStickman } from './AvatarStickman';
import { Armchair, User, Volume2, ShieldAlert } from 'lucide-react';

export const CarriageScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    activeTrip,
    selectedLineId,
    lines,
    stations,
    setCarriagePosition,
  } = useMetroStore();

  const [isSitting, setIsSitting] = useState(activeTrip?.carriagePosition === 'sitting');

  const activeLine = lines.find((l) => l.id === (activeTrip?.lineId || selectedLineId)) || lines[0];
  const lineColor = activeLine?.color || '#0284C7';
  const isUnderground = activeLine?.isUnderground ?? true;

  const currentStation = stations.find((s) => s.id === activeTrip?.currentStationId) || stations[0];
  const nextStation = stations.find((s) => s.id === activeTrip?.nextStationId) || stations[1];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.shadowMap.enabled = !isSoftwareGl;

    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isUnderground ? '#030712' : '#0F172A');

    const camera = new THREE.PerspectiveCamera(55, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 1.8, 2.5);

    // Interior Carriage Lighting
    const ambientLight = new THREE.AmbientLight('#F8FAFC', 1.0);
    scene.add(ambientLight);

    const roofLight = new THREE.DirectionalLight('#FFFFFF', 1.2);
    roofLight.position.set(0, 3.5, 0);
    scene.add(roofLight);

    // 1. Carriage Shell (Floor, Ceiling, Walls)
    const carriageGroup = new THREE.Group();
    scene.add(carriageGroup);

    // Floor
    const floorGeo = new THREE.PlaneGeometry(3.6, 16);
    const floorMat = new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.4 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    carriageGroup.add(floor);

    // Ceiling
    const ceilingGeo = new THREE.PlaneGeometry(3.6, 16);
    const ceilingMat = new THREE.MeshStandardMaterial({ color: '#F8FAFC', roughness: 0.3 });
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 2.6;
    carriageGroup.add(ceiling);

    // Overhead LED lighting strips
    const ledGeo = new THREE.BoxGeometry(0.3, 0.05, 15);
    const ledMat = new THREE.MeshBasicMaterial({ color: '#FFFFFF' });
    const ledLeft = new THREE.Mesh(ledGeo, ledMat);
    ledLeft.position.set(-0.8, 2.58, 0);
    carriageGroup.add(ledLeft);

    const ledRight = new THREE.Mesh(ledGeo, ledMat);
    ledRight.position.set(0.8, 2.58, 0);
    carriageGroup.add(ledRight);

    // Wall panels with authentic livery stripe
    const wallGeo = new THREE.PlaneGeometry(16, 2.6);
    const wallMat = new THREE.MeshStandardMaterial({ color: '#E2E8F0', roughness: 0.3 });

    const leftWall = new THREE.Mesh(wallGeo, wallMat);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-1.8, 1.3, 0);
    carriageGroup.add(leftWall);

    const rightWall = new THREE.Mesh(wallGeo, wallMat);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(1.8, 1.3, 0);
    carriageGroup.add(rightWall);

    // Line Color Accent Band along interior ceiling
    const bandGeo = new THREE.BoxGeometry(0.1, 0.15, 16);
    const bandMat = new THREE.MeshBasicMaterial({ color: lineColor });
    const bandLeft = new THREE.Mesh(bandGeo, bandMat);
    bandLeft.position.set(-1.75, 2.4, 0);
    carriageGroup.add(bandLeft);

    const bandRight = new THREE.Mesh(bandGeo, bandMat);
    bandRight.position.set(1.75, 2.4, 0);
    carriageGroup.add(bandRight);

    // 2. Stainless Steel Grab Poles & Ceiling Handles
    const poleMat = new THREE.MeshStandardMaterial({ color: '#CBD5E1', metalness: 0.9, roughness: 0.15 });
    for (let z of [-5, -2, 1, 4]) {
      const poleGeo = new THREE.CylinderGeometry(0.025, 0.025, 2.6, 12);
      const poleLeft = new THREE.Mesh(poleGeo, poleMat);
      poleLeft.position.set(-0.9, 1.3, z);
      carriageGroup.add(poleLeft);

      const poleRight = new THREE.Mesh(poleGeo, poleMat);
      poleRight.position.set(0.9, 1.3, z);
      carriageGroup.add(poleRight);
    }

    // Horizontal overhead grab bars
    const barGeo = new THREE.CylinderGeometry(0.02, 0.02, 14, 8);
    const barLeft = new THREE.Mesh(barGeo, poleMat);
    barLeft.rotation.x = Math.PI / 2;
    barLeft.position.set(-0.9, 2.1, 0);
    carriageGroup.add(barLeft);

    const barRight = new THREE.Mesh(barGeo, poleMat);
    barRight.rotation.x = Math.PI / 2;
    barRight.position.set(0.9, 2.1, 0);
    carriageGroup.add(barRight);

    // 3. Ergonomic Commuter Seats (Stainless Steel with Priority Color)
    const seatMat = new THREE.MeshStandardMaterial({ color: '#0284C7', roughness: 0.35 });
    const seatPriorityMat = new THREE.MeshStandardMaterial({ color: '#F59E0B', roughness: 0.35 }); // Yellow priority seat

    for (let z = -6; z <= 6; z += 1.2) {
      const isPriority = z < -3;
      const sMat = isPriority ? seatPriorityMat : seatMat;

      // Left bench
      const seatGeo = new THREE.BoxGeometry(0.55, 0.45, 0.95);
      const seatLeft = new THREE.Mesh(seatGeo, sMat);
      seatLeft.position.set(-1.45, 0.35, z);
      carriageGroup.add(seatLeft);

      // Backrest
      const backGeo = new THREE.BoxGeometry(0.12, 0.55, 0.95);
      const backLeft = new THREE.Mesh(backGeo, sMat);
      backLeft.position.set(-1.7, 0.8, z);
      carriageGroup.add(backLeft);

      // Right bench
      const seatRight = new THREE.Mesh(seatGeo, sMat);
      seatRight.position.set(1.45, 0.35, z);
      carriageGroup.add(seatRight);

      const backRight = new THREE.Mesh(backGeo, sMat);
      backRight.position.set(1.7, 0.8, z);
      carriageGroup.add(backRight);
    }

    // 4. Parallax Windows (Underground tunnel cables vs Elevated city lights)
    const windowMat = new THREE.MeshBasicMaterial({ color: '#000000' });
    for (let z of [-4, -1, 2, 5]) {
      const winGeo = new THREE.PlaneGeometry(1.6, 1.1);
      const winLeft = new THREE.Mesh(winGeo, windowMat);
      winLeft.rotation.y = Math.PI / 2;
      winLeft.position.set(-1.79, 1.45, z);
      carriageGroup.add(winLeft);

      const winRight = new THREE.Mesh(winGeo, windowMat);
      winRight.rotation.y = -Math.PI / 2;
      winRight.position.set(1.79, 1.45, z);
      carriageGroup.add(winRight);
    }

    // Scrolling tunnel light streaks
    const tunnelGroup = new THREE.Group();
    scene.add(tunnelGroup);
    const streakGeo = new THREE.BoxGeometry(0.05, 0.05, 2.5);
    const streakMat = new THREE.MeshBasicMaterial({ color: isUnderground ? '#38BDF8' : '#FBBF24' });
    const streaks: THREE.Mesh[] = [];

    for (let i = 0; i < 18; i++) {
      const streak = new THREE.Mesh(streakGeo, streakMat);
      streak.position.set(
        i % 2 === 0 ? -2.2 : 2.2,
        1.2 + Math.random() * 0.8,
        (Math.random() - 0.5) * 30
      );
      tunnelGroup.add(streak);
      streaks.push(streak);
    }

    // 5. Stickman Commuter Avatar in Carriage
    const avatar = new AvatarStickman(lineColor);
    scene.add(avatar.group);

    if (isSitting) {
      avatar.group.position.set(-1.3, 0.1, 0);
      avatar.group.rotation.y = Math.PI / 2;
      avatar.update(0, false, 0, true);
    } else {
      avatar.group.position.set(0, 0, 0);
      avatar.group.rotation.y = 0;
    }

    // Animation Loop with subtle train acceleration sway
    let animationFrameId = 0;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const delta = clock.getDelta();

      // Simulated train sway
      const swayRoll = Math.sin(time * 1.8) * 0.012;
      const swayPitch = Math.cos(time * 2.2) * 0.008;
      carriageGroup.rotation.z = swayRoll;
      carriageGroup.rotation.x = swayPitch;

      // Scroll window light streaks for speed illusion (35 km/h)
      streaks.forEach((s) => {
        s.position.z += 18 * delta;
        if (s.position.z > 15) {
          s.position.z = -15;
          s.position.y = 1.0 + Math.random() * 1.0;
        }
      });

      if (!isSitting) {
        avatar.group.rotation.z = -swayRoll * 1.2;
        avatar.update(delta, false);
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isSitting, lineColor, isUnderground]);

  const toggleSitting = () => {
    const next = !isSitting;
    setIsSitting(next);
    setCarriagePosition(next ? 'sitting' : 'standing');
  };

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden select-none">
      {/* 3D Canvas */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />

      {/* Top Banner: In-Train Live Route Strip */}
      <div className="absolute top-4 left-4 right-4 z-20 max-w-xl mx-auto">
        <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl p-4 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold text-slate-200 uppercase tracking-wider">
              {activeLine.name} · Speed ~34 km/h
            </span>
            <span className="font-mono text-emerald-400 font-bold">
              DOORS OPEN: {activeTrip?.doorOpeningSide || 'LEFT'}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="text-left">
              <p className="text-xs text-slate-400">Previous</p>
              <p className="font-semibold text-slate-300 truncate max-w-[120px]">
                {currentStation?.name || 'Origin'}
              </p>
            </div>

            <div className="flex-1 mx-4 flex flex-col items-center">
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-1">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    backgroundColor: lineColor,
                    width: `${Math.max(20, (1 - (activeTrip?.stopsRemaining || 3) / 5) * 100)}%`,
                  }}
                />
              </div>
              <span className="text-[11px] font-mono text-sky-400 font-bold">
                {activeTrip?.stopsRemaining || 3} stops remaining
              </span>
            </div>

            <div className="text-right">
              <p className="text-xs text-amber-400 font-medium">Next Station</p>
              <p className="font-bold text-white truncate max-w-[120px]">
                {nextStation?.name || 'Terminal'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Floating Control Dock */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 w-full max-w-md px-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSitting}
              className={`py-2 px-3 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors ${
                isSitting
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Armchair className="w-4 h-4" />
              <span>{isSitting ? 'Sitting' : 'Standing'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Priority / Women Coach 1 Ahead</span>
          </div>
        </div>
      </div>
    </div>
  );
};
