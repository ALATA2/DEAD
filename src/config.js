// DEAD : THE HALLOWEEN MASSACRE - Configuration and Global Enums

export const CONFIG = {
  TITLE: "DEAD : THE HALLOWEEN MASSACRE",
  INTERNAL_WIDTH: 384,
  INTERNAL_HEIGHT: 216,
  FOV: 70 * (Math.PI / 180),
  MAX_RENDER_DISTANCE: 38.0,
  EYE_HEIGHT: 1.55, // Relative to floor
  STEP_MAX_HEIGHT: 0.55, // Can walk up steps <= 0.55 units high without jumping
  PLAYER_RADIUS: 0.35,
  GRAVITY: 24.0,
  FRICTION: 11.0,
  MOVE_SPEED: 4.8,
  RUN_SPEED: 7.4,
  MOUSE_SENSITIVITY: 0.0022,
};

export const WEAPONS = {
  axe: {
    id: 'axe',
    name: 'Accetta del Boscaiolo',
    slot: 1,
    ammoType: null,
    cost: 0,
    damage: 50,
    range: 1.9,
    cooldown: 0.45,
    pickupSprite: 'pickups/15_woodsman_axe.png'
  },
  pistol: {
    id: 'pistol',
    name: 'Pistola Gotica',
    slot: 2,
    ammoType: 'bullets',
    cost: 1,
    damage: 24,
    spread: 0.02,
    range: 30,
    cooldown: 0.30,
    pickupSprite: 'pickups/11_pistol.png'
  },
  shotgun: {
    id: 'shotgun',
    name: 'Fucile a Pompa',
    slot: 3,
    ammoType: 'shells',
    cost: 1,
    damage: 15,
    pellets: 7,
    spread: 0.08,
    range: 22,
    cooldown: 0.85,
    pickupSprite: 'pickups/12_shotgun.png'
  },
  double_barrel: {
    id: 'double_barrel',
    name: 'Doppietta Infernale',
    slot: 4,
    ammoType: 'shells',
    cost: 2,
    damage: 16,
    pellets: 14,
    spread: 0.14,
    range: 18,
    cooldown: 1.25,
    pickupSprite: 'pickups/13_double_barrel_shotgun.png'
  },
  crossbow: {
    id: 'crossbow',
    name: 'Balestra Gotica Esoterica',
    slot: 5,
    ammoType: 'cells',
    cost: 1,
    damage: 80,
    projectile: 'bullet',
    speed: 16,
    cooldown: 0.7,
    pickupSprite: 'pickups/14_gothic_crossbow.png'
  }
};

export const ENEMY_ARCHETYPES = {
  werewolf: {
    name: "Werewolf",
    hp: 120,
    speed: 3.4,
    damage: 25,
    attackRange: 1.5,
    isRanged: false,
    scale: 1.0,
    radius: 0.45
  },
  giant_spider: {
    name: "Giant Spider",
    hp: 75,
    speed: 3.7,
    damage: 18,
    attackRange: 1.2,
    isRanged: false,
    scale: 0.85,
    radius: 0.45
  },
  witch: {
    name: "Witch",
    hp: 95,
    speed: 2.2,
    damage: 20,
    attackRange: 14.0,
    isRanged: true,
    projectile: "acid_orb",
    projectileSpeed: 8.5,
    cooldown: 1.6,
    scale: 0.95,
    radius: 0.35
  },
  scarecrow_reaper: {
    name: "Scarecrow Reaper",
    hp: 280,
    speed: 2.7,
    damage: 35,
    attackRange: 12.0,
    isRanged: true,
    projectile: "spinning_scythe",
    projectileSpeed: 9.0,
    cooldown: 1.8,
    scale: 1.15,
    radius: 0.5
  },
  zombie_man: {
    name: "Zombie Man",
    hp: 65,
    speed: 1.6,
    damage: 14,
    attackRange: 1.2,
    isRanged: false,
    scale: 0.95,
    radius: 0.35
  },
  zombie_woman: {
    name: "Zombie Woman",
    hp: 55,
    speed: 1.8,
    damage: 14,
    attackRange: 1.2,
    isRanged: false,
    scale: 0.92,
    radius: 0.35
  },
  bloated_zombie: {
    name: "Bloated Zombie",
    hp: 150,
    speed: 1.3,
    damage: 22,
    attackRange: 10.0,
    isRanged: true,
    projectile: "acid_bolt",
    projectileSpeed: 7.5,
    cooldown: 2.2,
    scale: 1.1,
    radius: 0.55
  },
  skeleton_gunner: {
    name: "Skeleton Gunner",
    hp: 70,
    speed: 2.0,
    damage: 12,
    attackRange: 15.0,
    isRanged: true,
    projectile: "bullet",
    projectileSpeed: 14.0,
    cooldown: 1.3,
    scale: 0.95,
    radius: 0.35
  },
  ghost: {
    name: "Ghost",
    hp: 85,
    speed: 2.8,
    damage: 18,
    attackRange: 11.0,
    isRanged: true,
    projectile: "ghost_skull",
    projectileSpeed: 8.0,
    cooldown: 1.9,
    scale: 1.0,
    radius: 0.35,
    flying: true
  },
  gargoyle: {
    name: "Gargoyle",
    hp: 125,
    speed: 3.0,
    damage: 20,
    attackRange: 12.0,
    isRanged: true,
    projectile: "stone_shard",
    projectileSpeed: 10.0,
    cooldown: 1.5,
    scale: 1.0,
    radius: 0.4,
    flying: true
  },
  pumpkin_mage: {
    name: "Pumpkin Mage",
    hp: 100,
    speed: 2.1,
    damage: 24,
    attackRange: 13.0,
    isRanged: true,
    projectile: "pumpkin_fireball",
    projectileSpeed: 8.5,
    cooldown: 1.7,
    scale: 0.98,
    radius: 0.38
  },
  crawler_zombie: {
    name: "Crawler Zombie",
    hp: 50,
    speed: 2.4,
    damage: 16,
    attackRange: 1.0,
    isRanged: false,
    scale: 0.7,
    radius: 0.4
  },
  pumpkin_king: {
    name: "Pumpkin King",
    hp: 650,
    speed: 2.3,
    damage: 35,
    attackRange: 14.0,
    isRanged: true,
    projectile: "pumpkin_fireball",
    projectileSpeed: 10.0,
    cooldown: 1.2,
    scale: 1.45,
    radius: 0.75,
    isBoss: true
  },
  headless_knight: {
    name: "Headless Knight",
    hp: 750,
    speed: 2.6,
    damage: 40,
    attackRange: 12.0,
    isRanged: true,
    projectile: "blood_slash",
    projectileSpeed: 11.0,
    cooldown: 1.3,
    scale: 1.4,
    radius: 0.7,
    isBoss: true
  },
  clock_reaper: {
    name: "Clock Reaper",
    hp: 1100,
    speed: 2.8,
    damage: 45,
    attackRange: 16.0,
    isRanged: true,
    projectile: "time_moon",
    projectileSpeed: 12.0,
    cooldown: 1.0,
    scale: 1.55,
    radius: 0.8,
    isBoss: true
  }
};
