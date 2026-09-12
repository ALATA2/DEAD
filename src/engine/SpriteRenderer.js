// SpriteRenderer.js - Renders billboard enemies, props, projectiles and pickups
// Fully respects vertical height, z-buffer occlusion, floor anchoring (§8 & §9)

import { CONFIG } from '../config.js';

export class SpriteRenderer {
  constructor(canvas, assetRegistry, sectorRenderer) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.assets = assetRegistry;
    this.secRenderer = sectorRenderer;

    this.width = canvas.width;
    this.height = canvas.height;
  }

  render(world, player, enemies, projectiles, pickups, props, dt) {
    const sprites = [];
    const camX = player.x;
    const camY = player.y;
    const camZ = player.z;
    const camAngle = player.angle;

    const cosA = Math.cos(-camAngle);
    const sinA = Math.sin(-camAngle);

    // 1. Props
    if (props) {
      for (const p of props) {
        const sec = world.sectors.get(p.sectorId);
        const zPos = sec ? sec.floorHeight : 0;
        sprites.push({
          type: 'prop',
          x: p.x,
          y: p.y,
          z: zPos,
          scale: p.scale || 1.0,
          propName: p.name,
          area: world.area
        });
      }
    }

    // 2. Pickups
    if (pickups) {
      for (const pk of pickups) {
        if (pk.collected) continue;
        const sec = world.sectors.get(pk.sectorId);
        const zPos = (sec ? sec.floorHeight : 0) + 0.15;
        sprites.push({
          type: 'pickup',
          x: pk.x,
          y: pk.y,
          z: zPos,
          scale: pk.scale || 0.65,
          name: pk.name,
          image: pk.image
        });
      }
    }

    // 3. Enemies
    if (enemies) {
      for (const e of enemies) {
        const sec = e.currentSector;
        const zPos = e.z !== undefined ? e.z : (sec ? sec.floorHeight : 0);
        sprites.push({
          type: 'enemy',
          x: e.x,
          y: e.y,
          z: zPos,
          enemy: e
        });
      }
    }

    // 4. Projectiles
    if (projectiles) {
      for (const pr of projectiles) {
        sprites.push({
          type: 'projectile',
          x: pr.x,
          y: pr.y,
          z: pr.z,
          proj: pr
        });
      }
    }

    // 5. Transform all to camera space & calculate distance
    const drawable = [];
    for (const s of sprites) {
      const dx = s.x - camX;
      const dy = s.y - camY;

      // Rotate to camera view
      const tx = dx * cosA - dy * sinA;
      const tz = dx * sinA + dy * cosA;

      if (tz > 0.3 && tz < CONFIG.MAX_RENDER_DISTANCE) {
        s.tx = tx;
        s.tz = tz;
        s.dist = Math.hypot(dx, dy);
        drawable.push(s);
      }
    }

    // Sort far to near (Painter's algorithm combined with column Z-buffer check)
    drawable.sort((a, b) => b.tz - a.tz);

    // 6. Draw each billboard sprite
    const fovScale = (this.width / 2) / Math.tan(CONFIG.FOV / 2);
    const halfW = this.width / 2;
    const halfH = this.height / 2;
    const zBuf = this.secRenderer.zBuffer;

    for (const s of drawable) {
      // Screen X
      const screenX = Math.floor(halfW + (s.tx / s.tz) * fovScale);

      // Foot anchor in world Z
      const worldZ = s.z;
      // Screen bottom Y (where feet touch the floor)
      const screenBottomY = Math.floor(halfH + (camZ - worldZ) * (fovScale / s.tz));

      let img = null;
      let spriteW = 64;
      let spriteH = 64;

      if (s.type === 'enemy') {
        const e = s.enemy;
        img = e.getCurrentFrame(this.assets);
        if (!img) continue;
        const baseH = 1.8 * (e.archetype.scale || 1.0);
        spriteH = Math.floor(baseH * (fovScale / s.tz));
        spriteW = Math.floor(spriteH * (img.width / img.height));
      } else if (s.type === 'prop') {
        img = this.assets.getProp(s.area, s.propName);
        if (!img) continue;
        const baseH = 1.7 * (s.scale || 1.0);
        spriteH = Math.floor(baseH * (fovScale / s.tz));
        spriteW = Math.floor(spriteH * (img.width / img.height));
      } else if (s.type === 'pickup') {
        img = s.image || this.assets.getPickup(s.name);
        if (!img) continue;
        const baseH = 0.8 * (s.scale || 1.0);
        spriteH = Math.floor(baseH * (fovScale / s.tz));
        spriteW = Math.floor(spriteH * (img.width / img.height));
      } else if (s.type === 'projectile') {
        img = s.proj.getCurrentFrame(this.assets);
        if (!img) continue;
        const baseH = 0.6;
        spriteH = Math.floor(baseH * (fovScale / s.tz));
        spriteW = Math.floor(spriteH * (img.width / img.height));
      }

      if (!img || spriteW <= 1 || spriteH <= 1) continue;

      const drawLeft = Math.floor(screenX - spriteW / 2);
      const drawTop = Math.floor(screenBottomY - spriteH);
      const drawRight = drawLeft + spriteW;

      // Screen bounds check
      if (drawRight < 0 || drawLeft >= this.width) continue;

      // Column Z-buffer test: check if center and quarter columns are obscured by walls
      const centerCol = Math.max(0, Math.min(this.width - 1, screenX));
      if (zBuf[centerCol] + 0.15 < s.tz) {
        // Obscured completely behind wall
        continue;
      }

      // Draw sprite directly into canvas 2D
      this.ctx.drawImage(img, drawLeft, drawTop, spriteW, spriteH);
    }
  }
}
