// Weapons.js - Handles player weapon mechanics, raycasting hitscans, projectile launching, recoil & screen bob

import { WEAPONS } from '../config.js';
import { sound } from '../engine/AudioManager.js';

export class WeaponSystem {
  constructor(player) {
    this.player = player;
  }

  tryFire(world, enemies, spawnProjectileFn) {
    const player = this.player;
    if (player.isDead || player.attackCooldown > 0) return false;

    const weapon = player.getCurrentWeapon();

    // Check ammo
    if (weapon.ammoType) {
      if (player.ammo[weapon.ammoType] < weapon.cost) {
        // Out of ammo sound
        sound.playImpact(false);
        player.attackCooldown = 0.3;
        return false;
      }
      player.ammo[weapon.ammoType] -= weapon.cost;
    }

    // Set cooldown & face attack state
    player.attackCooldown = weapon.cooldown;
    player.recoilAnim = 1.0;
    player.setFaceState('05_attack', 0.35);

    // Audio & firing logic
    if (weapon.id === 'axe') {
      sound.playAxeSwing();
      this._meleeAttack(weapon, enemies, world);
    } else if (weapon.id === 'pistol') {
      sound.playPistol();
      this._hitscanAttack(weapon, 1, enemies, world);
    } else if (weapon.id === 'shotgun') {
      sound.playShotgun(false);
      this._hitscanAttack(weapon, weapon.pellets, enemies, world);
    } else if (weapon.id === 'double_barrel') {
      sound.playShotgun(true);
      this._hitscanAttack(weapon, weapon.pellets, enemies, world);
    } else if (weapon.id === 'crossbow') {
      sound.playCrossbow();
      if (spawnProjectileFn) {
        const fireAngle = Math.atan2(Math.cos(player.angle), -Math.sin(player.angle));
        spawnProjectileFn(
          player.x - Math.sin(player.angle) * 0.4,
          player.y + Math.cos(player.angle) * 0.4,
          player.z - 0.2,
          fireAngle,
          weapon.projectile || 'bullet',
          weapon.damage,
          true
        );
      }
    }
    return true;
  }

  _meleeAttack(weapon, enemies, world) {
    const p = this.player;
    const forwardX = -Math.sin(p.angle);
    const forwardY = Math.cos(p.angle);

    for (const e of enemies) {
      if (e.state === 'dead') continue;
      const dx = e.x - p.x;
      const dy = e.y - p.y;
      const dist = Math.hypot(dx, dy);

      if (dist <= weapon.range) {
        // Dot product with forward vector
        const dot = (dx * forwardX + dy * forwardY) / (dist || 1);
        if (dot > 0.6) {
          e.takeDamage(weapon.damage, world, p);
          return;
        }
      }
    }
  }

  _hitscanAttack(weapon, count, enemies, world) {
    const p = this.player;
    const forwardAngle = Math.atan2(Math.cos(p.angle), -Math.sin(p.angle));

    for (let i = 0; i < count; i++) {
      const spread = (Math.random() - 0.5) * (weapon.spread || 0.0);
      const rayAngle = forwardAngle + spread;
      const dirX = Math.cos(rayAngle);
      const dirY = Math.sin(rayAngle);

      let closestEnemy = null;
      let closestDist = weapon.range || 30;

      // Raycast against all alive enemies
      for (const e of enemies) {
        if (e.state === 'dead') continue;

        const dx = e.x - p.x;
        const dy = e.y - p.y;
        const proj = dx * dirX + dy * dirY; // distance along ray

        if (proj > 0.4 && proj < closestDist) {
          const perpDist = Math.abs(dx * dirY - dy * dirX);
          if (perpDist <= e.radius + 0.15) {
            // Check vertical height
            const ez = e.z;
            if (p.z >= ez - 0.5 && p.z <= ez + 2.5) {
              closestEnemy = e;
              closestDist = proj;
            }
          }
        }
      }

      if (closestEnemy) {
        closestEnemy.takeDamage(weapon.damage, world, p);
      }
    }
  }
}
