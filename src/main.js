// main.js - Master Game Controller & Entry Point for DEAD : THE HALLOWEEN MASSACRE

import { CONFIG } from './config.js';
import { AssetRegistry } from './assets/AssetRegistry.js';
import { AudioManager, sound } from './engine/AudioManager.js';
import { Input } from './engine/Input.js';
import { GameLoop } from './engine/GameLoop.js';
import { SectorRenderer } from './engine/SectorRenderer.js';
import { SpriteRenderer } from './engine/SpriteRenderer.js';
import { HUD } from './gameplay/HUD.js';
import { Campaign } from './gameplay/Campaign.js';
import { SaveSystem } from './gameplay/SaveSystem.js';
import { MapEditor } from './engine/MapEditor.js';

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.canvas.width = CONFIG.INTERNAL_WIDTH;
    this.canvas.height = CONFIG.INTERNAL_HEIGHT;

    this.assets = new AssetRegistry();
    this.input = new Input(this.canvas);
    this.secRenderer = new SectorRenderer(this.canvas, this.assets);
    this.spriteRenderer = new SpriteRenderer(this.canvas, this.assets, this.secRenderer);
    this.hud = new HUD(this.canvas, this.assets);
    this.campaign = new Campaign(this);
    this.mapEditor = new MapEditor(this);

    this.gameState = 'loading'; // 'loading', 'menu', 'playing', 'pause', 'intermission', 'victory', 'game_over'
    this.selectedEpisode = 0;

    this.loop = new GameLoop(this.update.bind(this), this.render.bind(this));
  }

  async init() {
    const loadingBar = document.getElementById('loadingProgress');
    const loadingText = document.getElementById('loadingText');

    await this.assets.init((progress, key) => {
      const pct = Math.floor(progress * 100);
      if (loadingBar) loadingBar.style.width = `${pct}%`;
      if (loadingText) loadingText.textContent = `Caricamento risorsa: ${key} (${pct}%)`;
    });

    document.getElementById('loadingScreen').style.display = 'none';
    document.getElementById('mainMenu').style.display = 'flex';
    this.gameState = 'menu';

    this._bindMenuEvents();
    this.loop.start();
  }

  _bindMenuEvents() {
    document.getElementById('btnStart').addEventListener('click', () => {
      sound.ensureContext();
      document.getElementById('mainMenu').style.display = 'none';
      this.campaign.startLevel(0);
      this.gameState = 'playing';
      this.canvas.requestPointerLock?.();
    });

    document.getElementById('btnLevelSelect').addEventListener('click', () => {
      const save = SaveSystem.load();
      const choice = prompt(`Seleziona livello (1: Bosco, 2: Cimitero, 3: Cripta, 4: Catacombe):`, "1");
      const idx = parseInt(choice, 10) - 1;
      if (!isNaN(idx) && idx >= 0 && idx < 4) {
        sound.ensureContext();
        document.getElementById('mainMenu').style.display = 'none';
        this.campaign.startLevel(idx);
        this.gameState = 'playing';
        this.canvas.requestPointerLock?.();
      }
    });

    const btnEditor = document.getElementById('btnOpenEditor');
    if (btnEditor) {
      btnEditor.addEventListener('click', () => {
        sound.ensureContext();
        if (!this.campaign.world) {
          this.campaign.startLevel(0);
          this.gameState = 'playing';
        }
        document.getElementById('mainMenu').style.display = 'none';
        this.mapEditor.toggle();
      });
    }

    // Touch controls for mobile (§13)
    this._bindTouchControls();
  }

  _bindTouchControls() {
    const joy = document.getElementById('virtualJoystick');
    const btnAtk = document.getElementById('touchAttack');
    const btnUse = document.getElementById('touchInteract');
    const btnWpn = document.getElementById('touchWeapon');

    if (btnAtk) {
      btnAtk.addEventListener('touchstart', (e) => { e.preventDefault(); sound.ensureContext(); this.input.attackPressed = true; });
      btnAtk.addEventListener('touchend', (e) => { e.preventDefault(); this.input.attackPressed = false; });
    }
    if (btnUse) {
      btnUse.addEventListener('touchstart', (e) => { e.preventDefault(); sound.ensureContext(); this.input.interactPressed = true; });
    }
    if (btnWpn) {
      btnWpn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        sound.ensureContext();
        this.input.weaponCycle = 1;
      });
    }

    if (joy) {
      let touchId = null;
      let startX = 0, startY = 0;

      joy.addEventListener('touchstart', (e) => {
        e.preventDefault();
        sound.ensureContext();
        const t = e.changedTouches[0];
        touchId = t.identifier;
        const rect = joy.getBoundingClientRect();
        startX = rect.left + rect.width / 2;
        startY = rect.top + rect.height / 2;
      });

      window.addEventListener('touchmove', (e) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          if (t.identifier === touchId) {
            const dx = t.clientX - startX;
            const dy = t.clientY - startY;
            const dist = Math.hypot(dx, dy);
            const maxR = 40;
            const clamped = Math.min(dist, maxR);
            const ang = Math.atan2(dy, dx);
            this.input.touchMoveX = Math.cos(ang) * (clamped / maxR);
            this.input.touchMoveY = Math.sin(ang) * (clamped / maxR);
          }
        }
      });

      const endJoy = (e) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === touchId) {
            touchId = null;
            this.input.touchMoveX = 0;
            this.input.touchMoveY = 0;
          }
        }
      };
      window.addEventListener('touchend', endJoy);
      window.addEventListener('touchcancel', endJoy);
    }
  }

  update(dt) {
    if (this.mapEditor && this.mapEditor.active) {
      return; // Pause gameplay while editing map
    }

    if (this.gameState === 'playing') {
      this.campaign.update(dt, this.input);
      if (this.campaign.state === 'intermission') {
        this.gameState = 'intermission';
      } else if (this.campaign.state === 'victory') {
        this.gameState = 'victory';
      } else if (this.campaign.state === 'game_over') {
        this.gameState = 'game_over';
      }
    }
    this.input.resetDeltas();
  }

  render(dt) {
    const ctx = this.canvas.getContext('2d');

    if (this.gameState === 'playing') {
      const world = this.campaign.world;
      const player = this.campaign.player;

      // 1. Sector-and-portal canvas renderer
      this.secRenderer.render(world, player, dt);

      // 2. Sprites renderer (props, pickups, enemies, projectiles)
      this.spriteRenderer.render(
        world,
        player,
        this.campaign.enemies,
        this.campaign.projectiles,
        this.campaign.pickups,
        world.props,
        dt
      );

      // 3. HUD with portrait face, weapons, ammo, stats
      this.hud.render(player, world);

    } else if (this.gameState === 'intermission') {
      ctx.fillStyle = '#0e0b14';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.fillStyle = '#e6a13b';
      ctx.font = 'bold 16px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('LIVELLO COMPLETATO!', this.canvas.width / 2, 60);
      ctx.fillStyle = '#e0e0e0';
      ctx.font = '12px "Courier New", monospace';
      ctx.fillText(`Tempo: ${Math.floor(this.campaign.levelTime)}s`, this.canvas.width / 2, 100);
      ctx.fillText('Premi [SPAZIO] o [E] per il prossimo livello', this.canvas.width / 2, 150);

      if (this.input.keys['Space'] || this.input.keys['KeyE']) {
        this.campaign.nextLevel();
        this.gameState = 'playing';
      }

    } else if (this.gameState === 'victory') {
      // FINAL DAWN VICTORY SCREEN (§16)
      ctx.fillStyle = '#ff7b42';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.fillStyle = '#220011';
      ctx.font = 'bold 18px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('L’ALBA FINALE È GIUNTA!', this.canvas.width / 2, 50);
      ctx.font = '12px "Courier New", monospace';
      ctx.fillText('Clock Reaper è stato distrutto.', this.canvas.width / 2, 85);
      ctx.fillText('Il massacro di Halloween è terminato.', this.canvas.width / 2, 110);
      ctx.fillText('DEAD : THE HALLOWEEN MASSACRE', this.canvas.width / 2, 145);
      ctx.fillText('Hai trionfato!', this.canvas.width / 2, 175);

    } else if (this.gameState === 'game_over') {
      ctx.fillStyle = '#1e0000';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.fillStyle = '#ff2222';
      ctx.font = 'bold 20px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('SEI MORTO', this.canvas.width / 2, 80);
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px "Courier New", monospace';
      ctx.fillText('Premi [SPAZIO] o [E] per riprovare', this.canvas.width / 2, 130);

      if (this.input.keys['Space'] || this.input.keys['KeyE']) {
        this.campaign.startLevel(this.campaign.currentLevelIndex);
        this.gameState = 'playing';
      }
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
  game.init();
});
