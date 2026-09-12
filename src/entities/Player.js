// Player.js - Player controller, inventory, health/armor, stair climbing, smooth camera Z

import { CONFIG, WEAPONS } from '../config.js';
import { sound } from '../engine/AudioManager.js';

export class Player {
  constructor(startData) {
    this.x = startData.x || 0;
    this.y = startData.y || 0;
    this.z = 1.6; // camera eye height in world coordinates
    this.angle = startData.angle || 0;
    this.currentSectorId = startData.sectorId || null;
    this.currentSector = null;

    this.vx = 0;
    this.vy = 0;
    this.vz = 0;

    this.health = 100;
    this.maxHealth = 100;
    this.armor = 25;
    this.maxArmor = 100;

    // Weapons inventory: slot 0: axe, slot 1: pistol, etc.
    this.weapons = ['axe', 'pistol'];
    this.currentWeaponIndex = 1; // Start with pistol
    this.ammo = {
      bullets: 40,
      shells: 8,
      cells: 0
    };
    this.maxAmmo = {
      bullets: 200,
      shells: 50,
      cells: 100
    };

    // Keys collected
    this.keys = new Set(); // 'blue_raven_key', 'orange_pumpkin_key', 'red_skull_key', 'purple_clock_key'

    // Status
    this.isDead = false;
    this.attackCooldown = 0;
    this.recoilAnim = 0;
    this.painTimer = 0;
    this.faceState = '01_idle';
    this.faceTimer = 0;

    this.footstepTimer = 0;
  }

  getCurrentWeapon() {
    const wId = this.weapons[this.currentWeaponIndex];
    return WEAPONS[wId] || WEAPONS.pistol;
  }

  switchWeapon(index) {
    if (index >= 0 && index < this.weapons.length && index !== this.currentWeaponIndex) {
      this.currentWeaponIndex = index;
      sound.playPickup('weapon');
    }
  }

  giveWeapon(weaponId) {
    if (!this.weapons.includes(weaponId)) {
      this.weapons.push(weaponId);
      this.currentWeaponIndex = this.weapons.length - 1;
      sound.playPickup('weapon');
      return true;
    }
    return false;
  }

  giveKey(keyId) {
    this.keys.add(keyId);
    sound.playPickup('key');
  }

  giveHealth(amount) {
    if (this.health >= this.maxHealth) return false;
    this.health = Math.min(this.maxHealth, this.health + amount);
    sound.playPickup('health');
    return true;
  }

  giveArmor(amount) {
    if (this.armor >= this.maxArmor) return false;
    this.armor = Math.min(this.maxArmor, this.armor + amount);
    sound.playPickup('health');
    return true;
  }

  giveAmmo(type, amount) {
    if (this.ammo[type] !== undefined) {
      if (this.ammo[type] >= this.maxAmmo[type]) return false;
      this.ammo[type] = Math.min(this.maxAmmo[type], this.ammo[type] + amount);
      sound.playPickup('ammo');
      return true;
    }
    return false;
  }

  takeDamage(amount) {
    if (this.isDead || this.godMode) return;

    sound.playPlayerPain();
    this.painTimer = 0.35;
    this.setFaceState(Math.random() < 0.5 ? '06_damage_left' : '07_damage_right', 0.6);

    // Armor absorbs 60% of damage
    if (this.armor > 0) {
      const absorbed = Math.min(this.armor, amount * 0.6);
      this.armor -= absorbed;
      amount -= absorbed;
    }

    this.health -= amount;
    if (this.health <= 0) {
      this.health = 0;
      this.isDead = true;
      this.setFaceState('12_dead', 9999);
    }
  }

  setFaceState(state, duration = 1.0) {
    this.faceState = state;
    this.faceTimer = duration;
  }

