/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useMetroStore } from '../state/useMetroStore';
import { AvatarStickman } from './AvatarStickman';
import { createFloorTileTexture, createPlatformEdgeTexture, createPIDSTexture, createSignageTexture } from './textures';
import { IndoorPathfinder, NavigationRoute, VoiceGuidanceService } from '../services/indoor/pathfinder';
import { pdrEngine } from '../services/sensors/pdr';
import confetti from 'canvas-confetti';
import { ChevronDown, ChevronUp, Eye, Footprints, Volume2, VolumeX, Compass } from 'lucide-react';

export const StationScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    activeStation,
    activeStationLayout,
    selectedLineId,
    lines,
    arrivals,
    targetPlatformId,
  } = useMetroStore();

  const [activeRoute, setActiveRoute] = useState<NavigationRoute | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isControlsCollapsed, setIsControlsCollapsed] = useState(false);
  const [cameraMode, setCameraMode] = useState<'follow' | 'top' | 'cinema'>('follow');
  const [stepsWalked, setStepsWalked] = useState(0);

  const activeLine = lines.find((l) => l.id === selectedLineId) || lines[0];
  const lineColor = activeLine?.color || '#0284C7';

  // Compute A* route whenever station layout or target platform changes
  useEffect(() => {
    if (!activeStationLayout) return;
    const entranceNode = activeStationLayout.graph.nodes.find((n) => n.type === 'entrance')?.id || 'entrance-gate-1';
    const targetNode = activeStationLayout.graph.nodes.find((n) => n.type === 'platform' && n.id === targetPlatformId)?.id || 'platform-1';

    const route = IndoorPathfinder.findPath(activeStationLayout.graph, entranceNode, targetNode, 'fastest');
    setActiveRoute(route);
    setCurrentStepIndex(0);
  }, [activeStationLayout, targetPlatformId]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Detect software WebGL
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // Initialize Three.js Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Scene & Fog
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0F172A');
    scene.fog = new THREE.FogExp2('#0F172A', 0.02);

    // Camera
    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 200);
    camera.position.set(0, 5, 12);

    // Studio Lighting Rig
    const ambientLight = new THREE.AmbientLight('#E2E8F0', 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight('#FFFFFF', 1.8);
    keyLight.position.set(15, 25, 20);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight('#60A5FA', '#1E293B', 0.6);
    scene.add(hemiLight);

    // Procedural Station Environment
    const stationGroup = new THREE.Group();
    scene.add(stationGroup);

    // 1. Concourse Floor
    const floorTexture = createFloorTileTexture();
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTexture,
      roughness: 0.35,
      metalness: 0.1,
    });
    const floorGeo = new THREE.PlaneGeometry(60, 80);
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, 0);
    floor.receiveShadow = !isSoftwareGl;
    stationGroup.add(floor);

    // 2. Ceiling with modern linear LED light panels
    const ceilingMat = new THREE.MeshStandardMaterial({ color: '#1E293B', roughness: 0.6 });
    const ceilingGeo = new THREE.PlaneGeometry(60, 80);
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, 6.5, 0);
    stationGroup.add(ceiling);

    // Linear light strips
    for (let z = -35; z <= 35; z += 10) {
      const stripGeo = new THREE.BoxGeometry(40, 0.1, 0.4);
      const stripMat = new THREE.MeshBasicMaterial({ color: '#FFFFFF' });
      const strip = new THREE.Mesh(stripGeo, stripMat);
      strip.position.set(0, 6.45, z);
      stationGroup.add(strip);
    }

    // 3. Station Pillars
    const pillarMat = new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.25, metalness: 0.3 });
    const pillarGeo = new THREE.CylinderGeometry(0.5, 0.5, 6.5, 16);
    for (let x of [-14, 14]) {
      for (let z = -30; z <= 30; z += 15) {
        const pillar = new THREE.Mesh(pillarGeo, pillarMat);
        pillar.position.set(x, 3.25, z);
        pillar.castShadow = !isSoftwareGl;
        pillar.receiveShadow = !isSoftwareGl;
        stationGroup.add(pillar);
      }
    }

    // 4. Security Checkpoint Metal Detector Arches
    const archMat = new THREE.MeshStandardMaterial({ color: '#475569', roughness: 0.4, metalness: 0.6 });
    const archGeo = new THREE.BoxGeometry(2.4, 3.2, 0.6);
    const securityArch = new THREE.Mesh(archGeo, archMat);
    securityArch.position.set(0, 1.6, 5);
    securityArch.castShadow = true;
    stationGroup.add(securityArch);

    // 5. Automatic Fare Collection (AFC) Turnstiles
    for (let i = -3; i <= 3; i++) {
      const gateGeo = new THREE.BoxGeometry(0.3, 1.1, 2.0);
      const gateMat = new THREE.MeshStandardMaterial({ color: '#94A3B8', metalness: 0.8, roughness: 0.2 });
      const gate = new THREE.Mesh(gateGeo, gateMat);
      gate.position.set(i * 1.5, 0.55, -5);
      gate.castShadow = true;
      stationGroup.add(gate);

      // Green scanning arrow indicator
      const lightGeo = new THREE.SphereGeometry(0.06, 8, 8);
      const lightMat = new THREE.MeshBasicMaterial({ color: '#22C55E' });
      const light = new THREE.Mesh(lightGeo, lightMat);
      light.position.set(i * 1.5, 1.15, -4.6);
      stationGroup.add(light);
    }

    // 6. Escalators to Platform
    const escalatorGeo = new THREE.BoxGeometry(2.2, 4.0, 8.0);
    const escalatorMat = new THREE.MeshStandardMaterial({ color: '#1E293B', roughness: 0.5, metalness: 0.5 });
    const escalator = new THREE.Mesh(escalatorGeo, escalatorMat);
    escalator.position.set(0, -1.5, -20);
    escalator.rotation.x = Math.PI / 6;
    stationGroup.add(escalator);

    // 7. Platform Level with Yellow Tactile Strip
    const edgeTex = createPlatformEdgeTexture();
    const edgeMat = new THREE.MeshBasicMaterial({ map: edgeTex });
    const edgeGeo = new THREE.PlaneGeometry(35, 1.2);
    const platformEdge1 = new THREE.Mesh(edgeGeo, edgeMat);
    platformEdge1.rotation.x = -Math.PI / 2;
    platformEdge1.position.set(-8, 0.02, -32);
    stationGroup.add(platformEdge1);

    const platformEdge2 = new THREE.Mesh(edgeGeo, edgeMat);
    platformEdge2.rotation.x = -Math.PI / 2;
    platformEdge2.position.set(8, 0.02, -32);
    stationGroup.add(platformEdge2);

    // 8. 3D Platform Electronic Display Board (PIDS)
    const nextArr = arrivals[0];
    const pidsTex = createPIDSTexture(
      nextArr?.destination || 'City Centre Terminal',
      Math.max(1, Math.round((nextArr?.etaSeconds || 180) / 60)),
      'Platform 1',
      lineColor
    );
    const pidsMat = new THREE.MeshBasicMaterial({ map: pidsTex });
    const pidsGeo = new THREE.BoxGeometry(6.0, 1.5, 0.3);
    const pidsBoard = new THREE.Mesh(pidsGeo, pidsMat);
    pidsBoard.position.set(0, 4.5, -28);
    stationGroup.add(pidsBoard);

    // 9. Modern Metro Train parked on Platform 1 Track
    const trainGroup = new THREE.Group();
    trainGroup.position.set(-13, 1.4, -34);

    // Train Body (matching authentic operator livery!)
    const coachBodyGeo = new THREE.BoxGeometry(4.2, 2.8, 32);
    const coachBodyMat = new THREE.MeshStandardMaterial({
      color: activeLine.operatorLivery.primaryColor || '#E2E8F0',
      metalness: 0.7,
      roughness: 0.25,
    });
    const coachBody = new THREE.Mesh(coachBodyGeo, coachBodyMat);
    trainGroup.add(coachBody);

    // Colored Livery Stripe
    const stripeGeo = new THREE.BoxGeometry(4.24, 0.45, 32);
    const stripeMat = new THREE.MeshBasicMaterial({ color: lineColor });
    const stripe = new THREE.Mesh(stripeGeo, stripeMat);
    stripe.position.y = 0.1;
    trainGroup.add(stripe);

    // Aerodynamic Cab Nose
    const cabGeo = new THREE.CylinderGeometry(1.6, 2.1, 3.2, 16);
    const cab = new THREE.Mesh(cabGeo, coachBodyMat);
    cab.rotation.x = Math.PI / 2;
    cab.position.set(0, 0, 16);
    trainGroup.add(cab);

    stationGroup.add(trainGroup);

    // 10. Stickman Avatar
    const avatar = new AvatarStickman(lineColor);
    scene.add(avatar.group);
    avatar.group.position.set(0, 0, 15); // Start near entrance

    // 11. Navigation Ribbon & Waypoint Markers
    let ribbonMesh: THREE.Mesh | null = null;
    const waypointRings: THREE.Mesh[] = [];

    const updateNavigationVisuals = (route: NavigationRoute | null) => {
      if (ribbonMesh) {
        scene.remove(ribbonMesh);
        ribbonMesh.geometry.dispose();
        ribbonMesh = null;
      }
      waypointRings.forEach((r) => scene.remove(r));
      waypointRings.length = 0;

      if (!route || route.pathNodes.length === 0) return;

      const points = route.pathNodes.map((n) => new THREE.Vector3(n.x, 0.08, n.z));
      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.14, 8, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: lineColor,
        transparent: true,
        opacity: 0.85,
      });
      ribbonMesh = new THREE.Mesh(tubeGeo, tubeMat);
      scene.add(ribbonMesh);

      // Waypoint glowing rings at key milestones
      route.pathNodes.forEach((n) => {
        const ringGeo = new THREE.RingGeometry(0.4, 0.65, 24);
        const ringMat = new THREE.MeshBasicMaterial({
          color: '#38BDF8',
          side: THREE.DoubleSide,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(n.x, 0.09, n.z);
        scene.add(ring);
        waypointRings.push(ring);
      });
    };

    updateNavigationVisuals(activeRoute);

    // Animation Loop
    let animationFrameId = 0;
    let clock = new THREE.Clock();
    let currentWaypointIdx = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Animate avatar along route path
      if (activeRoute && activeRoute.pathNodes.length > 0) {
        const targetNode = activeRoute.pathNodes[currentWaypointIdx];
        if (targetNode) {
          const targetPos = new THREE.Vector3(targetNode.x, 0, targetNode.z);
          const currentPos = avatar.group.position;
          const dist = currentPos.distanceTo(targetPos);

          if (dist > 0.4) {
            // Glide smoothly towards target waypoint
            const moveDir = targetPos.clone().sub(currentPos).normalize();
            currentPos.addScaledVector(moveDir, Math.min(dist, 2.4 * delta));

            // Face direction of movement
            const angle = Math.atan2(moveDir.x, moveDir.z);
            avatar.group.rotation.y = THREE.MathUtils.lerp(avatar.group.rotation.y, angle, 0.15);

            avatar.update(delta, true, 95);
          } else {
            avatar.update(delta, false);
            // Advance waypoint
            if (currentWaypointIdx < activeRoute.pathNodes.length - 1) {
              currentWaypointIdx++;
              setCurrentStepIndex(currentWaypointIdx);
              setStepsWalked((s) => s + 8);

              // Voice cue
              const step = activeRoute.steps[currentWaypointIdx];
              if (step && VoiceGuidanceService.isEnabled()) {
                VoiceGuidanceService.speak(step.instruction);
              }

              // Confetti on reaching platform
              if (currentWaypointIdx === activeRoute.pathNodes.length - 1) {
                confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
              }
            }
          }
        }
      } else {
        avatar.update(delta, false);
      }

      // Camera choreographies
      if (cameraMode === 'follow') {
        const targetCamPos = avatar.group.position.clone().add(new THREE.Vector3(0, 3.8, 6.5));
        camera.position.lerp(targetCamPos, 0.08);
        camera.lookAt(avatar.group.position.clone().add(new THREE.Vector3(0, 1.4, -2)));
      } else if (cameraMode === 'top') {
        camera.position.set(avatar.group.position.x, 22, avatar.group.position.z + 0.1);
        camera.lookAt(avatar.group.position.x, 0, avatar.group.position.z);
      } else if (cameraMode === 'cinema') {
        camera.position.set(12, 6, -15);
        camera.lookAt(avatar.group.position);
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
  }, [activeStationLayout, targetPlatformId, cameraMode, lineColor]);

  const toggleVoice = () => {
    const next = VoiceGuidanceService.toggle();
    setIsVoiceEnabled(next);
    if (next && activeRoute?.steps[currentStepIndex]) {
      VoiceGuidanceService.speak(activeRoute.steps[currentStepIndex].instruction);
    }
  };

  const handleSimulateStep = () => {
    pdrEngine.triggerSimulatedStep();
    setStepsWalked((s) => s + 1);
  };

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden select-none">
      {/* 3D Canvas Mount */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />

      {/* Top HUD: Step-by-Step Instruction Banner */}
      {activeRoute && activeRoute.steps[currentStepIndex] && (
        <div className="absolute top-4 left-4 right-4 z-20 max-w-xl mx-auto">
          <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 shadow-xl backdrop-blur-md flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md"
                style={{ backgroundColor: lineColor }}
              >
                <Compass className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Step {currentStepIndex + 1} of {activeRoute.steps.length} · Level {activeRoute.steps[currentStepIndex].level}
                </p>
                <p className="text-sm md:text-base font-bold text-white leading-tight">
                  {activeRoute.steps[currentStepIndex].instruction}
                </p>
              </div>
            </div>

            <button
              onClick={toggleVoice}
              className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border transition-colors ${
                isVoiceEnabled
                  ? 'bg-sky-500/20 border-sky-400 text-sky-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title={isVoiceEnabled ? 'Disable Voice Guidance' : 'Enable Voice Guidance'}
            >
              {isVoiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>
        </div>
      )}

      {/* Collapsible Bottom Control Dock (Adheres to Three.js Ergonomic Guidelines) */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 w-full max-w-lg px-4 pointer-events-auto">
        {/* Toggle Collapse Pill */}
        <div className="flex justify-center mb-1">
          <button
            onClick={() => setIsControlsCollapsed(!isControlsCollapsed)}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/90 border border-slate-700 rounded-full text-xs font-medium text-slate-300 hover:text-white backdrop-blur-md shadow-lg"
          >
            {isControlsCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>{isControlsCollapsed ? 'Show 3D Controls' : 'Hide Controls'}</span>
          </button>
        </div>

        {/* Control Dock Panel */}
        {!isControlsCollapsed && (
          <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-3 shadow-2xl backdrop-blur-md space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
              <span className="font-semibold text-slate-200">
                {activeStation?.name || 'Station Navigation'}
              </span>
              <span className="font-mono text-sky-400">
                {stepsWalked} steps · {activeRoute?.totalDistanceMeters || 120} m to train
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => setCameraMode('follow')}
                className={`py-2 px-2 text-xs font-medium rounded-xl flex items-center justify-center gap-1.5 transition-colors ${
                  cameraMode === 'follow' ? 'bg-sky-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Follow</span>
              </button>
              <button
                onClick={() => setCameraMode('top')}
                className={`py-2 px-2 text-xs font-medium rounded-xl flex items-center justify-center gap-1.5 transition-colors ${
                  cameraMode === 'top' ? 'bg-sky-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>Top-Down</span>
              </button>
              <button
                onClick={() => setCameraMode('cinema')}
                className={`py-2 px-2 text-xs font-medium rounded-xl flex items-center justify-center gap-1.5 transition-colors ${
                  cameraMode === 'cinema' ? 'bg-sky-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>Platform</span>
              </button>
              <button
                onClick={handleSimulateStep}
                className="py-2 px-2 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center justify-center gap-1 shadow-md active:scale-95 transition-all"
              >
                <Footprints className="w-3.5 h-3.5" />
                <span>Step +1</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
