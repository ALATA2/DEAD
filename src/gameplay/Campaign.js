// Campaign.js - Manages progression across the 4 levels, intermission stats, and victory/game-over screens (§6, §16)

import { forestMap } from '../maps/forest.js';
import { cemeteryMap } from '../maps/cemetery.js';
import { cryptMap } from '../maps/crypt.js';
import { catacombsMap } from '../maps/catacombs.js';
import { MapLoader } from '../world/MapLoader.js';
import { Player } from '../entities/Player.js';
import { Enemy } from '../entities/Enemy.js';
import { Pickup } from '../entities/Pickup.js';
import { WeaponSystem } from './Weapons.js';
import { SaveSystem } from './SaveSystem.js';
import { sound } from '../engine/AudioManager.js';

export class Campaign {
  constructor(game) {
    this.game = game;
    this.levelMaps = [forestMap, cemeteryMap, cryptMap, catacombsMap];
    this.currentLevelIndex = 0;

    this.world = null;
    this.player = null;
    this.weapons = null;
    this.enemies = [];
    this.projectiles = [];
    this.pickups = [];

    this.levelTime = 0;
    this.state = 'playing'; // 'playing', 'intermission', 'victory', 'game_over'
  }

  startLevel(index) {
    this.currentLevelIndex = index;
    const mapData = this.levelMaps[index];
    this.world = MapLoader.loadMap(mapData);

    // Retain weapons and ammo from previous level if continuing
    let prevWeapons = ['axe', 'pistol'];
    let prevAmmo = { bullets: 40, shells: 8, cells: 0 };
    let prevHealth = 100;
    let prevArmor = 25;

    if (this.player) {
      prevWeapons = [...this.player.weapons];
      prevAmmo = { ...this.player.ammo };
      prevHealth = Math.max(50, this.player.health);
      prevArmor = this.player.armor;
    }

    // Initialize player at start position
    this.player = new Player(this.world.start);
    this.player.weapons = prevWeapons;
    this.player.ammo = prevAmmo;
    this.player.health = prevHealth;
    this.player.armor = prevArmor;

    // Locate player's starting sector
    this.player.currentSector = this.world.sectors.get(this.world.start.sectorId) ||
      MapLoader.findSectorAt(this.world.sectors, this.player.x, this.player.y);
    if (this.player.currentSector) {
      this.player.z = this.player.currentSector.floorHeight + 1.6;
    }

    this.weapons = new WeaponSystem(this.player);

    // Initialize enemies
    this.enemies = [];
    for (const ed of this.world.enemies) {
      const enemy = new Enemy(ed);
      enemy.currentSector = this.world.sectors.get(ed.sectorId);
      this.enemies.push(enemy);
    }

    // Initialize pickups
    this.pickups = [];
    for (const pk of this.world.pickups) {
      this.pickups.push(new Pickup(pk));
    }

    this.projectiles = [];
    this.levelTime = 0;
    this.state = 'playing';

    console.log(`[Campaign] Started Level ${index + 1}: ${this.world.title}`);
  }

  onExitReached() {
    SaveSystem.completeLevel(this.currentLevelIndex, this.levelTime);
    sound.playSecretFound();

    if (this.currentLevelIndex < this.levelMaps.length - 1) {
      this.state = 'intermission';
    } else {
      // Completed all 4 levels! Final Dawn Victory (§16)
      this.state = 'victory';
      this.player.setFaceState('11_victory', 9999);
    }
  }

  nextLevel() {
    if (this.currentLevelIndex < this.levelMaps.length - 1) {
      this.startLevel(this.currentLevelIndex + 1);
    }
  }

  spawnProjectile(x, y, z, angle, type, damage, isPlayer, targetZ = null) {
    import('../entities/Projectile.js').then(({ Projectile }) => {
      this.projectiles.push(new Projectile(x, y, z, angle, type, damage, isPlayer, targetZ));
    });
  }

  update(dt, input) {
    if (this.state !== 'playing') return;

    this.levelTime += dt;

    // Check game over
    if (this.player.isDead) {
      this.state = 'game_over';
      return;
    }

    // Update doors & lifts
    for (const d of this.world.doors.values()) {
      d.update(dt);
    }
    for (const l of this.world.lifts.values()) {
      l.update(dt, this.player, this.enemies);
    }

    // Update triggers
    for (const t of this.world.triggers) {
      t.checkPlayer(this.player, this.world);
    }

    // Update player
    this.player.update(dt, input, this.world);

    // Player attack input
    if (input.attackPressed) {
      this.weapons.tryFire(this.world, this.enemies, this.spawnProjectile.bind(this));
    }

    // Update enemies
    for (const e of this.enemies) {
      e.update(dt, this.player, this.world, this.spawnProjectile.bind(this));
    }

    // Update projectiles
    for (const pr of this.projectiles) {
      pr.update(dt, this.world, this.player, this.enemies);
    }
    this.projectiles = this.projectiles.filter(pr => pr.alive);

    // Check pickups
    for (const pk of this.pickups) {
      pk.checkCollision(this.player, this.onExitReached.bind(this));
    }
  }
}
