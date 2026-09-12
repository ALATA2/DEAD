// crypt.js - Livello 3: La Cripta delle Ore Spezzate
// Complies with §6 & §7:
// >=14 sectors, >=4 floor heights, slime floor hazard, ritual lift, vertical doors, Red Skull Key, Headless Knight Boss

export const cryptMap = {
  id: "crypt_03",
  title: "La Cripta delle Ore Spezzate",
  area: "crypt",
  panorama: "crypt",
  start: { x: 2.0, y: 2.0, angle: 0, sectorId: "crypt_vestibule" },

  sectors: [
    // 0. Crypt Vestibule
    {
      id: "crypt_vestibule",
      floorHeight: 0.0,
      ceilingHeight: 3.2,
      floorTexture: "worn_floor_slabs",
      ceilingTexture: "ribbed_stone_ceiling",
      light: 0.75,
      fog: "#1c2a1a",
      isSky: false
    },
    // 1. Slime Trench Hazard (Floor -0.4, hazard)
    {
      id: "slime_trench",
      floorHeight: -0.4,
      ceilingHeight: 3.6,
      floorTexture: "slime_floor",
      ceilingTexture: "ribbed_stone_ceiling",
      light: 0.85,
      fog: "#0d2b12",
      hazard: true,
      isSky: false
    },
    // 2. Ceremonial Catwalk Step 1
    {
      id: "catwalk_1",
      floorHeight: 0.35,
      ceilingHeight: 3.6,
      floorTexture: "ceremonial_floor",
      ceilingTexture: "ribbed_stone_ceiling",
      light: 0.7,
      fog: "#1c2a1a",
      isSky: false
    },
    // 3. Ceremonial Catwalk Step 2
    {
      id: "catwalk_2",
      floorHeight: 0.70,
      ceilingHeight: 3.6,
      floorTexture: "ceremonial_floor",
      ceilingTexture: "ribbed_stone_ceiling",
      light: 0.75,
      fog: "#1c2a1a",
      isSky: false
    },
    // 4. Catwalk High Platform
    {
      id: "catwalk_high",
      floorHeight: 1.20,
      ceilingHeight: 4.0,
      floorTexture: "ceremonial_floor",
      ceilingTexture: "ribbed_stone_ceiling",
      light: 0.8,
      fog: "#1c2a1a",
      isSky: false
    },
    // 5. Secret Sarcophagus Alcove
    {
      id: "sarcophagus_alcove",
      floorHeight: 0.0,
      ceilingHeight: 2.6,
      floorTexture: "worn_floor_slabs",
      ceilingTexture: "skull_niches",
      light: 0.45,
      fog: "#151520",
      isSky: false
    },
    // 6. Central Hall
    {
      id: "central_hall",
      floorHeight: 0.0,
      ceilingHeight: 3.8,
      floorTexture: "worn_floor_slabs",
      ceilingTexture: "ribbed_stone_ceiling",
      light: 0.8,
      fog: "#1c2a1a",
      isSky: false
    },
    // 7. Ritual Elevator Platform (Moving Lift)
    {
      id: "ritual_lift",
      floorHeight: 0.0,
      ceilingHeight: 4.2,
      floorTexture: "brass_machinery",
      ceilingTexture: "ribbed_stone_ceiling",
      light: 0.9,
      fog: "#1c2a1a",
      isSky: false
    },
    // 8. Upper Shrine Balcony (Elevated 1.8)
    {
      id: "upper_shrine",
      floorHeight: 1.80,
      ceilingHeight: 4.5,
      floorTexture: "ceremonial_floor",
      ceilingTexture: "ribbed_stone_ceiling",
      light: 0.95,
      fog: "#1c2a1a",
      isSky: false
    },
    // 9. West Seal Chamber (First Green Crystal Seal)
    {
      id: "west_seal",
      floorHeight: 0.2,
      ceilingHeight: 3.2,
      floorTexture: "ceremonial_floor",
      ceilingTexture: "ribbed_stone_ceiling",
      light: 0.85,
      fog: "#0d2b12",
      isSky: false
    },
    // 10. East Seal Chamber (Second Green Crystal Seal)
    {
      id: "east_seal",
      floorHeight: 0.2,
      ceilingHeight: 3.2,
      floorTexture: "ceremonial_floor",
      ceilingTexture: "ribbed_stone_ceiling",
      light: 0.85,
      fog: "#0d2b12",
      isSky: false
    },
    // 11. Grand Boss Hall: Headless Knight Arena
    {
      id: "knight_arena",
      floorHeight: 0.0,
      ceilingHeight: 4.6,
      floorTexture: "ceremonial_floor",
      ceilingTexture: "ribbed_stone_ceiling",
      light: 0.8,
      fog: "#2e1215",
      isSky: false
    },
    // 12. Boss Altar Podium
    {
      id: "boss_podium",
      floorHeight: 0.8,
      ceilingHeight: 4.6,
      floorTexture: "ceremonial_floor",
      ceilingTexture: "ribbed_stone_ceiling",
      light: 0.95,
      fog: "#2e1215",
      isSky: false
    },
    // 13. Catacombs Stairway Passage (Exit)
    {
      id: "catacomb_stair_exit",
      floorHeight: -1.2,
      ceilingHeight: 3.0,
      floorTexture: "dusty_flagstones",
      ceilingTexture: "ribbed_stone_ceiling",
      light: 0.5,
      fog: "#1a1622",
      isSky: false
    }
  ],

  edges: [
    // Sector 0: crypt_vestibule (0,0) to (4,4)
    { sectorId: "crypt_vestibule", x1: 0, y1: 0, x2: 4, y2: 0, type: "solid", texture: "arched_recesses" },
    { sectorId: "crypt_vestibule", x1: 0, y1: 4, x2: 0, y2: 0, type: "solid", texture: "arched_recesses" },
    { sectorId: "crypt_vestibule", x1: 4, y1: 0, x2: 4, y2: 4, type: "portal", neighborSectorId: "slime_trench" },
    { sectorId: "crypt_vestibule", x1: 0, y1: 4, x2: 4, y2: 4, type: "portal", neighborSectorId: "catwalk_1" },

    // Sector 1: slime_trench (4,0) to (8,4)
    { sectorId: "slime_trench", x1: 4, y1: 0, x2: 4, y2: 4, type: "portal", neighborSectorId: "crypt_vestibule" },
    { sectorId: "slime_trench", x1: 4, y1: 0, x2: 8, y2: 0, type: "solid", texture: "skull_niches" },
    { sectorId: "slime_trench", x1: 8, y1: 0, x2: 8, y2: 4, type: "portal", neighborSectorId: "sarcophagus_alcove", doorId: "door_sarcophagus" },
    { sectorId: "slime_trench", x1: 4, y1: 4, x2: 8, y2: 4, type: "portal", neighborSectorId: "central_hall" },

    // Sector 2: catwalk_1 (0,4) to (4,6)
    { sectorId: "catwalk_1", x1: 0, y1: 4, x2: 4, y2: 4, type: "portal", neighborSectorId: "crypt_vestibule" },
    { sectorId: "catwalk_1", x1: 0, y1: 4, x2: 0, y2: 6, type: "solid", texture: "occult_rune_wall" },
    { sectorId: "catwalk_1", x1: 4, y1: 4, x2: 4, y2: 6, type: "solid", texture: "arched_recesses" },
    { sectorId: "catwalk_1", x1: 0, y1: 6, x2: 4, y2: 6, type: "portal", neighborSectorId: "catwalk_2" },

    // Sector 3: catwalk_2 (0,6) to (4,8)
    { sectorId: "catwalk_2", x1: 0, y1: 6, x2: 4, y2: 6, type: "portal", neighborSectorId: "catwalk_1" },
    { sectorId: "catwalk_2", x1: 0, y1: 6, x2: 0, y2: 8, type: "solid", texture: "occult_rune_wall" },
    { sectorId: "catwalk_2", x1: 4, y1: 6, x2: 4, y2: 8, type: "solid", texture: "arched_recesses" },
    { sectorId: "catwalk_2", x1: 0, y1: 8, x2: 4, y2: 8, type: "portal", neighborSectorId: "catwalk_high" },

    // Sector 4: catwalk_high (0,8) to (5,12)
    { sectorId: "catwalk_high", x1: 0, y1: 8, x2: 4, y2: 8, type: "portal", neighborSectorId: "catwalk_2" },
    { sectorId: "catwalk_high", x1: 0, y1: 8, x2: 0, y2: 12, type: "solid", texture: "occult_rune_wall" },
    { sectorId: "catwalk_high", x1: 0, y1: 12, x2: 5, y2: 12, type: "solid", texture: "arched_recesses" },
    { sectorId: "catwalk_high", x1: 5, y1: 8, x2: 5, y2: 12, type: "portal", neighborSectorId: "central_hall" },
    { sectorId: "catwalk_high", x1: 4, y1: 8, x2: 5, y2: 8, type: "solid", texture: "arched_recesses" },

    // Sector 5: sarcophagus_alcove (8,0) to (12,4)
    { sectorId: "sarcophagus_alcove", x1: 8, y1: 0, x2: 8, y2: 4, type: "portal", neighborSectorId: "slime_trench", doorId: "door_sarcophagus" },
    { sectorId: "sarcophagus_alcove", x1: 8, y1: 0, x2: 12, y2: 0, type: "solid", texture: "skull_niches" },
    { sectorId: "sarcophagus_alcove", x1: 12, y1: 0, x2: 12, y2: 4, type: "solid", texture: "skull_niches" },
    { sectorId: "sarcophagus_alcove", x1: 8, y1: 4, x2: 12, y2: 4, type: "solid", texture: "skull_niches" },

    // Sector 6: central_hall (5,4) to (12,12)
    { sectorId: "central_hall", x1: 4, y1: 4, x2: 8, y2: 4, type: "portal", neighborSectorId: "slime_trench" },
    { sectorId: "central_hall", x1: 5, y1: 8, x2: 5, y2: 12, type: "portal", neighborSectorId: "catwalk_high" },
    { sectorId: "central_hall", x1: 5, y1: 4, x2: 5, y2: 8, type: "solid", texture: "arched_recesses" },
    { sectorId: "central_hall", x1: 8, y1: 4, x2: 12, y2: 4, type: "portal", neighborSectorId: "east_seal" },
    { sectorId: "central_hall", x1: 12, y1: 4, x2: 12, y2: 9, type: "portal", neighborSectorId: "ritual_lift" },
    { sectorId: "central_hall", x1: 12, y1: 9, x2: 12, y2: 12, type: "solid", texture: "arched_recesses" },
    { sectorId: "central_hall", x1: 5, y1: 12, x2: 8, y2: 12, type: "portal", neighborSectorId: "west_seal" },
    { sectorId: "central_hall", x1: 8, y1: 12, x2: 12, y2: 12, type: "portal", neighborSectorId: "knight_arena", doorId: "door_crypt_vertical" },

    // Sector 7: ritual_lift (12,4) to (15,9)
    { sectorId: "ritual_lift", x1: 12, y1: 4, x2: 12, y2: 9, type: "portal", neighborSectorId: "central_hall" },
    { sectorId: "ritual_lift", x1: 12, y1: 4, x2: 15, y2: 4, type: "solid", texture: "brass_machinery" },
    { sectorId: "ritual_lift", x1: 15, y1: 4, x2: 15, y2: 9, type: "portal", neighborSectorId: "upper_shrine" },
    { sectorId: "ritual_lift", x1: 12, y1: 9, x2: 15, y2: 9, type: "solid", texture: "brass_machinery" },

    // Sector 8: upper_shrine (15,4) to (19,9) (Contains Red Skull Key!)
    { sectorId: "upper_shrine", x1: 15, y1: 4, x2: 15, y2: 9, type: "portal", neighborSectorId: "ritual_lift" },
    { sectorId: "upper_shrine", x1: 15, y1: 4, x2: 19, y2: 4, type: "solid", texture: "occult_rune_wall" },
    { sectorId: "upper_shrine", x1: 19, y1: 4, x2: 19, y2: 9, type: "solid", texture: "occult_rune_wall" },
    { sectorId: "upper_shrine", x1: 15, y1: 9, x2: 19, y2: 9, type: "solid", texture: "occult_rune_wall" },

    // Sector 9: west_seal (5,12) to (8,16)
    { sectorId: "west_seal", x1: 5, y1: 12, x2: 8, y2: 12, type: "portal", neighborSectorId: "central_hall" },
    { sectorId: "west_seal", x1: 5, y1: 12, x2: 5, y2: 16, type: "solid", texture: "green_ritual_portal" },
    { sectorId: "west_seal", x1: 5, y1: 16, x2: 8, y2: 16, type: "solid", texture: "skull_niches" },
    { sectorId: "west_seal", x1: 8, y1: 12, x2: 8, y2: 16, type: "solid", texture: "arched_recesses" },

    // Sector 10: east_seal (8,0) to (12,4) - offset to east
    { sectorId: "east_seal", x1: 8, y1: 4, x2: 12, y2: 4, type: "portal", neighborSectorId: "central_hall" },
    { sectorId: "east_seal", x1: 12, y1: 4, x2: 12, y2: 0, type: "solid", texture: "green_ritual_portal" },
    { sectorId: "east_seal", x1: 8, y1: 0, x2: 12, y2: 0, type: "solid", texture: "skull_niches" },
    { sectorId: "east_seal", x1: 8, y1: 0, x2: 8, y2: 4, type: "solid", texture: "arched_recesses" },

    // Sector 11: knight_arena (8,12) to (16,20)
    { sectorId: "knight_arena", x1: 8, y1: 12, x2: 12, y2: 12, type: "portal", neighborSectorId: "central_hall", doorId: "door_crypt_vertical" },
    { sectorId: "knight_arena", x1: 12, y1: 12, x2: 16, y2: 12, type: "solid", texture: "occult_rune_wall" },
    { sectorId: "knight_arena", x1: 8, y1: 12, x2: 8, y2: 20, type: "solid", texture: "occult_rune_wall" },
    { sectorId: "knight_arena", x1: 16, y1: 12, x2: 16, y2: 20, type: "solid", texture: "occult_rune_wall" },
    { sectorId: "knight_arena", x1: 8, y1: 20, x2: 11, y2: 20, type: "solid", texture: "occult_rune_wall" },
    { sectorId: "knight_arena", x1: 11, y1: 20, x2: 13, y2: 20, type: "portal", neighborSectorId: "catacomb_stair_exit", doorId: "door_catacomb_exit" },
    { sectorId: "knight_arena", x1: 13, y1: 20, x2: 16, y2: 20, type: "solid", texture: "occult_rune_wall" },

    // Sector 12: boss_podium (11,15) to (13,17) inside arena
    { sectorId: "boss_podium", x1: 11, y1: 15, x2: 13, y2: 15, type: "portal", neighborSectorId: "knight_arena" },
    { sectorId: "boss_podium", x1: 13, y1: 15, x2: 13, y2: 17, type: "portal", neighborSectorId: "knight_arena" },
    { sectorId: "boss_podium", x1: 11, y1: 17, x2: 13, y2: 17, type: "portal", neighborSectorId: "knight_arena" },
    { sectorId: "boss_podium", x1: 11, y1: 15, x2: 11, y2: 17, type: "portal", neighborSectorId: "knight_arena" },

    // Sector 13: catacomb_stair_exit (11,20) to (13,24)
    { sectorId: "catacomb_stair_exit", x1: 11, y1: 20, x2: 13, y2: 20, type: "portal", neighborSectorId: "knight_arena", doorId: "door_catacomb_exit" },
    { sectorId: "catacomb_stair_exit", x1: 11, y1: 20, x2: 11, y2: 24, type: "solid", texture: "arched_recesses" },
    { sectorId: "catacomb_stair_exit", x1: 13, y1: 20, x2: 13, y2: 24, type: "solid", texture: "arched_recesses" },
    { sectorId: "catacomb_stair_exit", x1: 11, y1: 24, x2: 13, y2: 24, type: "solid", texture: "iron_crypt_door" }
  ],

  doors: [
    {
      id: "door_sarcophagus",
      type: "crypt_vertical_door",
      state: "closed",
      speed: 0.8,
      isSecret: true
    },
    {
      id: "door_crypt_vertical",
      type: "crypt_vertical_door",
      state: "closed",
      speed: 0.85
    },
    {
      id: "door_catacomb_exit",
      type: "crypt_vertical_door",
      state: "locked",
      requiredKey: "red_skull_key",
      speed: 0.7
    }
  ],

  lifts: [
    {
      id: "lift_ritual",
      sectorId: "ritual_lift",
      bottomHeight: 0.0,
      topHeight: 1.8,
      speed: 1.2,
      state: "down"
    }
  ],

  triggers: [
    {
      id: "lever_west",
      type: "switch",
      x: 6.5,
      y: 15.0,
      targetDoorId: "door_crypt_vertical"
    }
  ],

  props: [
    { name: "carved_column", sectorId: "crypt_vestibule", x: 1.0, y: 1.0 },
    { name: "green_crystal_pedestal", sectorId: "west_seal", x: 6.5, y: 14.0 },
    { name: "green_summoning_portal", sectorId: "east_seal", x: 10.0, y: 2.0 },
    { name: "sarcophagus_closed", sectorId: "sarcophagus_alcove", x: 10.0, y: 2.0 },
    { name: "catacomb_stairway", sectorId: "catacomb_stair_exit", x: 12.0, y: 22.0 }
  ],

  pickups: [
    { type: "weapon", name: "gothic_crossbow", weaponId: "crossbow", sectorId: "catwalk_high", x: 2.5, y: 10.0 },
    { type: "ammo", name: "occult_energy_cell", ammoType: "cells", amount: 20, sectorId: "slime_trench", x: 6.0, y: 2.0 },
    { type: "health", name: "heart_crystal", amount: 50, sectorId: "sarcophagus_alcove", x: 10.0, y: 1.5 },
    { type: "key", name: "red_skull_key", sectorId: "upper_shrine", x: 17.0, y: 6.5 },
    { type: "ammo", name: "bullet_box", ammoType: "bullets", amount: 50, sectorId: "central_hall", x: 8.0, y: 7.0 },
    { type: "exit", name: "exit_sigil", sectorId: "catacomb_stair_exit", x: 12.0, y: 23.0 }
  ],

  enemies: [
    { type: "crawler_zombie", sectorId: "slime_trench", x: 6.0, y: 2.0 },
    { type: "skeleton_gunner", sectorId: "catwalk_high", x: 2.0, y: 10.0 },
    { type: "ghost", sectorId: "central_hall", x: 8.0, y: 8.0 },
    { type: "pumpkin_mage", sectorId: "west_seal", x: 6.5, y: 13.5 },
    { type: "gargoyle", sectorId: "upper_shrine", x: 17.0, y: 6.0 },
    // Boss: Headless Knight
    { type: "headless_knight", sectorId: "knight_arena", x: 12.0, y: 16.0, isBoss: true }
  ]
};
