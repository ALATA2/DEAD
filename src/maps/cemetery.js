// cemetery.js - Livello 2: Il Cimitero dei Senza Nome
// Complies with §6 & §7:
// >=14 sectors, >=4 floor heights, open graves, mausoleums, balconies, iron gate, dual switches, Pumpkin King Boss, Orange Pumpkin Key

export const cemeteryMap = {
  id: "cemetery_02",
  title: "Il Cimitero dei Senza Nome",
  area: "cemetery",
  panorama: "cemetery",
  start: { x: 2.0, y: 2.0, angle: 0, sectorId: "cem_gate" },

  sectors: [
    // 0. Cemetery Gate Entrance
    {
      id: "cem_gate",
      floorHeight: 0.0,
      ceilingHeight: 4.5,
      floorTexture: "uneven_cobblestones",
      ceilingTexture: "moonlit_storm_sky",
      light: 0.85,
      fog: "#1a2536"
    },
    // 1. Sunken Grave (Depth -0.5)
    {
      id: "sunken_grave",
      floorHeight: -0.5,
      ceilingHeight: 4.5,
      floorTexture: "fresh_grave_soil",
      ceilingTexture: "moonlit_storm_sky",
      light: 0.7,
      fog: "#1a2536"
    },
    // 2. Central Cobblestone Way
    {
      id: "central_path",
      floorHeight: 0.0,
      ceilingHeight: 4.5,
      floorTexture: "uneven_cobblestones",
      ceilingTexture: "moonlit_storm_sky",
      light: 0.8,
      fog: "#1a2536"
    },
    // 3. Elevated Tomb Terraces (Stair step 1)
    {
      id: "tomb_step_1",
      floorHeight: 0.45,
      ceilingHeight: 4.5,
      floorTexture: "cracked_flagstones",
      ceilingTexture: "moonlit_storm_sky",
      light: 0.85,
      fog: "#1a2536"
    },
    // 4. Elevated Tomb Terraces (Stair step 2)
    {
      id: "tomb_step_2",
      floorHeight: 0.90,
      ceilingHeight: 4.5,
      floorTexture: "cracked_flagstones",
      ceilingTexture: "moonlit_storm_sky",
      light: 0.85,
      fog: "#1a2536"
    },
    // 5. Sniper Balcony Terrace
    {
      id: "sniper_balcony",
      floorHeight: 1.40,
      ceilingHeight: 4.5,
      floorTexture: "purple_mausoleum_stone",
      ceilingTexture: "moonlit_storm_sky",
      light: 0.9,
      fog: "#1a2536"
    },
    // 6. Western Mausoleum Interior (Switch 1 inside)
    {
      id: "west_mausoleum",
      floorHeight: 0.2,
      ceilingHeight: 2.8,
      floorTexture: "cracked_flagstones",
      ceilingTexture: "purple_mausoleum_stone",
      light: 0.65,
      fog: "#2b143a",
      isSky: false
    },
    // 7. Eastern Crypt Sarcophagus Room (Secret Door & Switch 2)
    {
      id: "east_secret_tomb",
      floorHeight: -0.2,
      ceilingHeight: 2.6,
      floorTexture: "fresh_grave_soil",
      ceilingTexture: "mossy_gray_bricks",
      light: 0.55,
      fog: "#152016",
      isSky: false
    },
    // 8. Outer Circular Path around Arena
    {
      id: "outer_loop",
      floorHeight: 0.0,
      ceilingHeight: 4.5,
      floorTexture: "dead_grass",
      ceilingTexture: "moonlit_storm_sky",
      light: 0.8,
      fog: "#1a2536"
    },
    // 9. Mausoleum Lift (Platform moving between ground and balcony)
    {
      id: "mausoleum_lift",
      floorHeight: 0.0,
      ceilingHeight: 4.5,
      floorTexture: "purple_mausoleum_stone",
      ceilingTexture: "moonlit_storm_sky",
      light: 0.85,
      fog: "#1a2536"
    },
    // 10. Pumpkin King Central Arena (Sunken Ring)
    {
      id: "pumpkin_arena",
      floorHeight: -0.3,
      ceilingHeight: 5.0,
      floorTexture: "uneven_cobblestones",
      ceilingTexture: "moonlit_storm_sky",
      light: 0.85,
      fog: "#351e12"
    },
    // 11. Arena Center Pedestal
    {
      id: "arena_pedestal",
      floorHeight: 0.3,
      ceilingHeight: 5.0,
      floorTexture: "purple_mausoleum_stone",
      ceilingTexture: "moonlit_storm_sky",
      light: 0.95,
      fog: "#351e12"
    },
    // 12. Crypt Stairway Descent
    {
      id: "crypt_descent",
      floorHeight: -1.0,
      ceilingHeight: 3.5,
      floorTexture: "cracked_flagstones",
      ceilingTexture: "mossy_gray_bricks",
      light: 0.6,
      fog: "#141d24",
      isSky: false
    },
    // 13. Crypt Gate Threshold (Destination)
    {
      id: "crypt_threshold",
      floorHeight: -1.5,
      ceilingHeight: 3.2,
      floorTexture: "cracked_flagstones",
      ceilingTexture: "mossy_gray_bricks",
      light: 0.5,
      fog: "#141d24",
      isSky: false
    }
  ],

  edges: [
    // Sector 0: cem_gate (0,0) to (4,4)
    { sectorId: "cem_gate", x1: 0, y1: 0, x2: 4, y2: 0, type: "solid", texture: "mossy_gray_bricks" },
    { sectorId: "cem_gate", x1: 0, y1: 4, x2: 0, y2: 0, type: "solid", texture: "mossy_gray_bricks" },
    { sectorId: "cem_gate", x1: 4, y1: 0, x2: 4, y2: 4, type: "portal", neighborSectorId: "sunken_grave" },
    { sectorId: "cem_gate", x1: 0, y1: 4, x2: 4, y2: 4, type: "portal", neighborSectorId: "central_path", doorId: "door_iron_gate" },

    // Sector 1: sunken_grave (4,0) to (8,4)
    { sectorId: "sunken_grave", x1: 4, y1: 0, x2: 4, y2: 4, type: "portal", neighborSectorId: "cem_gate" },
    { sectorId: "sunken_grave", x1: 4, y1: 0, x2: 8, y2: 0, type: "solid", texture: "mossy_gray_bricks" },
    { sectorId: "sunken_grave", x1: 8, y1: 0, x2: 8, y2: 4, type: "portal", neighborSectorId: "east_secret_tomb", doorId: "door_secret_tomb" },
    { sectorId: "sunken_grave", x1: 4, y1: 4, x2: 8, y2: 4, type: "portal", neighborSectorId: "outer_loop" },

    // Sector 2: central_path (0,4) to (4,8)
    { sectorId: "central_path", x1: 0, y1: 4, x2: 4, y2: 4, type: "portal", neighborSectorId: "cem_gate", doorId: "door_iron_gate" },
    { sectorId: "central_path", x1: 0, y1: 4, x2: 0, y2: 8, type: "portal", neighborSectorId: "tomb_step_1" },
    { sectorId: "central_path", x1: 4, y1: 4, x2: 4, y2: 8, type: "portal", neighborSectorId: "outer_loop" },
    { sectorId: "central_path", x1: 0, y1: 8, x2: 4, y2: 8, type: "portal", neighborSectorId: "pumpkin_arena" },

    // Sector 3: tomb_step_1 (-3,4) to (0,8)
    { sectorId: "tomb_step_1", x1: 0, y1: 4, x2: 0, y2: 8, type: "portal", neighborSectorId: "central_path" },
    { sectorId: "tomb_step_1", x1: -3, y1: 4, x2: 0, y2: 4, type: "solid", texture: "mossy_gray_bricks" },
    { sectorId: "tomb_step_1", x1: -3, y1: 8, x2: 0, y2: 8, type: "solid", texture: "mossy_gray_bricks" },
    { sectorId: "tomb_step_1", x1: -3, y1: 4, x2: -3, y2: 8, type: "portal", neighborSectorId: "tomb_step_2" },

    // Sector 4: tomb_step_2 (-6,4) to (-3,8)
    { sectorId: "tomb_step_2", x1: -3, y1: 4, x2: -3, y2: 8, type: "portal", neighborSectorId: "tomb_step_1" },
    { sectorId: "tomb_step_2", x1: -6, y1: 4, x2: -3, y2: 4, type: "solid", texture: "mossy_gray_bricks" },
    { sectorId: "tomb_step_2", x1: -6, y1: 8, x2: -3, y2: 8, type: "solid", texture: "mossy_gray_bricks" },
    { sectorId: "tomb_step_2", x1: -6, y1: 4, x2: -6, y2: 8, type: "portal", neighborSectorId: "sniper_balcony" },

    // Sector 5: sniper_balcony (-10,4) to (-6,12)
    { sectorId: "sniper_balcony", x1: -6, y1: 4, x2: -6, y2: 8, type: "portal", neighborSectorId: "tomb_step_2" },
    { sectorId: "sniper_balcony", x1: -10, y1: 4, x2: -6, y2: 4, type: "solid", texture: "purple_mausoleum_stone" },
    { sectorId: "sniper_balcony", x1: -10, y1: 4, x2: -10, y2: 12, type: "solid", texture: "purple_mausoleum_stone" },
    { sectorId: "sniper_balcony", x1: -10, y1: 12, x2: -6, y2: 12, type: "portal", neighborSectorId: "west_mausoleum" },
    { sectorId: "sniper_balcony", x1: -6, y1: 8, x2: -6, y2: 12, type: "solid", texture: "iron_bars" },

    // Sector 6: west_mausoleum (-10,12) to (-6,16) (contains switch 1)
    { sectorId: "west_mausoleum", x1: -10, y1: 12, x2: -6, y2: 12, type: "portal", neighborSectorId: "sniper_balcony" },
    { sectorId: "west_mausoleum", x1: -10, y1: 12, x2: -10, y2: 16, type: "solid", texture: "purple_mausoleum_stone" },
    { sectorId: "west_mausoleum", x1: -10, y1: 16, x2: -6, y2: 16, type: "solid", texture: "purple_mausoleum_stone" },
    { sectorId: "west_mausoleum", x1: -6, y1: 12, x2: -6, y2: 16, type: "solid", texture: "purple_mausoleum_stone" },

    // Sector 7: east_secret_tomb (8,0) to (12,4) (contains switch 2)
    { sectorId: "east_secret_tomb", x1: 8, y1: 0, x2: 8, y2: 4, type: "portal", neighborSectorId: "sunken_grave", doorId: "door_secret_tomb" },
    { sectorId: "east_secret_tomb", x1: 8, y1: 0, x2: 12, y2: 0, type: "solid", texture: "mossy_gray_bricks" },
    { sectorId: "east_secret_tomb", x1: 12, y1: 0, x2: 12, y2: 4, type: "solid", texture: "mossy_gray_bricks" },
    { sectorId: "east_secret_tomb", x1: 8, y1: 4, x2: 12, y2: 4, type: "solid", texture: "mossy_gray_bricks" },

    // Sector 8: outer_loop (4,4) to (10,12)
    { sectorId: "outer_loop", x1: 4, y1: 4, x2: 8, y2: 4, type: "portal", neighborSectorId: "sunken_grave" },
    { sectorId: "outer_loop", x1: 4, y1: 4, x2: 4, y2: 8, type: "portal", neighborSectorId: "central_path" },
    { sectorId: "outer_loop", x1: 8, y1: 4, x2: 10, y2: 4, type: "solid", texture: "mossy_gray_bricks" },
    { sectorId: "outer_loop", x1: 10, y1: 4, x2: 10, y2: 10, type: "solid", texture: "mossy_gray_bricks" },
    { sectorId: "outer_loop", x1: 10, y1: 10, x2: 10, y2: 12, type: "portal", neighborSectorId: "mausoleum_lift" },
    { sectorId: "outer_loop", x1: 4, y1: 8, x2: 4, y2: 12, type: "portal", neighborSectorId: "pumpkin_arena" },
    { sectorId: "outer_loop", x1: 4, y1: 12, x2: 10, y2: 12, type: "solid", texture: "mossy_gray_bricks" },

    // Sector 9: mausoleum_lift (10,10) to (13,12)
    { sectorId: "mausoleum_lift", x1: 10, y1: 10, x2: 10, y2: 12, type: "portal", neighborSectorId: "outer_loop" },
    { sectorId: "mausoleum_lift", x1: 10, y1: 10, x2: 13, y2: 10, type: "solid", texture: "purple_mausoleum_stone" },
    { sectorId: "mausoleum_lift", x1: 13, y1: 10, x2: 13, y2: 12, type: "solid", texture: "purple_mausoleum_stone" },
    { sectorId: "mausoleum_lift", x1: 10, y1: 12, x2: 13, y2: 12, type: "solid", texture: "purple_mausoleum_stone" },

    // Sector 10: pumpkin_arena (0,8) to (6,15)
    { sectorId: "pumpkin_arena", x1: 0, y1: 8, x2: 4, y2: 8, type: "portal", neighborSectorId: "central_path" },
    { sectorId: "pumpkin_arena", x1: 4, y1: 8, x2: 4, y2: 12, type: "portal", neighborSectorId: "outer_loop" },
    { sectorId: "pumpkin_arena", x1: 0, y1: 8, x2: 0, y2: 15, type: "solid", texture: "purple_mausoleum_stone" },
    { sectorId: "pumpkin_arena", x1: 4, y1: 12, x2: 6, y2: 12, type: "solid", texture: "purple_mausoleum_stone" },
    { sectorId: "pumpkin_arena", x1: 6, y1: 12, x2: 6, y2: 15, type: "solid", texture: "purple_mausoleum_stone" },
    { sectorId: "pumpkin_arena", x1: 0, y1: 15, x2: 2, y2: 15, type: "solid", texture: "purple_mausoleum_stone" },
    { sectorId: "pumpkin_arena", x1: 2, y1: 15, x2: 4, y2: 15, type: "portal", neighborSectorId: "crypt_descent", doorId: "door_crypt_gate" },
    { sectorId: "pumpkin_arena", x1: 4, y1: 15, x2: 6, y2: 15, type: "solid", texture: "purple_mausoleum_stone" },

    // Sector 11: arena_pedestal (2,10) to (4,12) inside arena
    { sectorId: "arena_pedestal", x1: 2, y1: 10, x2: 4, y2: 10, type: "portal", neighborSectorId: "pumpkin_arena" },
    { sectorId: "arena_pedestal", x1: 4, y1: 10, x2: 4, y2: 12, type: "portal", neighborSectorId: "pumpkin_arena" },
    { sectorId: "arena_pedestal", x1: 2, y1: 12, x2: 4, y2: 12, type: "portal", neighborSectorId: "pumpkin_arena" },
    { sectorId: "arena_pedestal", x1: 2, y1: 10, x2: 2, y2: 12, type: "portal", neighborSectorId: "pumpkin_arena" },

    // Sector 12: crypt_descent (2,15) to (4,18)
    { sectorId: "crypt_descent", x1: 2, y1: 15, x2: 4, y2: 15, type: "portal", neighborSectorId: "pumpkin_arena", doorId: "door_crypt_gate" },
    { sectorId: "crypt_descent", x1: 2, y1: 15, x2: 2, y2: 18, type: "solid", texture: "mossy_gray_bricks" },
    { sectorId: "crypt_descent", x1: 4, y1: 15, x2: 4, y2: 18, type: "solid", texture: "mossy_gray_bricks" },
    { sectorId: "crypt_descent", x1: 2, y1: 18, x2: 4, y2: 18, type: "portal", neighborSectorId: "crypt_threshold" },

    // Sector 13: crypt_threshold (2,18) to (4,21)
    { sectorId: "crypt_threshold", x1: 2, y1: 18, x2: 4, y2: 18, type: "portal", neighborSectorId: "crypt_descent" },
    { sectorId: "crypt_threshold", x1: 2, y1: 18, x2: 2, y2: 21, type: "solid", texture: "mossy_gray_bricks" },
    { sectorId: "crypt_threshold", x1: 4, y1: 18, x2: 4, y2: 21, type: "solid", texture: "mossy_gray_bricks" },
    { sectorId: "crypt_threshold", x1: 2, y1: 21, x2: 4, y2: 21, type: "solid", texture: "corroded_bronze_door" }
  ],

  doors: [
    {
      id: "door_iron_gate",
      type: "cemetery_iron_gate",
      state: "closed",
      speed: 0.9
    },
    {
      id: "door_secret_tomb",
      type: "cemetery_iron_gate",
      state: "closed",
      speed: 0.8,
      isSecret: true
    },
    {
      id: "door_crypt_gate",
      type: "cemetery_iron_gate",
      state: "locked",
      requiredKey: "orange_pumpkin_key",
      speed: 0.7
    }
  ],

  lifts: [
    {
      id: "lift_cem",
      sectorId: "mausoleum_lift",
      bottomHeight: 0.0,
      topHeight: 1.4,
      speed: 1.1,
      state: "down"
    }
  ],

  triggers: [
    {
      id: "switch_west",
      type: "switch",
      x: -8.0,
      y: 15.0,
      targetDoorId: "door_iron_gate"
    },
    {
      id: "switch_secret",
      type: "switch",
      x: 10.0,
      y: 2.0,
      targetLiftId: "lift_cem"
    }
  ],

  props: [
    { name: "weathered_headstone", sectorId: "cem_gate", x: 1.0, y: 1.0 },
    { name: "gothic_cross", sectorId: "sunken_grave", x: 6.0, y: 2.0 },
    { name: "funeral_candles", sectorId: "west_mausoleum", x: -8.0, y: 14.0 },
    { name: "jack_o_lantern", sectorId: "central_path", x: 2.0, y: 6.0 },
    { name: "gargoyle_pedestal", sectorId: "sniper_balcony", x: -8.0, y: 6.0 },
    { name: "crypt_stair_entrance", sectorId: "crypt_descent", x: 3.0, y: 16.5 }
  ],

  pickups: [
    { type: "weapon", name: "double_barrel_shotgun", weaponId: "double_barrel", sectorId: "east_secret_tomb", x: 10.0, y: 2.0 },
    { type: "ammo", name: "shotgun_shells", ammoType: "shells", amount: 12, sectorId: "sunken_grave", x: 5.0, y: 2.0 },
    { type: "health", name: "medical_satchel", amount: 35, sectorId: "sniper_balcony", x: -8.0, y: 8.0 },
    { type: "ammo", name: "ammo_clip", ammoType: "bullets", amount: 30, sectorId: "west_mausoleum", x: -7.5, y: 13.5 },
    { type: "key", name: "orange_pumpkin_key", sectorId: "arena_pedestal", x: 3.0, y: 11.0 },
    { type: "armor", name: "full_armor", amount: 50, sectorId: "outer_loop", x: 7.0, y: 8.0 },
    { type: "exit", name: "exit_sigil", sectorId: "crypt_threshold", x: 3.0, y: 20.0 }
  ],

  enemies: [
    { type: "zombie_man", sectorId: "sunken_grave", x: 6.0, y: 1.5 },
    { type: "zombie_woman", sectorId: "central_path", x: 2.5, y: 5.5 },
    { type: "skeleton_gunner", sectorId: "sniper_balcony", x: -8.0, y: 6.5 },
    { type: "bloated_zombie", sectorId: "outer_loop", x: 6.0, y: 6.0 },
    { type: "ghost", sectorId: "west_mausoleum", x: -8.0, y: 13.5 },
    { type: "gargoyle", sectorId: "outer_loop", x: 8.0, y: 10.0 },
    // Boss: Pumpkin King
    { type: "pumpkin_king", sectorId: "pumpkin_arena", x: 3.0, y: 13.0, isBoss: true }
  ]
};
