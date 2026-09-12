// Lift.js - Moving platforms, elevators, ritual lifts
// Elevates/lowers sector floorHeight smoothly carrying player and enemies

import { sound } from '../engine/AudioManager.js';

export class Lift {
  constructor(data, sector) {
    this.id = data.id;
    this.sectorId = data.sectorId;
    this.sector = sector;
    this.bottomHeight = data.bottomHeight;
    this.topHeight = data.topHeight;
    this.speed = data.speed || 1.2;
    this.state = data.state || 'down'; // 'down', 'moving_up', 'up', 'moving_down'
    this.waitDelay = data.waitDelay !== undefined ? data.waitDelay : 3.0;
    this.waitTimer = 0;
    this.activated = data.autoStart || false;
  }

  trigger() {
    if (this.state === 'down') {
      this.state = 'moving_up';
      sound.playLift();
    } else if (this.state === 'up') {
      this.state = 'moving_down';
      sound.playLift();
    }
  }

  update(dt, player, enemies) {
    if (!this.sector) return;

    if (this.state === 'moving_up') {
      this.sector.floorHeight += this.speed * dt;
      if (this.sector.floorHeight >= this.topHeight) {
        this.sector.floorHeight = this.topHeight;
        this.state = 'up';
        this.waitTimer = 0;
      }
    } else if (this.state === 'up') {
      if (this.waitDelay > 0) {
        this.waitTimer += dt;
        if (this.waitTimer >= this.waitDelay) {
          this.state = 'moving_down';
          sound.playLift();
        }
      }
    } else if (this.state === 'moving_down') {
      this.sector.floorHeight -= this.speed * dt;
      if (this.sector.floorHeight <= this.bottomHeight) {
        this.sector.floorHeight = this.bottomHeight;
        this.state = 'down';
        this.waitTimer = 0;
      }
    } else if (this.state === 'down') {
      // If player steps on lift and it's down, auto-trigger after tiny pause
      if (player && player.currentSectorId === this.sectorId) {
        this.waitTimer += dt;
        if (this.waitTimer > 0.4) {
          this.state = 'moving_up';
          this.waitTimer = 0;
          sound.playLift();
        }
      } else {
        this.waitTimer = 0;
      }
    }
  }
}
