/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

// Create procedural tile floor texture
export function createFloorTileTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#E2E8F0';
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, 128, 128);
  ctx.strokeRect(128, 0, 128, 128);
  ctx.strokeRect(0, 128, 128, 128);
  ctx.strokeRect(128, 128, 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 16);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Yellow tactile caution strip for platform edges
export function createPlatformEdgeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#EAB308'; // Bright safety yellow
  ctx.fillRect(0, 0, 128, 64);

  // Black hazard stripes
  ctx.fillStyle = '#18181B';
  for (let x = -64; x < 192; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 16, 0);
    ctx.lineTo(x + 32, 64);
    ctx.lineTo(x + 16, 64);
    ctx.closePath();
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(12, 1);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Procedural LED Electronic Platform Display Board (PIDS)
export function createPIDSTexture(destination: string, etaMinutes: number, platform: string, lineColor: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#09090B';
  ctx.fillRect(0, 0, 512, 128);

  // Line color header stripe
  ctx.fillStyle = lineColor;
  ctx.fillRect(0, 0, 512, 12);

  // Border frame
  ctx.strokeStyle = '#27272A';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, 508, 124);

  // Platform label
  ctx.font = 'bold 22px monospace';
  ctx.fillStyle = '#F59E0B'; // Amber LED
  ctx.fillText(platform.toUpperCase(), 16, 44);

  // Train destination
  ctx.font = 'bold 28px sans-serif';
  ctx.fillStyle = '#FAFAFA';
  ctx.fillText(`Towards ${destination}`, 16, 84);

  // ETA Countdown
  ctx.font = 'bold 32px monospace';
  ctx.fillStyle = etaMinutes <= 1 ? '#EF4444' : '#22C55E';
  ctx.fillText(etaMinutes <= 0 ? 'ARRIVING' : `${etaMinutes} MIN`, 340, 84);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Procedural Signage Board
export function createSignageTexture(title: string, subtitle: string, bgColor: string, textColor: string = '#FFFFFF'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 512, 128);

  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 3;
  ctx.strokeRect(6, 6, 500, 116);

  ctx.font = 'bold 34px sans-serif';
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.fillText(title, 256, 55);

  ctx.font = '22px sans-serif';
  ctx.fillStyle = textColor;
  ctx.fillText(subtitle, 256, 95);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
