// MapLoader.js - Parses, validates polygon vertices, and connects sectors, edges, doors, and entities

import { Sector } from './Sector.js';
import { Door } from './Door.js';
import { Lift } from './Lift.js';
import { Trigger } from './Trigger.js';

export class MapLoader {
  static loadMap(mapData) {
    const sectors = new Map();
    const edges = [];
    const doors = new Map();
    const lifts = new Map();
    const triggers = [];

    // 1. Instantiate sectors
    for (const secData of mapData.sectors) {
      const sector = new Sector(secData);
      sectors.set(secData.id, sector);
    }

    // 2. Process edges
    for (let i = 0; i < mapData.edges.length; i++) {
      const ed = mapData.edges[i];
      const edgeObj = {
        index: i,
        id: ed.id || `edge_${i}`,
        sectorId: ed.sectorId,
        x1: ed.x1,
        y1: ed.y1,
        x2: ed.x2,
        y2: ed.y2,
        type: ed.type || 'solid', // 'solid', 'portal'
        neighborSectorId: ed.neighborSectorId || null,
        texture: ed.texture || 'ancient_bark',
        upperTexture: ed.upperTexture || ed.texture || 'ancient_bark',
        lowerTexture: ed.lowerTexture || ed.texture || 'ancient_bark',
        doorId: ed.doorId || null
      };

      const sec = sectors.get(ed.sectorId);
      if (sec) {
        sec.addEdge(edgeObj);
      }
      edges.push(edgeObj);
    }

    // 3. Process doors
    if (mapData.doors) {
      for (const d of mapData.doors) {
        const door = new Door(d);
        doors.set(door.id, door);
      }
    }

    // 4. Process lifts
    if (mapData.lifts) {
      for (const l of mapData.lifts) {
        const sector = sectors.get(l.sectorId);
        const lift = new Lift(l, sector);
        lifts.set(lift.id, lift);
      }
    }

    // 5. Process triggers
    if (mapData.triggers) {
      for (const t of mapData.triggers) {
        const trig = new Trigger(t);
        triggers.push(trig);
      }
    }

    return {
      id: mapData.id,
      title: mapData.title,
      area: mapData.area, // 'forest', 'cemetery', 'crypt', 'catacombs'
      panorama: mapData.panorama,
      start: mapData.start,
      sectors,
      edges,
      doors,
      lifts,
      triggers,
      props: mapData.props || [],
      pickups: mapData.pickups || [],
      enemies: mapData.enemies || [],
      secrets: mapData.secrets || []
    };
  }

  // Helper to find which sector contains a given 2D position (x, y)
  static findSectorAt(sectors, x, y) {
    for (const sec of sectors.values()) {
      if (sec.containsPoint(x, y)) {
        return sec;
      }
    }
    return null;
  }
}
