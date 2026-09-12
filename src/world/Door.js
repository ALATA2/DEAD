// Door.js - Vertical doors, root gates, iron gates, ossuary gates
// Follows requirements in §5: normalized progress 0..1, gradual height reveal, sound, lock/keys

import { sound } from '../engine/AudioManager.js';

export class Door {
  constructor(data) {
    this.id = data.id;
    this.edgeIndex = data.edgeIndex;
    this.type = data.type || 'cemetery_iron_gate'; // forest_root_gate, cemetery_iron_gate, crypt_vertical_door, catacomb_ossuary_gate
    this.state = data.locked ? 'locked' : (data.state || 'closed'); // closed, opening, open, closing, locked
    this.requiredKey = data.requiredKey || null; // 'blue_raven_key', 'orange_pumpkin_key', 'red_skull_key', 'purple_clock_key'
    this.progress = data.progress || 0.0; // 0 = fully closed, 1 = fully open
    this.speed = data.speed || 0.8; // progress units per sec
    this.autoCloseDelay = data.autoCloseDelay !== undefined ? data.autoCloseDelay : 4.0;
    this.openTimer = 0;
    this.linkedTrigger = data.linkedTrigger || null;
    this.isSecret = data.isSecret || false;
  }

  tryInteract(player) {
    if (this.state === 'open' || this.state === 'opening') return false;

    if (this.state === 'locked') {
      if (this.requiredKey && player.keys.has(this.requiredKey)) {
        this.state = 'opening';
        sound.playDoor(true);
        if (this.isSecret) sound.playSecretFound();
        return true;
      } else {
        // Locked sound / feedback
        sound.playImpact(false);
        return false;
      }
    }

    if (this.state === 'closed') {
      this.state = 'opening';
      sound.playDoor(true);
      if (this.isSecret) sound.playSecretFound();
      return true;
    }
    return false;
  }

  openRemotely() {
    this.state = 'opening';
    sound.playDoor(true);
    if (this.isSecret) sound.playSecretFound();
  }

  update(dt) {
    if (this.state === 'opening') {
      this.progress += this.speed * dt;
      if (this.progress >= 1.0) {
        this.progress = 1.0;
        this.state = 'open';
        this.openTimer = 0;
      }
    } else if (this.state === 'open') {
      if (this.autoCloseDelay > 0) {
        this.openTimer += dt;
        if (this.openTimer >= this.autoCloseDelay) {
          this.state = 'closing';
          sound.playDoor(false);
        }
      }
    } else if (this.state === 'closing') {
      this.progress -= this.speed * dt;
      if (this.progress <= 0.0) {
        this.progress = 0.0;
        this.state = 'closed';
      }
    }
  }

  isOpen() {
    return this.progress >= 0.85;
  }

  blocksMovement() {
    return this.progress < 0.7;
  }

  blocksSight() {
    return this.progress < 0.95;
  }
}
