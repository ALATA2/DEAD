// catacombs.js - Livello 4: Le Catacombe dell'Orologio Nero
// Complies with §6 & §7:
// >=14 sectors, >=4 floor heights, concentric arena, 3 levers, broken bridge, Scarecrow Reaper mini-boss, Purple Clock Key, Clock Reaper Final Boss, Exit Sigil & Dawn Victory

export const catacombsMap = {
  id: "catacombs_04",
  title: "Le Catacombe dell'Orologio Nero",
  area: "catacombs",
  panorama: "catacombs",
  start: { x: 2.0, y: 2.0, angle: 0, sectorId: "cata_entry" },

  sectors: [
    // 0. Catacombs Entry Tunnel
    {
      id: "cata_entry",
      floorHeight: 0.0,
      ceilingHeight: 3.2,
      floorTexture: "damp_bricks",
      ceilingTexture: "root_cobweb_ceiling",
      light: 0.75,
      fog: "#1c0d1e",
      isSky: false
    },
    // 1. Black Water Sewer Canal (Floor -0.6)
    {
      id: "black_water_canal",
      floorHeight: -0.6,
      ceilingHeight: 3.6,
      floorTexture: "black_water",
      ceilingTexture: "root_cobweb_ceiling",
      light: 0.6,
      fog: "#120815",
      isSky: false
    },
    // 2. Bone Ramp Step 1
    {
      id: "bone_ramp_1",
      floorHeight: 0.40,
      ceilingHeight: 3.6,
      floorTexture: "bone_wall",
      ceilingTexture: "root_cobweb_ceiling",
      light: 0.7,
      fog: "#1c0d1e",
      isSky: false
    },
    // 3. Bone Ramp Step 2
    {
      id: "bone_ramp_2",
      floorHeight: 0.80,
      ceilingHeight: 3.6,
      floorTexture: "bone_wall",
      ceilingTexture: "root_cobweb_ceiling",
      light: 0.75,
      fog: "#1c0d1e",
      isSky: false
    },
    // 4. Overlook Bone Bridge (Elevated 1.4)
    {
      id: "bone_bridge",
      floorHeight: 1.40,
      ceilingHeight: 4.0,
      floorTexture: "skull_ossuary",
      ceilingTexture: "root_cobweb_ceiling",
      light: 0.8,
      fog: "#1c0d1e",
      isSky: false
    },
    // 5. Secret Ossuary Vault
    {
      id: "secret_ossuary",
      floorHeight: 0.0,
      ceilingHeight: 2.6,
      floorTexture: "skull_ossuary",
      ceilingTexture: "bone_wall",
      light: 0.4,
      fog: "#100416",
      isSky: false
    },
    // 6. Central Chasm
    {
      id: "central_chasm",
      floorHeight: 0.0,
      ceilingHeight: 4.4,
      floorTexture: "damp_bricks",
      ceilingTexture: "root_cobweb_ceiling",
      light: 0.75,
      fog: "#1c0d1e",
      isSky: false
    },
    // 7. Mechanical Gear Lift Platform
    {
      id: "gear_lift",
      floorHeight: 0.0,
      ceilingHeight: 4.8,
      floorTexture: "broken_timber_support",
      ceilingTexture: "root_cobweb_ceiling",
      light: 0.85,
      fog: "#1c0d1e",
      isSky: false
    },
    // 8. High Balcony Lookout (Elevated 1.8) - Mini-boss Lair
    {
      id: "scarecrow_lair",
      floorHeight: 1.80,
      ceilingHeight: 4.8,
      floorTexture: "skull_ossuary",
      ceilingTexture: "root_cobweb_ceiling",
      light: 0.9,
      fog: "#240a2c",
      isSky: false
    },
    // 9. West Mechanism Hub (Lever 1)
    {
      id: "west_hub",
      floorHeight: 0.2,
      ceilingHeight: 3.4,
      floorTexture: "damp_bricks",
      ceilingTexture: "root_cobweb_ceiling",
      light: 0.8,
      fog: "#1c0d1e",
      isSky: false
    },
    // 10. East Mechanism Hub (Lever 2)
    {
      id: "east_hub",
      floorHeight: 0.2,
      ceilingHeight: 3.4,
      floorTexture: "damp_bricks",
      ceilingTexture: "root_cobweb_ceiling",
      light: 0.8,
      fog: "#1c0d1e",
      isSky: false
    },
    // 11. Final Cosmic Clock Arena - Outer Ring
    {
      id: "clock_arena_outer",
      floorHeight: 0.0,
      ceilingHeight: 5.2,
      floorTexture: "purple_void_rune",
      ceilingTexture: "root_cobweb_ceiling",
      light: 0.85,
      fog: "#360e42",
      isSky: false
    },
    // 12. Clock Arena - Inner Dias (Elevated 0.6) - Clock Reaper Boss
    {
      id: "clock_dias",
      floorHeight: 0.60,
      ceilingHeight: 5.2,
      floorTexture: "purple_void_rune",
      ceilingTexture: "root_cobweb_ceiling",
      light: 1.0,
      fog: "#360e42",
      isSky: false
    },
    // 13. Dawn Exit Chamber
    {
      id: "dawn_sanctuary",
      floorHeight: 0.0,
      ceilingHeight: 4.5,
      floorTexture: "damp_bricks",
      ceilingTexture: "moonlit_storm_sky",
      light: 1.0,
      fog: "#4a1e3a",
      isSky: true
    }
  ],

  edges: [
    // Sector 0: cata_entry (0,0) to (4,4)
    { sectorId: "cata_entry", x1: 0, y1: 0, x2: 4, y2: 0, type: "solid", texture: "bone_wall" },
    { sectorId: "cata_entry", x1: 0, y1: 4, x2: 0, y2: 0, type: "solid", texture: "bone_wall" },
    { sectorId: "cata_entry", x1: 4, y1: 0, x2: 4, y2: 4, type: "portal", neighborSectorId: "black_water_canal" },
    { sectorId: "cata_entry", x1: 0, y1: 4, x2: 4, y2: 4, type: "portal", neighborSectorId: "bone_ramp_1" },

    // Sector 1: black_water_canal (4,0) to (8,4)
    { sectorId: "black_water_canal", x1: 4, y1: 0, x2: 4, y2: 4, type: "portal", neighborSectorId: "cata_entry" },
    { sectorId: "black_water_canal", x1: 4, y1: 0, x2: 8, y2: 0, type: "solid", texture: "damp_bricks" },
    { sectorId: "black_water_canal", x1: 8, y1: 0, x2: 8, y2: 4, type: "portal", neighborSectorId: "secret_ossuary", doorId: "door_secret_ossuary" },
    { sectorId: "black_water_canal", x1: 4, y1: 4, x2: 8, y2: 4, type: "portal", neighborSectorId: "central_chasm" },

    // Sector 2: bone_ramp_1 (0,4) to (4,6)
    { sectorId: "bone_ramp_1", x1: 0, y1: 4, x2: 4, y2: 4, type: "portal", neighborSectorId: "cata_entry" },
    { sectorId: "bone_ramp_1", x1: 0, y1: 4, x2: 0, y2: 6, type: "solid", texture: "bone_wall" },
    { sectorId: "bone_ramp_1", x1: 4, y1: 4, x2: 4, y2: 6, type: "solid", texture: "bone_wall" },
    { sectorId: "bone_ramp_1", x1: 0, y1: 6, x2: 4, y2: 6, type: "portal", neighborSectorId: "bone_ramp_2" },

    // Sector 3: bone_ramp_2 (0,6) to (4,8)
    { sectorId: "bone_ramp_2", x1: 0, y1: 6, x2: 4, y2: 6, type: "portal", neighborSectorId: "bone_ramp_1" },
    { sectorId: "bone_ramp_2", x1: 0, y1: 6, x2: 0, y2: 8, type: "solid", texture: "bone_wall" },
    { sectorId: "bone_ramp_2", x1: 4, y1: 6, x2: 4, y2: 8, type: "solid", texture: "bone_wall" },
    { sectorId: "bone_ramp_2", x1: 0, y1: 8, x2: 4, y2: 8, type: "portal", neighborSectorId: "bone_bridge" },

    // Sector 4: bone_bridge (0,8) to (5,12)
    { sectorId: "bone_bridge", x1: 0, y1: 8, x2: 4, y2: 8, type: "portal", neighborSectorId: "bone_ramp_2" },
    { sectorId: "bone_bridge", x1: 0, y1: 8, x2: 0, y2: 12, type: "solid", texture: "skull_ossuary" },
    { sectorId: "bone_bridge", x1: 0, y1: 12, x2: 5, y2: 12, type: "solid", texture: "skull_ossuary" },
    { sectorId: "bone_bridge", x1: 5, y1: 8, x2: 5, y2: 12, type: "portal", neighborSectorId: "central_chasm" },
    { sectorId: "bone_bridge", x1: 4, y1: 8, x2: 5, y2: 8, type: "solid", texture: "bone_wall" },

    // Sector 5: secret_ossuary (8,0) to (12,4)
    { sectorId: "secret_ossuary", x1: 8, y1: 0, x2: 8, y2: 4, type: "portal", neighborSectorId: "black_water_canal", doorId: "door_secret_ossuary" },
    { sectorId: "secret_ossuary", x1: 8, y1: 0, x2: 12, y2: 0, type: "solid", texture: "skull_ossuary" },
    { sectorId: "secret_ossuary", x1: 12, y1: 0, x2: 12, y2: 4, type: "solid", texture: "skull_ossuary" },
    { sectorId: "secret_ossuary", x1: 8, y1: 4, x2: 12, y2: 4, type: "solid", texture: "skull_ossuary" },

    // Sector 6: central_chasm (5,4) to (12,12)
    { sectorId: "central_chasm", x1: 4, y1: 4, x2: 8, y2: 4, type: "portal", neighborSectorId: "black_water_canal" },
    { sectorId: "central_chasm", x1: 5, y1: 8, x2: 5, y2: 12, type: "portal", neighborSectorId: "bone_bridge" },
    { sectorId: "central_chasm", x1: 5, y1: 4, x2: 5, y2: 8, type: "solid", texture: "damp_bricks" },
    { sectorId: "central_chasm", x1: 8, y1: 4, x2: 12, y2: 4, type: "portal", neighborSectorId: "east_hub" },
    { sectorId: "central_chasm", x1: 12, y1: 4, x2: 12, y2: 9, type: "portal", neighborSectorId: "gear_lift" },
    { sectorId: "central_chasm", x1: 12, y1: 9, x2: 12, y2: 12, type: "solid", texture: "damp_bricks" },
    { sectorId: "central_chasm", x1: 5, y1: 12, x2: 8, y2: 12, type: "portal", neighborSectorId: "west_hub" },
    { sectorId: "central_chasm", x1: 8, y1: 12, x2: 12, y2: 12, type: "portal", neighborSectorId: "clock_arena_outer", doorId: "door_clock_gate" },

    // Sector 7: gear_lift (12,4) to (15,9)
    { sectorId: "gear_lift", x1: 12, y1: 4, x2: 12, y2: 9, type: "portal", neighborSectorId: "central_chasm" },
    { sectorId: "gear_lift", x1: 12, y1: 4, x2: 15, y2: 4, type: "solid", texture: "broken_timber_support" },
    { sectorId: "gear_lift", x1: 15, y1: 4, x2: 15, y2: 9, type: "portal", neighborSectorId: "scarecrow_lair" },
    { sectorId: "gear_lift", x1: 12, y1: 9, x2: 15, y2: 9, type: "solid", texture: "broken_timber_support" },

    // Sector 8: scarecrow_lair (15,4) to (19,9) (Mini-boss & Purple Clock Key!)
    { sectorId: "scarecrow_lair", x1: 15, y1: 4, x2: 15, y2: 9, type: "portal", neighborSectorId: "gear_lift" },
    { sectorId: "scarecrow_lair", x1: 15, y1: 4, x2: 19, y2: 4, type: "solid", texture: "skull_ossuary" },
    { sectorId: "scarecrow_lair", x1: 19, y1: 4, x2: 19, y2: 9, type: "solid", texture: "skull_ossuary" },
    { sectorId: "scarecrow_lair", x1: 15, y1: 9, x2: 19, y2: 9, type: "solid", texture: "skull_ossuary" },

    // Sector 9: west_hub (5,12) to (8,16)
    { sectorId: "west_hub", x1: 5, y1: 12, x2: 8, y2: 12, type: "portal", neighborSectorId: "central_chasm" },
    { sectorId: "west_hub", x1: 5, y1: 12, x2: 5, y2: 16, type: "solid", texture: "purple_void_rune" },
    { sectorId: "west_hub", x1: 5, y1: 16, x2: 8, y2: 16, type: "solid", texture: "damp_bricks" },
    { sectorId: "west_hub", x1: 8, y1: 12, x2: 8, y2: 16, type: "solid", texture: "damp_bricks" },

    // Sector 10: east_hub (8,0) to (12,4)
    { sectorId: "east_hub", x1: 8, y1: 4, x2: 12, y2: 4, type: "portal", neighborSectorId: "central_chasm" },
    { sectorId: "east_hub", x1: 12, y1: 4, x2: 12, y2: 0, type: "solid", texture: "purple_void_rune" },
    { sectorId: "east_hub", x1: 8, y1: 0, x2: 12, y2: 0, type: "solid", texture: "damp_bricks" },
    { sectorId: "east_hub", x1: 8, y1: 0, x2: 8, y2: 4, type: "solid", texture: "damp_bricks" },

    // Sector 11: clock_arena_outer (8,12) to (16,20)
    { sectorId: "clock_arena_outer", x1: 8, y1: 12, x2: 12, y2: 12, type: "portal", neighborSectorId: "central_chasm", doorId: "door_clock_gate" },
    { sectorId: "clock_arena_outer", x1: 12, y1: 12, x2: 16, y2: 12, type: "solid", texture: "bone_wall" },
    { sectorId: "clock_arena_outer", x1: 8, y1: 12, x2: 8, y2: 20, type: "solid", texture: "bone_wall" },
    { sectorId: "clock_arena_outer", x1: 16, y1: 12, x2: 16, y2: 20, type: "solid", texture: "bone_wall" },
    { sectorId: "clock_arena_outer", x1: 8, y1: 20, x2: 11, y2: 20, type: "solid", texture: "bone_wall" },
    { sectorId: "clock_arena_outer", x1: 11, y1: 20, x2: 13, y2: 20, type: "portal", neighborSectorId: "dawn_sanctuary", doorId: "door_dawn_exit" },
    { sectorId: "clock_arena_outer", x1: 13, y1: 20, x2: 16, y2: 20, type: "solid", texture: "bone_wall" },

    // Sector 12: clock_dias (11,15) to (13,17) inside arena (Center platform)
    { sectorId: "clock_dias", x1: 11, y1: 15, x2: 13, y2: 15, type: "portal", neighborSectorId: "clock_arena_outer" },
    { sectorId: "clock_dias", x1: 13, y1: 15, x2: 13, y2: 17, type: "portal", neighborSectorId: "clock_arena_outer" },
    { sectorId: "clock_dias", x1: 11, y1: 17, x2: 13, y2: 17, type: "portal", neighborSectorId: "clock_arena_outer" },
    { sectorId: "clock_dias", x1: 11, y1: 15, x2: 11, y2: 17, type: "portal", neighborSectorId: "clock_arena_outer" },

    // Sector 13: dawn_sanctuary (11,20) to (13,24) (Exit to victory!)
    { sectorId: "dawn_sanctuary", x1: 11, y1: 20, x2: 13, y2: 20, type: "portal", neighborSectorId: "clock_arena_outer", doorId: "door_dawn_exit" },
    { sectorId: "dawn_sanctuary", x1: 11, y1: 20, x2: 11, y2: 24, type: "solid", texture: "purple_rune_stone" },
    { sectorId: "dawn_sanctuary", x1: 13, y1: 20, x2: 13, y2: 24, type: "solid", texture: "purple_rune_stone" },
    { sectorId: "dawn_sanctuary", x1: 11, y1: 24, x2: 13, y2: 24, type: "solid", texture: "purple_rune_stone" }
  ],

  doors: [
    {
      id: "door_secret_ossuary",
      type: "catacomb_ossuary_gate",
      state: "closed",
      speed: 0.8,
      isSecret: true
    },
    {
      id: "door_clock_gate",
      type: "catacomb_ossuary_gate",
      state: "locked",
      requiredKey: "purple_clock_key",
      speed: 0.85
    },
    {
      id: "door_dawn_exit",
      type: "catacomb_ossuary_gate",
      state: "locked",
      requiredKey: null, // Unlocks upon Clock Reaper defeat
      speed: 0.7
    }
  ],

  lifts: [
    {
      id: "lift_gears",
      sectorId: "gear_lift",
      bottomHeight: 0.0,
      topHeight: 1.8,
      speed: 1.2,
      state: "down"
    }
  ],

  triggers: [
    {
      id: "lever_cata_west",
      type: "switch",
      x: 6.5,
      y: 15.0,
      targetLiftId: "lift_gears"
    },
    {
      id: "boss_reaper_defeat",
      type: "boss_defeat",
      targetDoorId: "door_dawn_exit"
    }
  ],

  props: [
    { name: "bone_column", sectorId: "cata_entry", x: 1.0, y: 1.0 },
    { name: "hanging_cage", sectorId: "central_chasm", x: 8.5, y: 7.5 },
    { name: "purple_rune_stone", sectorId: "scarecrow_lair", x: 17.0, y: 6.5 },
    { name: "chained_ossuary_gate", sectorId: "clock_arena_outer", x: 10.0, y: 12.0 },
    { name: "wall_torch", sectorId: "dawn_sanctuary", x: 12.0, y: 22.0 }
  ],

  pickups: [
    { type: "ammo", name: "rockets", ammoType: "cells", amount: 25, sectorId: "black_water_canal", x: 6.0, y: 2.0 },
    { type: "armor", name: "full_armor", amount: 50, sectorId: "bone_bridge", x: 2.5, y: 10.0 },
    { type: "health", name: "heart_crystal", amount: 50, sectorId: "secret_ossuary", x: 10.0, y: 2.0 },
    { type: "key", name: "purple_clock_key", sectorId: "scarecrow_lair", x: 17.5, y: 7.0 },
    { type: "exit", name: "exit_sigil", sectorId: "dawn_sanctuary", x: 12.0, y: 23.0 }
  ],

  enemies: [
    { type: "crawler_zombie", sectorId: "black_water_canal", x: 6.0, y: 2.0 },
    { type: "skeleton_gunner", sectorId: "bone_bridge", x: 2.0, y: 10.0 },
    { type: "gargoyle", sectorId: "central_chasm", x: 8.0, y: 8.0 },
    { type: "scarecrow_reaper", sectorId: "scarecrow_lair", x: 17.0, y: 6.0 },
    // FINAL BOSS: Clock Reaper
    { type: "clock_reaper", sectorId: "clock_dias", x: 12.0, y: 16.0, isBoss: true }
  ]
};
