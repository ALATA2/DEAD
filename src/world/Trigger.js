// Trigger.js - Switches, Levers, Pressure Plates, Traps, Monster Closets, and Boss Arenas

import { sound } from '../engine/AudioManager.js';

export class Trigger {
  constructor(data) {
    this.id = data.id;
    this.type = data.type; // 'switch', 'pressure_plate', 'kill_all', 'boss_defeat', 'pickup'
    this.x = data.x ?? 0;
    this.y = data.y ?? 0;
    this.radius = data.radius ?? 0.8;
    this.targetDoorId = data.targetDoorId ?? null;
    this.targetLiftId = data.targetLiftId ?? null;
    this.targetSectorId = data.targetSectorId ?? null;
    this.action = data.action ?? 'open_door'; // 'open_door', 'move_lift', 'lower_floor', 'spawn_closet'
    this.spawnEntities = data.spawnEntities ?? null;
    this.activated = false;
    this.once = data.once !== undefined ? data.once : true;
    this.texture = data.texture ?? null; // e.g., 'lever', 'pressure_plate'
  }

  checkPlayer(player, world) {
    if (this.activated && this.once) return;

    if (this.type === 'pressure_plate') {
      const dx = player.x - this.x;
      const dy = player.y - this.y;
      if (dx * dx + dy * dy <= this.radius * this.radius) {
        this.execute(world);
      }
    }
  }

  interact(player, world) {
    if (this.activated && this.once) return false;

    if (this.type === 'switch') {
      const dx = player.x - this.x;
      const dy = player.y - this.y;
      if (dx * dx + dy * dy <= 1.8 * 1.8) {
        this.execute(world);
        return true;
      }
    }
    return false;
  }

  execute(world) {
    this.activated = true;
    sound.playDoor(true);

    if (this.targetDoorId && world.doors) {
      const d = world.doors.get(this.targetDoorId);
      if (d) d.openRemotely();
    }

    if (this.targetLiftId && world.lifts) {
      const l = world.lifts.get(this.targetLiftId);
      if (l) l.trigger();
    }

    if (this.targetSectorId && world.sectors) {
      const s = world.sectors.get(this.targetSectorId);
      if (s) {
        // e.g. lower barricade / raise bridge
        s.floorHeight = s.targetFloorHeight ?? (s.floorHeight - 2.0);
      }
    }

    // Monster closet / ambush trigger
    if (this.spawnEntities && world.spawnMonsterCloset) {
      world.spawnMonsterCloset(this.spawnEntities);
    }
  }
}
