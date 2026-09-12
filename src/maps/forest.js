// forest.js - Livello 1: Il Bosco della Luna Morta
// Complies with §6 & §7:
// >=14 sectors, >=4 floor heights, stairs, lift, 3 doors, loops, secret cave with Woodsman Axe, Alpha Werewolf Boss

export const forestMap = {
  id: "forest_01",
  title: "Il Bosco della Luna Morta",
  area: "forest",
  panorama: "forest",
  start: { x: 2.0, y: 2.0, angle: 0, sectorId: "path_start" },

  sectors: [
    // 0. Starting low path
    {
      id: "path_start",
      floorHeight: 0.0,
      ceilingHeight: 4.0,
      floorTexture: "muddy_path",
      ceilingTexture: "moonlit_canopy",
      light: 0.85,
      fog: "#24183d"
    },
    // 1. Gully / Stream bed (lower)
    {
      id: "gully",
      floorHeight: -0.4,
      ceilingHeight: 4.2,
      floorTexture: "dead_leaf_floor",
      ceilingTexture: "moonlit_canopy",
      light: 0.7,
      fog: "#24183d"
    },
    // 2. Stair step 1
    {
      id: "stair_1",
      floorHeight: 0.35,
      ceilingHeight: 4.0,
      floorTexture: "muddy_path",
      ceilingTexture: "moonlit_canopy",
      light: 0.8,
      fog: "#24183d"
    },
    // 3. Stair step 2
    {
      id: "stair_2",
      floorHeight: 0.70,
      ceilingHeight: 4.0,
      floorTexture: "muddy_path",
      ceilingTexture: "moonlit_canopy",
      light: 0.8,
      fog: "#24183d"
    },
    // 4. Elevated Ridge (Lookout with Werewolves)
    {
      id: "ridge_overlook",
      floorHeight: 1.10,
      ceilingHeight: 4.5,
      floorTexture: "tangled_roots",
      ceilingTexture: "moonlit_canopy",
      light: 0.9,
      fog: "#24183d"
    },
    // 5. Secret Cave (behind false wall/roots)
    {
      id: "secret_cave",
      floorHeight: 0.2,
      ceilingHeight: 2.4,
      floorTexture: "cracked_earth",
      ceilingTexture: "black_cave_rock",
      light: 0.45,
      fog: "#120822",
      isSky: false
    },
    // 6. Central Clearing
    {
      id: "clearing",
      floorHeight: 0.0,
      ceilingHeight: 4.2,
      floorTexture: "dead_leaf_floor",
      ceilingTexture: "moonlit_canopy",
      light: 0.8,
      fog: "#24183d"
    },
    // 7. Ritual Lift Platform (Moving sector!)
    {
      id: "tree_lift",
      floorHeight: 0.0,
      ceilingHeight: 4.2,
      floorTexture: "ancient_bark",
      ceilingTexture: "moonlit_canopy",
      light: 0.85,
      fog: "#24183d"
    },
    // 8. High Balcony Terrace (requires lift or loop)
    {
      id: "high_terrace",
      floorHeight: 1.60,
      ceilingHeight: 4.5,
      floorTexture: "tangled_roots",
      ceilingTexture: "moonlit_canopy",
      light: 0.9,
      fog: "#24183d"
    },
    // 9. Loop connecting path back to gully
    {
      id: "loop_path",
      floorHeight: 0.4,
      ceilingHeight: 4.0,
      floorTexture: "muddy_path",
      ceilingTexture: "moonlit_canopy",
      light: 0.75,
      fog: "#24183d"
    },
    // 10. Root Gate Chamber (Gate closed with Blue Raven Key)
    {
      id: "gate_chamber",
      floorHeight: 0.0,
      ceilingHeight: 4.0,
      floorTexture: "muddy_path",
      ceilingTexture: "moonlit_canopy",
      light: 0.8,
      fog: "#24183d"
    },
    // 11. Boss Arena: Alpha Werewolf Lair
    {
      id: "boss_arena",
      floorHeight: 0.0,
      ceilingHeight: 4.8,
      floorTexture: "dead_leaf_floor",
      ceilingTexture: "moonlit_canopy",
      light: 0.85,
      fog: "#321245"
    },
    // 12. Boss Arena Overlook (high cliff tier)
    {
      id: "arena_overlook",
      floorHeight: 1.4,
      ceilingHeight: 4.8,
      floorTexture: "clawed_bark",
      ceilingTexture: "moonlit_canopy",
      light: 0.9,
      fog: "#321245"
    },
    // 13. Exit Archway to Cemetery
    {
      id: "exit_path",
      floorHeight: 0.0,
      ceilingHeight: 4.0,
      floorTexture: "muddy_path",
      ceilingTexture: "moonlit_canopy",
      light: 0.75,
      fog: "#24183d"
    }
  ],

  // Sector edges (Walls and Portals)
  edges: [
    // Sector 0: path_start (0,0) to (4,4)
    { sectorId: "path_start", x1: 0, y1: 0, x2: 4, y2: 0, type: "solid", texture: "ancient_bark" },
    { sectorId: "path_start", x1: 0, y1: 4, x2: 0, y2: 0, type: "solid", texture: "ancient_bark" },
    { sectorId: "path_start", x1: 4, y1: 0, x2: 4, y2: 4, type: "portal", neighborSectorId: "gully" },
    { sectorId: "path_start", x1: 0, y1: 4, x2: 4, y2: 4, type: "portal", neighborSectorId: "stair_1" },

    // Sector 1: gully (4,0) to (8,4)
    { sectorId: "gully", x1: 4, y1: 0, x2: 4, y2: 4, type: "portal", neighborSectorId: "path_start" },
    { sectorId: "gully", x1: 4, y1: 0, x2: 8, y2: 0, type: "solid", texture: "mossy_cliff" },
    { sectorId: "gully", x1: 8, y1: 0, x2: 8, y2: 4, type: "portal", neighborSectorId: "secret_cave", doorId: "door_cave" },
    { sectorId: "gully", x1: 4, y1: 4, x2: 8, y2: 4, type: "portal", neighborSectorId: "loop_path" },

    // Sector 2: stair_1 (0,4) to (4,6)
    { sectorId: "stair_1", x1: 0, y1: 4, x2: 4, y2: 4, type: "portal", neighborSectorId: "path_start" },
    { sectorId: "stair_1", x1: 0, y1: 4, x2: 0, y2: 6, type: "solid", texture: "ancient_bark" },
    { sectorId: "stair_1", x1: 4, y1: 4, x2: 4, y2: 6, type: "solid", texture: "mossy_cliff" },
    { sectorId: "stair_1", x1: 0, y1: 6, x2: 4, y2: 6, type: "portal", neighborSectorId: "stair_2" },

    // Sector 3: stair_2 (0,6) to (4,8)
    { sectorId: "stair_2", x1: 0, y1: 6, x2: 4, y2: 6, type: "portal", neighborSectorId: "stair_1" },
    { sectorId: "stair_2", x1: 0, y1: 6, x2: 0, y2: 8, type: "solid", texture: "ancient_bark" },
    { sectorId: "stair_2", x1: 4, y1: 6, x2: 4, y2: 8, type: "solid", texture: "mossy_cliff" },
    { sectorId: "stair_2", x1: 0, y1: 8, x2: 4, y2: 8, type: "portal", neighborSectorId: "ridge_overlook" },

    // Sector 4: ridge_overlook (0,8) to (6,12)
    { sectorId: "ridge_overlook", x1: 0, y1: 8, x2: 4, y2: 8, type: "portal", neighborSectorId: "stair_2" },
    { sectorId: "ridge_overlook", x1: 0, y1: 8, x2: 0, y2: 12, type: "solid", texture: "ancient_bark" },
    { sectorId: "ridge_overlook", x1: 0, y1: 12, x2: 6, y2: 12, type: "solid", texture: "mossy_cliff" },
    { sectorId: "ridge_overlook", x1: 6, y1: 8, x2: 6, y2: 12, type: "portal", neighborSectorId: "clearing" },
    { sectorId: "ridge_overlook", x1: 4, y1: 8, x2: 6, y2: 8, type: "solid", texture: "ancient_bark" },

    // Sector 5: secret_cave (8,0) to (12,4)
    { sectorId: "secret_cave", x1: 8, y1: 0, x2: 8, y2: 4, type: "portal", neighborSectorId: "gully", doorId: "door_cave" },
    { sectorId: "secret_cave", x1: 8, y1: 0, x2: 12, y2: 0, type: "solid", texture: "black_cave_rock" },
    { sectorId: "secret_cave", x1: 12, y1: 0, x2: 12, y2: 4, type: "solid", texture: "black_cave_rock" },
    { sectorId: "secret_cave", x1: 8, y1: 4, x2: 12, y2: 4, type: "solid", texture: "black_cave_rock" },

    // Sector 6: clearing (6,6) to (12,12)
    { sectorId: "clearing", x1: 6, y1: 8, x2: 6, y2: 12, type: "portal", neighborSectorId: "ridge_overlook" },
    { sectorId: "clearing", x1: 6, y1: 6, x2: 6, y2: 8, type: "solid", texture: "ancient_bark" },
    { sectorId: "clearing", x1: 6, y1: 6, x2: 10, y2: 6, type: "portal", neighborSectorId: "loop_path" },
    { sectorId: "clearing", x1: 10, y1: 6, x2: 10, y2: 8, type: "portal", neighborSectorId: "tree_lift" },
    { sectorId: "clearing", x1: 10, y1: 8, x2: 12, y2: 8, type: "portal", neighborSectorId: "gate_chamber", doorId: "door_root_gate" },
    { sectorId: "clearing", x1: 6, y1: 12, x2: 12, y2: 12, type: "solid", texture: "mossy_cliff" },
    { sectorId: "clearing", x1: 12, y1: 8, x2: 12, y2: 12, type: "solid", texture: "clawed_bark" },

    // Sector 7: tree_lift (10,6) to (13,8)
    { sectorId: "tree_lift", x1: 10, y1: 6, x2: 10, y2: 8, type: "portal", neighborSectorId: "clearing" },
    { sectorId: "tree_lift", x1: 10, y1: 6, x2: 13, y2: 6, type: "solid", texture: "ancient_bark" },
    { sectorId: "tree_lift", x1: 10, y1: 8, x2: 13, y2: 8, type: "solid", texture: "ancient_bark" },
    { sectorId: "tree_lift", x1: 13, y1: 6, x2: 13, y2: 8, type: "portal", neighborSectorId: "high_terrace" },

    // Sector 8: high_terrace (13,6) to (17,10) - contains Blue Raven Key!
    { sectorId: "high_terrace", x1: 13, y1: 6, x2: 13, y2: 8, type: "portal", neighborSectorId: "tree_lift" },
    { sectorId: "high_terrace", x1: 13, y1: 6, x2: 17, y2: 6, type: "solid", texture: "ancient_bark" },
    { sectorId: "high_terrace", x1: 17, y1: 6, x2: 17, y2: 10, type: "solid", texture: "mossy_cliff" },
    { sectorId: "high_terrace", x1: 13, y1: 10, x2: 17, y2: 10, type: "solid", texture: "ancient_bark" },
    { sectorId: "high_terrace", x1: 13, y1: 8, x2: 13, y2: 10, type: "solid", texture: "ancient_bark" },

    // Sector 9: loop_path (4,4) to (10,6)
    { sectorId: "loop_path", x1: 4, y1: 4, x2: 8, y2: 4, type: "portal", neighborSectorId: "gully" },
    { sectorId: "loop_path", x1: 8, y1: 4, x2: 10, y2: 4, type: "solid", texture: "mossy_cliff" },
    { sectorId: "loop_path", x1: 4, y1: 4, x2: 4, y2: 6, type: "solid", texture: "ancient_bark" },
    { sectorId: "loop_path", x1: 10, y1: 4, x2: 10, y2: 6, type: "solid", texture: "mossy_cliff" },
    { sectorId: "loop_path", x1: 6, y1: 6, x2: 10, y2: 6, type: "portal", neighborSectorId: "clearing" },
    { sectorId: "loop_path", x1: 4, y1: 6, x2: 6, y2: 6, type: "solid", texture: "ancient_bark" },

    // Sector 10: gate_chamber (10,8) to (12,11)
    { sectorId: "gate_chamber", x1: 10, y1: 8, x2: 12, y2: 8, type: "portal", neighborSectorId: "clearing", doorId: "door_root_gate" },
    { sectorId: "gate_chamber", x1: 10, y1: 8, x2: 10, y2: 11, type: "solid", texture: "thorn_bramble" },
    { sectorId: "gate_chamber", x1: 12, y1: 8, x2: 12, y2: 11, type: "solid", texture: "thorn_bramble" },
    { sectorId: "gate_chamber", x1: 10, y1: 11, x2: 12, y2: 11, type: "portal", neighborSectorId: "boss_arena" },

    // Sector 11: boss_arena (8,11) to (16,17)
    { sectorId: "boss_arena", x1: 10, y1: 11, x2: 12, y2: 11, type: "portal", neighborSectorId: "gate_chamber" },
    { sectorId: "boss_arena", x1: 8, y1: 11, x2: 10, y2: 11, type: "solid", texture: "clawed_bark" },
    { sectorId: "boss_arena", x1: 12, y1: 11, x2: 16, y2: 11, type: "solid", texture: "clawed_bark" },
    { sectorId: "boss_arena", x1: 8, y1: 11, x2: 8, y2: 17, type: "solid", texture: "mossy_cliff" },
    { sectorId: "boss_arena", x1: 16, y1: 11, x2: 16, y2: 14, type: "portal", neighborSectorId: "arena_overlook" },
    { sectorId: "boss_arena", x1: 16, y1: 14, x2: 16, y2: 17, type: "solid", texture: "clawed_bark" },
    { sectorId: "boss_arena", x1: 8, y1: 17, x2: 12, y2: 17, type: "solid", texture: "clawed_bark" },
    { sectorId: "boss_arena", x1: 12, y1: 17, x2: 14, y2: 17, type: "portal", neighborSectorId: "exit_path", doorId: "door_exit_gate" },
    { sectorId: "boss_arena", x1: 14, y1: 17, x2: 16, y2: 17, type: "solid", texture: "clawed_bark" },

    // Sector 12: arena_overlook (16,11) to (19,14)
    { sectorId: "arena_overlook", x1: 16, y1: 11, x2: 16, y2: 14, type: "portal", neighborSectorId: "boss_arena" },
    { sectorId: "arena_overlook", x1: 16, y1: 11, x2: 19, y2: 11, type: "solid", texture: "mossy_cliff" },
    { sectorId: "arena_overlook", x1: 19, y1: 11, x2: 19, y2: 14, type: "solid", texture: "ancient_bark" },
    { sectorId: "arena_overlook", x1: 16, y1: 14, x2: 19, y2: 14, type: "solid", texture: "mossy_cliff" },

    // Sector 13: exit_path (12,17) to (14,20)
    { sectorId: "exit_path", x1: 12, y1: 17, x2: 14, y2: 17, type: "portal", neighborSectorId: "boss_arena", doorId: "door_exit_gate" },
    { sectorId: "exit_path", x1: 12, y1: 17, x2: 12, y2: 20, type: "solid", texture: "ancient_bark" },
    { sectorId: "exit_path", x1: 14, y1: 17, x2: 14, y2: 20, type: "solid", texture: "ancient_bark" },
    { sectorId: "exit_path", x1: 12, y1: 20, x2: 14, y2: 20, type: "solid", texture: "ancient_bark" }
  ],

  // Doors & Gates
  doors: [
    {
      id: "door_cave",
      type: "forest_root_gate",
      state: "closed",
      speed: 0.8,
      isSecret: true
    },
    {
      id: "door_root_gate",
      type: "forest_root_gate",
      state: "locked",
      requiredKey: "blue_raven_key",
      speed: 0.7
    },
    {
      id: "door_exit_gate",
      type: "forest_root_gate",
      state: "locked",
      requiredKey: null, // Opens automatically upon Alpha Werewolf defeat
      speed: 0.7
    }
  ],

  // Lifts
  lifts: [
    {
      id: "lift_clearing",
      sectorId: "tree_lift",
      bottomHeight: 0.0,
      topHeight: 1.6,
      speed: 1.0,
      state: "down"
    }
  ],

  // Triggers
  triggers: [
    {
      id: "trig_boss_defeat",
      type: "boss_defeat",
      targetDoorId: "door_exit_gate"
    }
  ],

  // Props
  props: [
    { name: "twisted_dead_tree", sectorId: "path_start", x: 1.0, y: 1.0 },
    { name: "ground_fog", sectorId: "gully", x: 6.0, y: 2.0 },
    { name: "green_flame_brazier", sectorId: "ridge_overlook", x: 2.0, y: 10.0 },
    { name: "rock_cluster", sectorId: "clearing", x: 7.0, y: 7.0 },
    { name: "root_barrier", sectorId: "gate_chamber", x: 11.0, y: 9.5 },
    { name: "hanging_green_lantern", sectorId: "high_terrace", x: 15.0, y: 8.0 },
    { name: "root_exit_arch", sectorId: "exit_path", x: 13.0, y: 19.0 }
  ],

  // Pickups
  pickups: [
    { type: "weapon", name: "woodsman_axe", weaponId: "axe", sectorId: "secret_cave", x: 10.0, y: 2.0 },
    { type: "ammo", name: "ammo_clip", ammoType: "bullets", amount: 20, sectorId: "gully", x: 5.5, y: 2.5 },
    { type: "health", name: "health_vial", amount: 15, sectorId: "stair_2", x: 2.0, y: 7.0 },
    { type: "key", name: "blue_raven_key", sectorId: "high_terrace", x: 15.0, y: 8.0 },
    { type: "ammo", name: "shotgun_shells", ammoType: "shells", amount: 8, sectorId: "ridge_overlook", x: 3.5, y: 10.0 },
    { type: "weapon", name: "shotgun", weaponId: "shotgun", sectorId: "clearing", x: 8.5, y: 9.5 },
    { type: "health", name: "medical_satchel", amount: 35, sectorId: "boss_arena", x: 9.0, y: 12.0 },
    { type: "exit", name: "exit_sigil", sectorId: "exit_path", x: 13.0, y: 19.5 }
  ],

  // Enemies
  enemies: [
    { type: "werewolf", sectorId: "gully", x: 6.0, y: 1.5 },
    { type: "giant_spider", sectorId: "ridge_overlook", x: 3.0, y: 11.0 },
    { type: "witch", sectorId: "high_terrace", x: 15.5, y: 7.5 },
    { type: "werewolf", sectorId: "clearing", x: 8.0, y: 8.5 },
    { type: "giant_spider", sectorId: "clearing", x: 9.0, y: 11.0 },
    // Boss: Alpha Werewolf (stronger stats)
    { type: "werewolf", sectorId: "boss_arena", x: 12.0, y: 14.5, isBoss: true }
  ]
};