  update(dt, input, world) {
    if (this.isDead) return;

    // God mode cheat toggle (G / I)
    if (input.godModeToggle) {
      this.godMode = !this.godMode;
      if (this.godMode) {
        sound.playSecretFound();
        this.setFaceState('10_halloween_powerup', 2.5);
      } else {
        sound.playImpact(false);
      }
    }

    // Weapon attack cooldown & recoil
    if (this.attackCooldown > 0) {
      this.attackCooldown -= dt;
    }
    if (this.recoilAnim > 0) {
      this.recoilAnim = Math.max(0, this.recoilAnim - dt * 3.5);
    }

    // Weapon switching input
    if (input.changeWeaponIndex !== null && input.changeWeaponIndex < this.weapons.length) {
      this.switchWeapon(input.changeWeaponIndex);
    }
    if (input.weaponCycle) {
      let next = this.currentWeaponIndex + input.weaponCycle;
      if (next < 0) next = this.weapons.length - 1;
      if (next >= this.weapons.length) next = 0;
      this.switchWeapon(next);
    }

    // Rotation from mouse & keyboard (Standard FPS: moving mouse right rotates view clockwise)
    const turnSpeed = 2.4;
    if (input.isTurnLeft()) this.angle -= turnSpeed * dt;
    if (input.isTurnRight()) this.angle += turnSpeed * dt;

    if (input.mouseDeltaX !== 0) {
      this.angle += input.mouseDeltaX * CONFIG.MOUSE_SENSITIVITY;
    }
    if (input.touchLookDeltaX !== 0) {
      this.angle += input.touchLookDeltaX * 0.004;
    }

    // Movement direction
    let moveX = 0;
    let moveY = 0;

    const forward = input.isForward();
    const backward = input.isBackward();
    const strafeL = input.isStrafeLeft();
    const strafeR = input.isStrafeRight();

    // Camera forward vector from SectorRenderer:
    // When angle = 0, camera faces +Y (dx=0, dy=+1 => tz = +1)
    // Camera right vector: dx = +1, dy = 0 => tx = +1
    const forwardX = -Math.sin(this.angle);
    const forwardY = Math.cos(this.angle);
    const rightX = Math.cos(this.angle);
    const rightY = Math.sin(this.angle);

    if (forward) {
      moveX += forwardX;
      moveY += forwardY;
    }
    if (backward) {
      moveX -= forwardX;
      moveY -= forwardY;
    }
    if (strafeL) {
      moveX -= rightX;
      moveY -= rightY;
    }
    if (strafeR) {
      moveX += rightX;
      moveY += rightY;
    }

    const moveMag = Math.hypot(moveX, moveY);
    const speed = input.runPressed ? CONFIG.RUN_SPEED : CONFIG.MOVE_SPEED;

    if (moveMag > 0.01) {
      moveX = (moveX / moveMag) * speed;
      moveY = (moveY / moveMag) * speed;
      this.vx = moveX;
      this.vy = moveY;

      this.footstepTimer += dt * (input.runPressed ? 1.5 : 1.0);
      if (this.footstepTimer >= 0.42) {
        this.footstepTimer = 0;
      }
    } else {
      this.vx = 0;
      this.vy = 0;
    }

    // Resolve 2D sector collision & step climbing (§3)
    this._moveAndCollide(this.vx * dt, this.vy * dt, world);

    // Smooth camera Z interpolation onto current sector floor
    if (this.currentSector) {
      const targetZ = this.currentSector.floorHeight + CONFIG.EYE_HEIGHT;
      // Exponential smooth damp
      this.z += (targetZ - this.z) * Math.min(1.0, dt * 14.0);
    }

    // Interaction key (E) check for doors and switches
    if (input.interactPressed) {
      this._checkInteraction(world);
    }
  }

  _moveAndCollide(dx, dy, world) {
    const newX = this.x + dx;
    const newY = this.y + dy;

    // Check sector at new position
    let targetSector = null;
    if (this.currentSector && this.currentSector.containsPoint(newX, newY)) {
      targetSector = this.currentSector;
    } else {
      // Find sector in map
      for (const sec of world.sectors.values()) {
        if (sec.containsPoint(newX, newY)) {
          targetSector = sec;
          break;
        }
      }
    }

    if (!targetSector) {
      // Out of bounds / wall collision
      return;
    }

    // If crossing into new sector, verify height difference (stairs vs wall)
    if (targetSector !== this.currentSector && this.currentSector) {
      const heightDiff = targetSector.floorHeight - this.currentSector.floorHeight;
      if (heightDiff > CONFIG.STEP_MAX_HEIGHT) {
        // Step is too high! Block movement
        return;
      }

      // Check if crossing a closed door
      for (const edge of this.currentSector.edges) {
        if (edge.neighborSectorId === targetSector.id && edge.doorId) {
          const door = world.doors.get(edge.doorId);
          if (door && door.blocksMovement()) {
            return; // Door is shut
          }
        }
      }
    }

    this.x = newX;
    this.y = newY;
    this.currentSector = targetSector;
    this.currentSectorId = targetSector.id;
  }

  _checkInteraction(world) {
    // 1. Check doors in current sector edges
    if (this.currentSector && world.doors) {
      for (const edge of this.currentSector.edges) {
        if (edge.doorId) {
          const d = world.doors.get(edge.doorId);
          if (d) {
            // Check distance to edge midpoint
            const midX = (edge.x1 + edge.x2) / 2;
            const midY = (edge.y1 + edge.y2) / 2;
            if (Math.hypot(this.x - midX, this.y - midY) <= 2.2) {
              d.tryInteract(this);
            }
          }
        }
      }
    }

    // 2. Check interactive triggers / switches
    if (world.triggers) {
      for (const t of world.triggers) {
        t.interact(this, world);
      }
    }
  }
}
