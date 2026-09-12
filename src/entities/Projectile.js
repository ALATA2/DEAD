// Projectile.js - 3D Projectile physics with Z coordinate, collision against floors/ceilings/walls, and impact FX (§9)

import { sound } from '../engine/AudioManager.js';

export class Projectile {
  constructor(x, y, z, angle, type, damage, isPlayer, targetZ = null) {
    this.x = x;
    this.y = y;
    this.z = z; // 3D height
    this.angle = angle;
    this.type = type; // 'bullet', 'acid_orb', 'pumpkin_fireball', etc.
    this.damage = damage;
    this.isPlayer = isPlayer;

    this.speed = 12.0;
    this.vx = Math.cos(angle) * this.speed;
    this.vy = Math.sin(angle) * this.speed;
    this.vz = targetZ !== null ? (targetZ - z) * 0.5 : 0.0;

    this.animFrame = 1;
    this.animTimer = 0;
    this.alive = true;
    this.lifeTime = 4.0;
  }

  getCurrentFrame(assets) {
    return assets.getProjectileFrame(this.type, this.animFrame);
  }

  update(dt, world, player, enemies) {
    if (!this.alive) return;

    this.lifeTime -= dt;
    if (this.lifeTime <= 0) {
      this.alive = false;
      return;
    }

    // 10-12 FPS frame cycle
    this.animTimer += dt;
    if (this.animTimer >= 0.09) {
      this.animTimer = 0;
      this.animFrame = (this.animFrame % 3) + 1;
    }

    const nextX = this.x + this.vx * dt;
    const nextY = this.y + this.vy * dt;
    const nextZ = this.z + this.vz * dt;

    // Find current sector
    let sector = null;
    for (const sec of world.sectors.values()) {
      if (sec.containsPoint(nextX, nextY)) {
        sector = sec;
        break;
      }
    }

    if (!sector) {
      // Hit outer wall
      this.impact(false);
      return;
    }

    // Check floor / ceiling collision
    if (nextZ <= sector.floorHeight || nextZ >= sector.ceilingHeight) {
      this.impact(false);
      return;
    }

    // Check closed doors
    for (const edge of sector.edges) {
      if (edge.doorId) {
        const d = world.doors.get(edge.doorId);
        if (d && d.blocksMovement()) {
          // Check line intersection with door segment
          if (this._lineIntersect(this.x, this.y, nextX, nextY, edge.x1, edge.y1, edge.x2, edge.y2)) {
            this.impact(false);
            return;
          }
        }
      }
    }

    // Entity collisions
    if (this.isPlayer) {
      for (const e of enemies) {
        if (e.state === 'dead') continue;
        const dist = Math.hypot(e.x - nextX, e.y - nextY);
        if (dist <= e.radius + 0.25) {
          const ez = e.z;
          if (nextZ >= ez && nextZ <= ez + 2.0) {
            e.takeDamage(this.damage, world, player);
            this.impact(true);
            return;
          }
        }
      }
    } else {
      // Enemy projectile hitting player
      const dist = Math.hypot(player.x - nextX, player.y - nextY);
      if (dist <= 0.45) {
        if (nextZ >= player.z - 1.6 && nextZ <= player.z + 0.4) {
          player.takeDamage(this.damage);
          this.impact(true);
          return;
        }
      }
    }

    this.x = nextX;
    this.y = nextY;
    this.z = nextZ;
  }

  impact(isFlesh) {
    this.alive = false;
    sound.playImpact(isFlesh);
  }

  _lineIntersect(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y) {
    const s1x = p1x - p0x;
    const s1y = p1y - p0y;
    const s2x = p3x - p2x;
    const s2y = p3y - p2y;

    const s = (-s1y * (p0x - p2x) + s1x * (p0y - p2y)) / (-s2x * s1y + s1x * s2y);
    const t = ( s2x * (p0y - p2y) - s2y * (p0x - p2x)) / (-s2x * s1y + s1x * s2y);

    return (s >= 0 && s <= 1 && t >= 0 && t <= 1);
  }
}
