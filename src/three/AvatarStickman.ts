/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

export class AvatarStickman {
  public group: THREE.Group;

  private head: THREE.Mesh;
  private torso: THREE.Mesh;
  private backpack: THREE.Mesh;

  private leftArm: THREE.Group;
  private rightArm: THREE.Group;
  private leftLeg: THREE.Group;
  private rightLeg: THREE.Group;

  private walkCyclePhase = 0;

  constructor(lineColor: string = '#0284C7') {
    this.group = new THREE.Group();

    // Body Material (Clean modern commuter avatar)
    const bodyMat = new THREE.MeshStandardMaterial({
      color: '#0F172A',
      roughness: 0.3,
      metalness: 0.2,
    });

    const skinMat = new THREE.MeshStandardMaterial({
      color: '#F8FAFC',
      roughness: 0.4,
    });

    const accentMat = new THREE.MeshStandardMaterial({
      color: lineColor,
      roughness: 0.3,
      metalness: 0.3,
    });

    // 1. Head (Sphere + visor)
    const headGeo = new THREE.SphereGeometry(0.22, 16, 16);
    this.head = new THREE.Mesh(headGeo, skinMat);
    this.head.position.y = 1.62;
    this.head.castShadow = true;
    this.group.add(this.head);

    // Subtle headphones / commuter visor
    const visorGeo = new THREE.BoxGeometry(0.26, 0.08, 0.12);
    const visor = new THREE.Mesh(visorGeo, accentMat);
    visor.position.set(0, 0.02, 0.16);
    this.head.add(visor);

    // 2. Torso
    const torsoGeo = new THREE.CylinderGeometry(0.18, 0.15, 0.65, 12);
    this.torso = new THREE.Mesh(torsoGeo, bodyMat);
    this.torso.position.y = 1.15;
    this.torso.castShadow = true;
    this.group.add(this.torso);

    // Commuter Backpack with metro line color accent
    const backpackGeo = new THREE.BoxGeometry(0.26, 0.36, 0.16);
    this.backpack = new THREE.Mesh(backpackGeo, accentMat);
    this.backpack.position.set(0, 1.2, -0.16);
    this.backpack.castShadow = true;
    this.group.add(this.backpack);

    // Helper to create articulated limb group
    const createLimb = (isLeg: boolean) => {
      const limbGroup = new THREE.Group();
      const length = isLeg ? 0.68 : 0.52;
      const radius = isLeg ? 0.07 : 0.05;

      const upperGeo = new THREE.CapsuleGeometry(radius, length * 0.45, 6, 8);
      const upper = new THREE.Mesh(upperGeo, bodyMat);
      upper.position.y = -length * 0.25;
      upper.castShadow = true;
      limbGroup.add(upper);

      const lowerGroup = new THREE.Group();
      lowerGroup.position.y = -length * 0.5;

      const lowerGeo = new THREE.CapsuleGeometry(radius * 0.9, length * 0.45, 6, 8);
      const lower = new THREE.Mesh(lowerGeo, bodyMat);
      lower.position.y = -length * 0.25;
      lower.castShadow = true;
      lowerGroup.add(lower);

      limbGroup.add(lowerGroup);
      return { root: limbGroup, lower: lowerGroup };
    };

    // 3. Arms
    const lArm = createLimb(false);
    this.leftArm = lArm.root;
    this.leftArm.position.set(-0.25, 1.42, 0);
    this.group.add(this.leftArm);

    const rArm = createLimb(false);
    this.rightArm = rArm.root;
    this.rightArm.position.set(0.25, 1.42, 0);
    this.group.add(this.rightArm);

    // 4. Legs
    const lLeg = createLimb(true);
    this.leftLeg = lLeg.root;
    this.leftLeg.position.set(-0.12, 0.85, 0);
    this.group.add(this.leftLeg);

    const rLeg = createLimb(true);
    this.rightLeg = rLeg.root;
    this.rightLeg.position.set(0.12, 0.85, 0);
    this.group.add(this.rightLeg);
  }

  // Update procedural kinematics matching user step cadence & motion state
  update(deltaTime: number, isMoving: boolean, cadence: number = 90, isSitting: boolean = false) {
    if (isSitting) {
      // Sitting pose inside train carriage
      this.torso.position.y = 0.9;
      this.head.position.y = 1.35;
      this.backpack.position.set(0, 0.95, -0.16);

      this.leftLeg.position.y = 0.65;
      this.rightLeg.position.y = 0.65;
      this.leftLeg.rotation.x = Math.PI / 2.2;
      this.rightLeg.rotation.x = Math.PI / 2.2;
      this.leftArm.rotation.x = 0.3;
      this.rightArm.rotation.x = 0.3;
      return;
    }

    if (isMoving) {
      // Calculate cycle frequency based on cadence (steps per minute)
      const freq = (cadence / 60) * Math.PI * 2;
      this.walkCyclePhase += deltaTime * freq;

      const legAngle = Math.sin(this.walkCyclePhase) * 0.65;
      const armAngle = -Math.sin(this.walkCyclePhase) * 0.55;

      this.leftLeg.rotation.x = legAngle;
      this.rightLeg.rotation.x = -legAngle;

      this.leftArm.rotation.x = armAngle;
      this.rightArm.rotation.x = -armAngle;

      // Vertical bounce
      this.torso.position.y = 1.15 + Math.abs(Math.sin(this.walkCyclePhase)) * 0.04;
      this.head.position.y = 1.62 + Math.abs(Math.sin(this.walkCyclePhase)) * 0.04;
      this.backpack.position.y = 1.2 + Math.abs(Math.sin(this.walkCyclePhase)) * 0.04;
    } else {
      // Subtle idle breathing animation
      this.walkCyclePhase += deltaTime * 2;
      const idleBob = Math.sin(this.walkCyclePhase) * 0.015;

      this.torso.position.y = 1.15 + idleBob;
      this.head.position.y = 1.62 + idleBob;
      this.leftLeg.rotation.x = THREE.MathUtils.lerp(this.leftLeg.rotation.x, 0, 0.1);
      this.rightLeg.rotation.x = THREE.MathUtils.lerp(this.rightLeg.rotation.x, 0, 0.1);
      this.leftArm.rotation.x = THREE.MathUtils.lerp(this.leftArm.rotation.x, 0, 0.1);
      this.rightArm.rotation.x = THREE.MathUtils.lerp(this.rightArm.rotation.x, 0, 0.1);
    }
  }

  setAccentColor(color: string) {
    const mat = this.backpack.material as THREE.MeshStandardMaterial;
    if (mat) mat.color.set(color);
  }
}
