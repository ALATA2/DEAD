// AssetRegistry.js - Central registry for DEAD : THE HALLOWEEN MASSACRE
// Dynamically finds and loads all verified environment & sprite assets.

export class AssetRegistry {
  constructor() {
    this.images = new Map();
    this.envManifest = null;
    this.sprManifest = null;
    this.loaded = false;
    this.progress = 0;
    this.totalToLoad = 0;
    this.loadedCount = 0;

    // Detect base paths relative to index.html
    this.envBase = 'dead_oclock_environment_pack_v1/dead_oclock_environment_pack_v1/';
    this.sprBase = 'dead_oclock_sprite_pack_v2/dead_oclock_sprite_pack_v2/';
  }

  async init(onProgress) {
    // 1. Fetch manifests
    try {
      const envRes = await fetch(this.envBase + 'manifest.json');
      this.envManifest = await envRes.json();
    } catch (e) {
      console.warn('Fallback env manifest fetch:', e);
      // Fallback single path if nested directory wasn't used
      this.envBase = 'dead_oclock_environment_pack_v1/';
      const envRes = await fetch(this.envBase + 'manifest.json');
      this.envManifest = await envRes.json();
    }

    try {
      const sprRes = await fetch(this.sprBase + 'manifest.json');
      this.sprManifest = await sprRes.json();
    } catch (e) {
      console.warn('Fallback spr manifest fetch:', e);
      this.sprBase = 'dead_oclock_sprite_pack_v2/';
      const sprRes = await fetch(this.sprBase + 'manifest.json');
      this.sprManifest = await sprRes.json();
    }

    // 2. Build list of files to preload
    const queue = [];

    // Environment: Game textures (128x128)
    for (const cat of Object.keys(this.envManifest.textures)) {
      for (const item of this.envManifest.textures[cat]) {
        queue.push({
          key: `texture/${cat}/${item.name}`,
          url: this.envBase + item.game
        });
      }
    }

    // Environment: Props
    for (const cat of Object.keys(this.envManifest.props)) {
      for (const item of this.envManifest.props[cat]) {
        queue.push({
          key: `prop/${cat}/${item.name}`,
          url: this.envBase + item.file
        });
      }
    }

    // Environment: Pickups
    for (const item of this.envManifest.pickups) {
      queue.push({
        key: `pickup/${item.name}`,
        url: this.envBase + item.file
      });
    }

    // Environment: Panoramas
    for (const item of this.envManifest.panoramas) {
      queue.push({
        key: `panorama/${item.name}`,
        url: this.envBase + item.file
      });
    }

    // Environment: Animations (doors, fx, ambient)
    for (const group of Object.keys(this.envManifest.animations)) {
      for (const animName of Object.keys(this.envManifest.animations[group])) {
        const frames = this.envManifest.animations[group][animName];
        frames.forEach((frameFile, idx) => {
          queue.push({
            key: `anim/${group}/${animName}/${idx}`,
            url: this.envBase + frameFile
          });
        });
      }
    }

    // Sprites: Enemies, projectiles, player face, HUD
    for (const f of this.sprManifest.files) {
      // Ignore source_sheets or preview
      if (f.includes('source_sheets') || f.includes('preview')) continue;
      queue.push({
        key: `spr/${f}`,
        url: this.sprBase + f
      });
    }

    this.totalToLoad = queue.length;
    this.loadedCount = 0;

    // Load with concurrency limit to be fast and safe
    const concurrency = 12;
    let index = 0;

    const loadNext = async () => {
      while (index < queue.length) {
        const current = queue[index++];
        await this._loadImage(current.key, current.url);
        this.loadedCount++;
        this.progress = this.loadedCount / this.totalToLoad;
        if (onProgress) onProgress(this.progress, current.key);
      }
    };

    const workers = [];
    for (let i = 0; i < concurrency; i++) {
      workers.push(loadNext());
    }
    await Promise.all(workers);

    this.loaded = true;
    console.log(`[AssetRegistry] All ${this.images.size} assets loaded cleanly.`);
  }

  _loadImage(key, url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        this.images.set(key, img);
        resolve(img);
      };
      img.onerror = () => {
        console.warn(`[AssetRegistry] Warning: Could not load ${url} (key: ${key})`);
        resolve(null);
      };
      img.src = url;
    });
  }

  getImage(key) {
    return this.images.get(key) || null;
  }

  getTexture(area, name) {
    return this.images.get(`texture/${area}/${name}`) || null;
  }

  getProp(area, name) {
    return this.images.get(`prop/${area}/${name}`) || null;
  }

  getPickup(name) {
    return this.images.get(`pickup/${name}`) || null;
  }

  getPanorama(name) {
    return this.images.get(`panorama/${name}`) || null;
  }

  getDoorFrame(doorName, frameIndex) {
    return this.images.get(`anim/doors/${doorName}/${frameIndex}`) || null;
  }

  getCombatFXFrame(fxName, frameIndex) {
    return this.images.get(`anim/combat_fx/${fxName}/${frameIndex}`) || null;
  }

  getAmbientFrame(ambientName, frameIndex) {
    return this.images.get(`anim/ambient/${ambientName}/${frameIndex}`) || null;
  }

  getEnemyFrame(enemyName, type, frameIndex = 1) {
    // type: 'movement', 'attack', 'death'
    let path = '';
    if (type === 'movement') {
      path = `spr/enemies/${enemyName}/movement/frame_0${frameIndex}.png`;
    } else if (type === 'attack') {
      path = `spr/enemies/${enemyName}/attack/front_attack.png`;
    } else if (type === 'death') {
      path = `spr/enemies/${enemyName}/death/death_0${frameIndex}.png`;
    }
    return this.images.get(path) || null;
  }

  getProjectileFrame(projName, frameIndex = 1) {
    const path = `spr/projectiles/${projName}/frame_0${frameIndex}.png`;
    return this.images.get(path) || null;
  }

  getPlayerFace(stateName) {
    const path = `spr/player/face/${stateName}.png`;
    return this.images.get(path) || null;
  }

  getHUD() {
    return this.images.get('spr/ui/hud_halloween_transparent.png') || null;
  }
}
