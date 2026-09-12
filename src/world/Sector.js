// Sector.js - Sector definition for DEAD : THE HALLOWEEN MASSACRE

export class Sector {
  constructor(data) {
    this.id = data.id;
    this.floorHeight = data.floorHeight ?? 0;
    this.ceilingHeight = data.ceilingHeight ?? 3.5;
    this.targetFloorHeight = this.floorHeight; // for moving lifts/floors
    this.targetCeilingHeight = this.ceilingHeight;
    this.floorTexture = data.floorTexture ?? "dead_leaf_floor";
    this.ceilingTexture = data.ceilingTexture ?? "moonlit_canopy";
    this.light = data.light ?? 0.8;
    this.fog = data.fog ?? "#24183d";
    this.isSky = data.isSky ?? true; // if ceiling is open sky/canopy
    this.hazard = data.hazard ?? false; // slime / lava / spikes

    // Bounding box for rapid spatial queries
    this.bounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
    this.edges = [];
  }

  addEdge(edge) {
    this.edges.push(edge);
    this.bounds.minX = Math.min(this.bounds.minX, edge.x1, edge.x2);
    this.bounds.minY = Math.min(this.bounds.minY, edge.y1, edge.y2);
    this.bounds.maxX = Math.max(this.bounds.maxX, edge.x1, edge.x2);
    this.bounds.maxY = Math.max(this.bounds.maxY, edge.y1, edge.y2);
  }

  // Point in polygon test
  containsPoint(px, py) {
    if (px < this.bounds.minX - 0.01 || px > this.bounds.maxX + 0.01 ||
        py < this.bounds.minY - 0.01 || py > this.bounds.maxY + 0.01) {
      return false;
    }

    let inside = false;
    for (let i = 0; i < this.edges.length; i++) {
      const e = this.edges[i];
      const intersect = ((e.y1 > py) !== (e.y2 > py)) &&
        (px < (e.x2 - e.x1) * (py - e.y1) / ((e.y2 - e.y1) || 0.00001) + e.x1);
      if (intersect) inside = !inside;
    }
    return inside;
  }
}
