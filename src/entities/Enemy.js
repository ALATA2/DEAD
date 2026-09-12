// Enemy.js - Billboard enemy with full AI state machine, animation timing, attack cycles, and death corpses (§8)

import { ENEMY_ARCHETYPES, CONFIG } from '../config.js';
import { sound } from '../engine/AudioManager.js';

export class Enemy {
  constructor(data) {
    this.id = data.id || `enemy_${Math.random().toString(36).substr(2, 9)}`;
    this.name = data.type; // e.g. 'werewolf', 'pumpkin_king'
    this.archetype = ENEMY_ARCHETYPES[this.name] || ENEMY_ARCHETYPES.werewolf;

    this.x = data.x;
    this.y = data.y;
    this.sectorId = data.sectorId;
    this.currentSector = null;
    this.z = 0;

    this.hp = this.archetype.hp;
    this.maxHp = this.archetype.hp;
    this.speed = this.archetype.speed;
    this.state = 'idle'; // 'idle', 'chase', 'attack', 'dead'

    // Animation frames and timing
    this.movementFrame = 1;
    this.animTimer = 0;
    this.attackTimer = 0;
    this.deathFrame = 1;
    this.deathTimer = 0;

    this.cooldown = 0;
    this.targetPlayer = null;
    this.radius = this.archetype.radius || 0.4;
  }

  getCurrentFrame(assets) {
    if (this.state === 'dead') {
      return assets.getEnemyFrame(this.name, 'death', this.deathFrame);
    } else if (this.state === 'attack') {
      return assets.getEnemyFrame(this.name, 'attack', 1);
    } else {
      return assets.getEnemyFrame(this.name, 'movement', this.movementFrame);
    }
  }

  takeDamage(amount, world, player) {
    if (this.state === 'dead') return;

    this.hp -= amount;
    this.state = 'chase'; // Alert on damage
    sound.playImpact(true);

    if (this.hp <= 0) {
      this.hp = 0;
      this.state = 'dead';
      this.deathFrame = 1;
      this.deathTimer = 0.2;
      sound.playMonsterRoar(this.archetype.isBoss);

      // If boss, trigger victory face or events
      if (this.archetype.isBoss) {
        player.setFaceState('11_victory', 3.0);
        // Check triggers
        if (world.triggers) {
          for (const t of world.triggers) {
            if (t.type === 'boss_defeat') t.execute(world);
          }
        }
      }
    }
  }

  update(dt, player, world, spawnProjectileFn) {
    // Current sector and feet anchor (§8)
    if (!this.currentSector || !this.currentSector.containsPoint(this.x, this.y)) {
      for (const sec of world.sectors.values()) {
        if (sec.containsPoint(this.x, this.y)) {
          this.currentSector = sec;
          break;
        }
      }
    }

    if (this.currentSector) {
      this.z = this.currentSector.floorHeight;
    }

    // Death sequence
    if (this.state === 'dead') {
      if (this.deathTimer > 0) {
        this.deathTimer -= dt;
        if (this.deathTimer <= 0 && this.deathFrame === 1) {
          this.deathFrame = 2; // permanently stay as corpse on floor
        }
      }
      return;
    }

    // Distance to player
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.hypot(dx, dy);

    if (this.cooldown > 0) {
      this.cooldown -= dt;
    }

    // AI state machine
    if (dist < 18.0 && this.state === 'idle') {
      this.state = 'chase';
      sound.playMonsterRoar(this.archetype.isBoss);
    }

    if (this.state === 'chase') {
      // Walk animation ~8 FPS
      this.animTimer += dt;
      if (this.animTimer >= 0.125) {
        this.animTimer = 0;
        this.movementFrame = (this.movementFrame % 5) + 1;
      }

      // Check attack range
      if (dist <= this.archetype.attackRange && this.cooldown <= 0) {
        this.state = 'attack';
        this.attackTimer = 0.55;
        this.executeAttack(player, spawnProjectileFn);
      } else if (dist > 1.2) {
        // Move towards player
        const moveStep = this.speed * dt;
        const targetX = this.x + (dx / dist) * moveStep;
        const targetY = this.y + (dy / dist) * moveStep;

        // Check if destination sector exists and elevation is walkable
        let canMove = true;
        let newSec = null;
        for (const sec of world.sectors.values()) {
          if (sec.containsPoint(targetX, targetY)) {
            newSec = sec;
            break;
          }
        }

        if (newSec && this.currentSector) {
          const diff = Math.abs(newSec.floorHeight - this.currentSector.floorHeight);
          // Non-flying enemies cannot scale impassable cliffs (§8)
          if (!this.archetype.flying && diff > 0.6) {
            canMove = false;
          }
          // Cannot pass closed doors
          for (const edge of this.currentSector.edges) {
            if (edge.neighborSectorId === newSec.id && edge.doorId) {
              const d = world.doors.get(edge.doorId);
              if (d && d.blocksMovement()) canMove = false;
            }
          }
        } else if (!newSec) {
          canMove = false;
        }

        if (canMove) {
          this.x = targetX;
          this.y = targetY;
          if (newSec) this.currentSector = newSec;
        }
      }
    } else if (this.state === 'attack') {
      this.attackTimer -= dt;
      if (this.attackTimer <= 0) {
        this.state = 'chase';
        this.cooldown = this.archetype.cooldown || 1.4;
      }
    }
  }

  executeAttack(player, spawnProjectileFn) {
    if (this.archetype.isRanged && spawnProjectileFn) {
      // Spawn projectile with 3D Z coordinate
      const projType = this.archetype.projectile || 'bullet';
      const pz = (this.currentSector ? this.currentSector.floorHeight : 0) + 1.2;
      const angle = Math.atan2(player.y - this.y, player.x - this.x);
      spawnProjectileFn(this.x, this.y, pz, angle, projType, this.archetype.damage, false);
    } else {
      // Melee attack
      const dist = Math.hypot(player.x - this.x, player.y - this.y);
      if (dist <= this.archetype.attackRange + 0.3) {
        player.takeDamage(this.archetype.damage);
      }
    }
  }
}
