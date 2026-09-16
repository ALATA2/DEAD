// MapEditor.js - Advanced Visual 2.5D Sector & Entity Map Studio
// Allows adding, removing, and modifying:
// - Sectors & Floors / Ceilings / Stairs presets
// - Walls (solid, portal, doors)
// - Enemies (with archetypes and boss flag)
// - Pickups (weapons, health, armor, ammo, keys)
// - Player start position & real-time teleport testing

import { Sector } from '../world/Sector.js';
import { Enemy } from '../entities/Enemy.js';
import { Pickup } from '../entities/Pickup.js';

export class MapEditor {
  constructor(game) {
    this.game = game;
    this.active = false;
    this.zoom = 28; // pixels per world unit
    this.panX = 0;
    this.panY = 0;
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;

    // Active tool mode: 'select', 'add_sector', 'add_stair', 'add_wall', 'add_enemy', 'add_pickup', 'teleport'
    this.mode = 'select';
    this.snapToGrid = true;
    this.gridStep = 0.5; // 0.5 world units snap

    // Creation states
    this.wallDrawStart = null; // { x, y }
    this.sectorBoxStart = null; // { x, y }

    // Selected item
    this.selectedSector = null;
    this.selectedEdge = null;
    this.selectedVertex = null; // { edge, isStart }
    this.selectedEntity = null; // { type, obj }
    this.hoveredItem = null;
    this.mouseWorld = { x: 0, y: 0 };

    // Available texture presets
    this.texturesList = [
      'ancient_bark', 'clawed_bark', 'mossy_cliff', 'dead_leaf_floor',
      'muddy_path', 'tangled_roots', 'black_cave_rock', 'rotten_planks',
      'uneven_cobblestones', 'cracked_flagstones', 'fresh_grave_soil', 'dead_grass',
      'mossy_gray_bricks', 'purple_mausoleum_stone', 'skull_relief', 'iron_bars',
      'ancient_stone_blocks', 'blood_drenched_bricks', 'catacomb_skull_wall', 'torchlit_dungeon_wall'
    ];

    this.enemyTypes = [
      'werewolf', 'giant_spider', 'banshee', 'gargoyle', 'pumpkin_mage', 'crawler_zombie', 'pumpkin_king', 'headless_knight'
    ];

    this.pickupTypes = [
      { name: 'Woodsmen Axe', type: 'weapon', weaponId: 'axe', imageKey: 'woodsman_axe' },
      { name: 'Gothic Pistol', type: 'weapon', weaponId: 'pistol', imageKey: 'pistol' },
      { name: 'Shotgun', type: 'weapon', weaponId: 'shotgun', imageKey: 'shotgun' },
      { name: 'Double Barrel', type: 'weapon', weaponId: 'double_barrel', imageKey: 'double_barrel_shotgun' },
      { name: 'Crossbow', type: 'weapon', weaponId: 'crossbow', imageKey: 'gothic_crossbow' },
      { name: 'Health Vial (+25 HP)', type: 'health', amount: 25, imageKey: 'health_vial' },
      { name: 'Large Medkit (+50 HP)', type: 'health', amount: 50, imageKey: 'large_medkit' },
      { name: 'Armor Shard (+15)', type: 'armor', amount: 15, imageKey: 'armor_shard' },
      { name: 'Plate Armor (+50)', type: 'armor', amount: 50, imageKey: 'plate_armor' },
      { name: 'Bullets Box (+30)', type: 'ammo', ammoType: 'bullets', amount: 30, imageKey: 'bullets_box' },
      { name: 'Shells Pack (+12)', type: 'ammo', ammoType: 'shells', amount: 12, imageKey: 'shells_pack' },
      { name: 'Blue Raven Key', type: 'key', nameId: 'blue_raven_key', imageKey: 'blue_raven_key' },
      { name: 'Orange Pumpkin Key', type: 'key', nameId: 'orange_pumpkin_key', imageKey: 'orange_pumpkin_key' },
      { name: 'Red Skull Key', type: 'key', nameId: 'red_skull_key', imageKey: 'red_skull_key' },
      { name: 'Purple Clock Key', type: 'key', nameId: 'purple_clock_key', imageKey: 'purple_clock_key' }
    ];

    this.domElement = null;
    this._createUI();
  }

  _createUI() {
    const editorContainer = document.createElement('div');
    editorContainer.id = 'mapEditorContainer';
    editorContainer.style.cssText = `
      display: none;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(14, 10, 20, 0.97);
      z-index: 1000;
      font-family: 'Courier New', monospace;
      color: #e6a13b;
      user-select: none;
    `;

    editorContainer.innerHTML = `
      <!-- Top Action Bar -->
      <div id="editorTopBar" style="display: flex; justify-content: space-between; align-items: center; padding: 8px 16px; background: #160c1e; border-bottom: 2px solid #ff5500;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-weight: 900; font-size: 15px; color: #ff5500; letter-spacing: 1px;">DEAD MAP STUDIO</span>
          <span id="editorMapTitle" style="color: #bbb; font-size: 13px; font-weight: bold;">[Level]</span>
          <span id="editorCoords" style="color: #88bbff; font-size: 11px; margin-left: 10px;">X: 0.00 | Y: 0.00</span>
        </div>
        <div style="display: flex; gap: 6px; align-items: center;">
          <button id="btnCenterPlayer" title="Center map view on player position" style="background: #2a1420; color: #ffcc44; border: 1px solid #ffaa00; padding: 4px 10px; cursor: pointer; font-size: 11px; font-weight: bold;">CENTER PLAYER</button>
          <button id="btnTestPlay" title="Teleport player to selection and resume game" style="background: #114422; color: #55ff77; border: 1px solid #22cc55; padding: 4px 10px; cursor: pointer; font-size: 11px; font-weight: bold;">TEST HERE [P]</button>
          <button id="btnExportMap" style="background: #2a1420; color: #ffaa44; border: 1px solid #ff5500; padding: 4px 10px; cursor: pointer; font-size: 11px; font-weight: bold;">EXPORT JSON</button>
          <button id="btnCopyMap" style="background: #2a1420; color: #ffaa44; border: 1px solid #ff5500; padding: 4px 10px; cursor: pointer; font-size: 11px; font-weight: bold;">COPY DATA</button>
          <button id="btnCloseEditor" style="background: #551111; color: #fff; border: 1px solid #ff4444; padding: 4px 12px; cursor: pointer; font-size: 11px; font-weight: bold;">BACK TO GAME [TAB / M]</button>
        </div>
      </div>

      <!-- Main Body: Tools Palette (Left), 2D Canvas (Center), Inspector (Right) -->
      <div style="display: flex; width: 100%; height: calc(100% - 46px);">
        
        <!-- Tools Palette (Left Sidebar) -->
        <div id="editorToolPalette" style="width: 170px; background: #120918; border-right: 2px solid #ff5500; padding: 10px 8px; display: flex; flex-direction: column; gap: 8px; overflow-y: auto;">
          <div style="font-size: 11px; color: #ff8833; font-weight: bold; border-bottom: 1px solid #331525; padding-bottom: 4px;">TOOLS & MODES</div>
          
          <button class="ed-tool-btn active" data-mode="select">🖱️ SELECT / MOVE</button>
          <button class="ed-tool-btn" data-mode="add_sector">⬛ ADD SECTOR (Floor)</button>
          <button class="ed-tool-btn" data-mode="add_stair">🪜 ADD STAIR STEP</button>
          <button class="ed-tool-btn" data-mode="add_wall">🧱 DRAW WALL</button>
          <button class="ed-tool-btn" data-mode="add_enemy">👹 SPAWN ENEMY</button>
          <button class="ed-tool-btn" data-mode="add_pickup">🎁 ADD PICKUP</button>
          <button class="ed-tool-btn" data-mode="teleport">📍 SET START / TELE</button>

          <div style="font-size: 11px; color: #ff8833; font-weight: bold; border-bottom: 1px solid #331525; padding-bottom: 4px; margin-top: 8px;">GRID & SNAP</div>
          <button id="btnToggleSnap" style="background: #1e2814; color: #88ff66; border: 1px solid #44aa22; padding: 5px; font-size: 11px; font-family: inherit; cursor: pointer; font-weight: bold;">🧲 SNAP: ON (0.5)</button>
          <div style="display: flex; gap: 4px;">
            <button class="ed-sub-btn" id="btnGrid025">0.25</button>
            <button class="ed-sub-btn active" id="btnGrid05">0.5</button>
            <button class="ed-sub-btn" id="btnGrid10">1.0</button>
          </div>

          <div style="font-size: 11px; color: #ff8833; font-weight: bold; border-bottom: 1px solid #331525; padding-bottom: 4px; margin-top: 8px;">ACTIONS</div>
          <button id="btnDeleteSelected" style="background: #441111; color: #ff7777; border: 1px solid #aa2222; padding: 6px; font-size: 11px; font-family: inherit; cursor: pointer; font-weight: bold;">🗑️ DELETE [DEL]</button>
          <button id="btnSplitWall" style="background: #1a2035; color: #88bbff; border: 1px solid #3366bb; padding: 6px; font-size: 11px; font-family: inherit; cursor: pointer; font-weight: bold;">✂️ SPLIT WALL</button>
          <button id="btnToggleDoor" style="background: #332611; color: #ffcc44; border: 1px solid #aa8822; padding: 6px; font-size: 11px; font-family: inherit; cursor: pointer; font-weight: bold;">🚪 TOGGLE DOOR</button>

          <!-- Visual Legend Box -->
          <div style="margin-top: auto; font-size: 10px; background: rgba(0,0,0,0.5); padding: 8px; border: 1px solid #281830; line-height: 1.4;">
            <div style="color: #ffaa44; font-weight: bold; margin-bottom: 4px;">LEGEND:</div>
            <div style="color: #ffffff;">━ Solid Wall</div>
            <div style="color: #4488ff;">┄ Portal Passage</div>
            <div style="color: #ffcc00;">╍ Door / Gate</div>
            <div style="color: #ff4400;">● Enemy</div>
            <div style="color: #00ffff;">● Pickup / Key</div>
            <div style="color: #ffff00;">▲ Player Look</div>
          </div>
        </div>

        <!-- 2D Interactive Canvas (Center Area) -->
        <div style="position: relative; flex: 1; height: 100%; overflow: hidden; background: #08040d;">
          <canvas id="editorCanvas" style="width: 100%; height: 100%; cursor: crosshair; display: block;"></canvas>
          
          <!-- Mode Banner / Hint overlay -->
          <div id="editorModeHint" style="position: absolute; top: 10px; left: 10px; color: #ffcc66; font-size: 12px; font-weight: bold; background: rgba(18, 9, 26, 0.85); padding: 6px 12px; border: 1px solid #ff5500; box-shadow: 2px 2px 0 #000; pointer-events: none;">
            MODE: SELECT / MOVE (Click item to select, drag to reposition)
          </div>

          <div style="position: absolute; bottom: 10px; left: 10px; color: #aaa; font-size: 11px; background: rgba(10, 5, 15, 0.85); padding: 5px 10px; border: 1px solid #332244; pointer-events: none;">
            Pan: Left Click Drag &bull; Zoom: Mouse Wheel &bull; Quick Test: [P] &bull; Delete: [Del]
          </div>
        </div>

        <!-- Inspector & Properties Panel (Right Sidebar) -->
        <div id="editorSidebar" style="width: 320px; background: #160c1c; border-left: 2px solid #ff5500; padding: 14px; overflow-y: auto; font-size: 12px;">
          <h3 style="color: #ff5500; border-bottom: 1px solid #3d1c2b; padding-bottom: 4px; margin-bottom: 10px; font-size: 14px; display: flex; justify-content: space-between;">
            <span>INSPECTOR</span>
            <span id="inspectTypeBadge" style="font-size: 10px; color: #aaa; font-weight: normal; background: #261122; padding: 2px 6px; border: 1px solid #442233;">NONE</span>
          </h3>
          <div id="editorPropsContent">
            <p style="color: #777; line-height: 1.5;">Click any Sector, Wall, Vertex, Enemy or Pickup to inspect and edit details.</p>
          </div>
        </div>

      </div>
    document.getElementById('gameContainer').appendChild(editorContainer);
    this.domElement = editorContainer;
    this.canvas = document.getElementById('editorCanvas');
    this.ctx = this.canvas.getContext('2d');

    this._injectStyles();
    this._bindEvents();
  }

  _injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .ed-tool-btn {
        background: #1c1024;
        color: #cca474;
        border: 1px solid #4d263a;
        padding: 7px 8px;
        font-family: inherit;
        font-size: 11px;
        font-weight: bold;
        text-align: left;
        cursor: pointer;
        transition: all 0.1s;
      }
      .ed-tool-btn:hover {
        background: #2f183c;
        color: #ffcc66;
        border-color: #ff5500;
      }
      .ed-tool-btn.active {
        background: #ff5500;
        color: #0d0612;
        border-color: #ffaa44;
        font-weight: 900;
      }
      .ed-sub-btn {
        flex: 1;
        background: #1a0f20;
        color: #888;
        border: 1px solid #3d1c2b;
        padding: 4px 0;
        font-size: 10px;
        font-family: inherit;
        cursor: pointer;
      }
      .ed-sub-btn.active {
        background: #2a1420;
        color: #ffaa44;
        border-color: #ffaa44;
        font-weight: bold;
      }
    `;
    document.head.appendChild(style);
  }

  _bindEvents() {
    // Mode Buttons
    const modeBtns = this.domElement.querySelectorAll('.ed-tool-btn');
    modeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.setMode(btn.dataset.mode);
      });
    });

    // Grid snap toggle & buttons
    const snapBtn = document.getElementById('btnToggleSnap');
    snapBtn.addEventListener('click', () => {
      this.snapToGrid = !this.snapToGrid;
      snapBtn.textContent = this.snapToGrid ? `🧲 SNAP: ON (${this.gridStep})` : '🧲 SNAP: OFF';
      snapBtn.style.background = this.snapToGrid ? '#1e2814' : '#331111';
      snapBtn.style.color = this.snapToGrid ? '#88ff66' : '#ff7777';
      snapBtn.style.borderColor = this.snapToGrid ? '#44aa22' : '#aa2222';
    });

    const setGridStep = (step, id) => {
      this.gridStep = step;
      document.querySelectorAll('#btnGrid025, #btnGrid05, #btnGrid10').forEach(b => b.classList.remove('active'));
      document.getElementById(id).classList.add('active');
      if (this.snapToGrid) {
        snapBtn.textContent = `🧲 SNAP: ON (${this.gridStep})`;
      }
      this.draw();
    };

    document.getElementById('btnGrid025').addEventListener('click', () => setGridStep(0.25, 'btnGrid025'));
    document.getElementById('btnGrid05').addEventListener('click', () => setGridStep(0.5, 'btnGrid05'));
    document.getElementById('btnGrid10').addEventListener('click', () => setGridStep(1.0, 'btnGrid10'));

    // Top action buttons
    document.getElementById('btnCloseEditor').addEventListener('click', () => this.toggle());
    document.getElementById('btnExportMap').addEventListener('click', () => this.exportMap(true));
    document.getElementById('btnCopyMap').addEventListener('click', () => this.exportMap(false));
    document.getElementById('btnCenterPlayer').addEventListener('click', () => this.centerOnPlayer());
    document.getElementById('btnTestPlay').addEventListener('click', () => this.testPlayAtSelection());

    // Action buttons
    document.getElementById('btnDeleteSelected').addEventListener('click', () => this.deleteSelected());
    document.getElementById('btnSplitWall').addEventListener('click', () => this.splitSelectedWall());
    document.getElementById('btnToggleDoor').addEventListener('click', () => this.toggleSelectedDoor());

    // Keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Tab' || e.code === 'KeyM') {
        e.preventDefault();
        this.toggle();
      } else if (this.active) {
        if (e.code === 'Delete' || e.code === 'Backspace') {
          if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
          e.preventDefault();
          this.deleteSelected();
        } else if (e.code === 'KeyP') {
          if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
          this.testPlayAtSelection();
        } else if (e.code === 'Escape') {
          this.wallDrawStart = null;
          this.sectorBoxStart = null;
          this.setMode('select');
          this.draw();
        }
      }
    });

    this._bindCanvasEvents();
  }

  setMode(mode) {
    this.mode = mode;
    this.wallDrawStart = null;
    this.sectorBoxStart = null;

    const hint = document.getElementById('editorModeHint');
    const hints = {
      select: 'MODE: SELECT / MOVE (Click item to select, drag to reposition)',
      add_sector: 'MODE: ADD SECTOR (Click top-left then bottom-right corner to create new room)',
      add_stair: 'MODE: ADD STAIR STEP (Click two corners to create an elevated step floor)',
      add_wall: 'MODE: DRAW WALL (Click start point then end point to draw dividing wall)',
      add_enemy: 'MODE: SPAWN ENEMY (Click anywhere on map floor to place monster)',
      add_pickup: 'MODE: ADD PICKUP (Click floor to place weapon/ammo/health/key)',
      teleport: 'MODE: SET START / TELEPORT (Click anywhere to move player start & test location)'
    };
    if (hint) hint.textContent = hints[mode] || mode;

    this._updatePropsPanel();
    this.draw();
  }

  toggle() {
    this.active = !this.active;
    if (this.active) {
      if (document.exitPointerLock) document.exitPointerLock();
      this.domElement.style.display = 'block';
      this.resize();
      this.centerOnPlayer();
      if (this.game.campaign.world) {
        document.getElementById('editorMapTitle').textContent = `[${this.game.campaign.world.title}]`;
      }
      this.draw();
    } else {
      this.domElement.style.display = 'none';
      this.game.canvas.requestPointerLock?.();
    }
  }

  centerOnPlayer() {
    if (this.game.campaign.player && this.canvas) {
      this.panX = this.canvas.width / 2 - this.game.campaign.player.x * this.zoom;
      this.panY = this.canvas.height / 2 - this.game.campaign.player.y * this.zoom;
      this.draw();
    }
  }

  testPlayAtSelection() {
    const player = this.game.campaign.player;
    if (!player) return;

    let targetX = player.x;
    let targetY = player.y;

    if (this.selectedSector) {
      targetX = (this.selectedSector.bounds.minX + this.selectedSector.bounds.maxX) / 2;
      targetY = (this.selectedSector.bounds.minY + this.selectedSector.bounds.maxY) / 2;
    } else if (this.selectedEntity) {
      targetX = this.selectedEntity.obj.x;
      targetY = this.selectedEntity.obj.y;
    } else if (this.selectedEdge) {
      targetX = (this.selectedEdge.x1 + this.selectedEdge.x2) / 2;
      targetY = (this.selectedEdge.y1 + this.selectedEdge.y2) / 2;
    } else if (this.mouseWorld) {
      targetX = this.mouseWorld.x;
      targetY = this.mouseWorld.y;
    }

    player.x = targetX;
    player.y = targetY;
    const world = this.game.campaign.world;
    if (world) {
      const sec = this.selectedSector || Array.from(world.sectors.values()).find(s => s.containsPoint(targetX, targetY));
      if (sec) {
        player.currentSector = sec;
        player.currentSectorId = sec.id;
        player.z = sec.floorHeight + 1.6;
      }
    }

    this.toggle(); // Resume gameplay!
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = this.canvas.parentElement.clientWidth;
    this.canvas.height = this.canvas.parentElement.clientHeight;
  }

  _screenToWorld(sx, sy) {
    return {
      x: (sx - this.panX) / this.zoom,
      y: (sy - this.panY) / this.zoom
    };
  }

  _worldToScreen(wx, wy) {
    return {
      x: wx * this.zoom + this.panX,
      y: wy * this.zoom + this.panY
    };
  }

  _snap(val) {
    if (!this.snapToGrid) return val;
    return Math.round(val / this.gridStep) * this.gridStep;
  }

  _bindCanvasEvents() {
    window.addEventListener('resize', () => {
      if (this.active) {
        this.resize();
        this.draw();
      }
    });

    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
      const mouseX = e.offsetX;
      const mouseY = e.offsetY;

      this.panX = mouseX - (mouseX - this.panX) * zoomFactor;
      this.panY = mouseY - (mouseY - this.panY) * zoomFactor;
      this.zoom = Math.max(8, Math.min(140, this.zoom * zoomFactor));
      this.draw();
    });

    this.canvas.addEventListener('mousedown', (e) => {
      const rawPos = this._screenToWorld(e.offsetX, e.offsetY);
      const wx = this._snap(rawPos.x);
      const wy = this._snap(rawPos.y);

      if (e.button === 2) {
        // Right click: cancel drawing
        e.preventDefault();
        this.wallDrawStart = null;
        this.sectorBoxStart = null;
        this.draw();
        return;
      }

      if (this.mode === 'select') {
        this.isDragging = true;
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;
        this._handleSelection(rawPos.x, rawPos.y);
      } else if (this.mode === 'add_sector' || this.mode === 'add_stair') {
        if (!this.sectorBoxStart) {
          this.sectorBoxStart = { x: wx, y: wy };
        } else {
          this._createBoxSector(this.sectorBoxStart.x, this.sectorBoxStart.y, wx, wy, this.mode === 'add_stair');
          this.sectorBoxStart = null;
        }
      } else if (this.mode === 'add_wall') {
        if (!this.wallDrawStart) {
          this.wallDrawStart = { x: wx, y: wy };
        } else {
          this._createSingleWall(this.wallDrawStart.x, this.wallDrawStart.y, wx, wy);
          this.wallDrawStart = null;
        }
      } else if (this.mode === 'add_enemy') {
        this._spawnEnemyAt(wx, wy);
      } else if (this.mode === 'add_pickup') {
        this._spawnPickupAt(wx, wy);
      } else if (this.mode === 'teleport') {
        this._setPlayerStart(wx, wy);
      }

      this.draw();
    });

    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    window.addEventListener('mousemove', (e) => {
      if (!this.active) return;
      const rect = this.canvas.getBoundingClientRect();
      const ox = e.clientX - rect.left;
      const oy = e.clientY - rect.top;
      this.mouseWorld = this._screenToWorld(ox, oy);

      const coordElem = document.getElementById('editorCoords');
      if (coordElem) {
        coordElem.textContent = `X: ${this.mouseWorld.x.toFixed(2)} | Y: ${this.mouseWorld.y.toFixed(2)}`;
      }

      if (this.isDragging && this.mode === 'select') {
        const dx = e.clientX - this.dragStartX;
        const dy = e.clientY - this.dragStartY;
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;

        if (this.selectedVertex) {
          const deltaWorldX = dx / this.zoom;
          const deltaWorldY = dy / this.zoom;
          const kx = this.selectedVertex.isStart ? 'x1' : 'x2';
          const ky = this.selectedVertex.isStart ? 'y1' : 'y2';
          this.selectedVertex.edge[kx] = this._snap(this.selectedVertex.edge[kx] + deltaWorldX);
          this.selectedVertex.edge[ky] = this._snap(this.selectedVertex.edge[ky] + deltaWorldY);
          this._recalcSectorBounds(this.selectedVertex.edge.sectorId);
          this._updatePropsPanel();
        } else if (this.selectedEntity) {
          this.selectedEntity.obj.x = this._snap(this.selectedEntity.obj.x + dx / this.zoom);
          this.selectedEntity.obj.y = this._snap(this.selectedEntity.obj.y + dy / this.zoom);
          this._updatePropsPanel();
        } else {
          // Pan camera
          this.panX += dx;
          this.panY += dy;
        }
        this.draw();
      } else if (this.wallDrawStart || this.sectorBoxStart) {
        this.draw();
      }
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });
  }

  _handleSelection(wx, wy) {
    const world = this.game.campaign.world;
    if (!world) return;

    // 1. Check Vertex (tolerance ~0.4)
    for (const edge of world.edges) {
      if (Math.hypot(edge.x1 - wx, edge.y1 - wy) < 0.4) {
        this.selectedVertex = { edge, isStart: true };
        this.selectedEdge = edge;
        this.selectedEntity = null;
        this.selectedSector = world.sectors.get(edge.sectorId);
        this._updatePropsPanel();
        return;
      }
      if (Math.hypot(edge.x2 - wx, edge.y2 - wy) < 0.4) {
        this.selectedVertex = { edge, isStart: false };
        this.selectedEdge = edge;
        this.selectedEntity = null;
        this.selectedSector = world.sectors.get(edge.sectorId);
        this._updatePropsPanel();
        return;
      }
    }

    // 2. Check Edges (tolerance ~0.3)
    for (const edge of world.edges) {
      const dist = this._pointToSegmentDist(wx, wy, edge.x1, edge.y1, edge.x2, edge.y2);
      if (dist < 0.3) {
        this.selectedEdge = edge;
        this.selectedVertex = null;
        this.selectedEntity = null;
        this.selectedSector = world.sectors.get(edge.sectorId);
        this._updatePropsPanel();
        return;
      }
    }

    // 3. Check Entities (Enemies, Pickups)
    for (const e of this.game.campaign.enemies) {
      if (Math.hypot(e.x - wx, e.y - wy) < 0.6) {
        this.selectedEntity = { type: 'enemy', obj: e };
        this.selectedVertex = null;
        this.selectedEdge = null;
        this.selectedSector = null;
        this._updatePropsPanel();
        return;
      }
    }

    for (const pk of this.game.campaign.pickups) {
      if (Math.hypot(pk.x - wx, pk.y - wy) < 0.5) {
        this.selectedEntity = { type: 'pickup', obj: pk };
        this.selectedVertex = null;
        this.selectedEdge = null;
        this.selectedSector = null;
        this._updatePropsPanel();
        return;
      }
    }

    // 4. Check Sector Floor Polygon
    for (const sec of world.sectors.values()) {
      if (sec.containsPoint(wx, wy)) {
        this.selectedSector = sec;
        this.selectedEdge = null;
        this.selectedVertex = null;
        this.selectedEntity = null;
        this._updatePropsPanel();
        return;
      }
    }

    // Clicked empty void
    this.selectedSector = null;
    this.selectedEdge = null;
    this.selectedVertex = null;
    this.selectedEntity = null;
    this._updatePropsPanel();
  }

  _pointToSegmentDist(px, py, x1, y1, x2, y2) {
    const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    if (l2 === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
  }

  _recalcSectorBounds(sectorId) {
    const world = this.game.campaign.world;
    if (!world) return;
    const sec = world.sectors.get(sectorId);
    if (!sec) return;
    sec.bounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
    for (const edge of sec.edges) {
      sec.bounds.minX = Math.min(sec.bounds.minX, edge.x1, edge.x2);
      sec.bounds.minY = Math.min(sec.bounds.minY, edge.y1, edge.y2);
      sec.bounds.maxX = Math.max(sec.bounds.maxX, edge.x1, edge.x2);
      sec.bounds.maxY = Math.max(sec.bounds.maxY, edge.y1, edge.y2);
    }
  }

  // CREATE / ADD METHODS
  _createBoxSector(x1, y1, x2, y2, isStair = false) {
    const world = this.game.campaign.world;
    if (!world) return;

    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);

    if (maxX - minX < 0.5 || maxY - minY < 0.5) return;

    const secNum = world.sectors.size + 1;
    const id = isStair ? `stair_${secNum}` : `room_${secNum}`;
    
    let floorHeight = 0;
    if (isStair) {
      const nearbySec = Array.from(world.sectors.values()).find(s => s.containsPoint(minX - 0.5, minY - 0.5));
      floorHeight = nearbySec ? nearbySec.floorHeight + 0.35 : 0.35;
    }

    const newSector = new Sector({
      id: id,
      floorHeight: floorHeight,
      ceilingHeight: 4.0,
      floorTexture: isStair ? 'cracked_flagstones' : 'muddy_path',
      ceilingTexture: 'moonlit_canopy',
      light: 0.85
    });

    const e1 = { sectorId: id, x1: minX, y1: minY, x2: maxX, y2: minY, type: 'solid', texture: 'ancient_bark' };
    const e2 = { sectorId: id, x1: maxX, y1: minY, x2: maxX, y2: maxY, type: 'solid', texture: 'ancient_bark' };
    const e3 = { sectorId: id, x1: maxX, y1: maxY, x2: minX, y2: maxY, type: 'solid', texture: 'ancient_bark' };
    const e4 = { sectorId: id, x1: minX, y1: maxY, x2: minX, y2: minY, type: 'solid', texture: 'ancient_bark' };

    [e1, e2, e3, e4].forEach(edge => {
      this._autoConnectEdge(edge, world);
      newSector.addEdge(edge);
      world.edges.push(edge);
    });

    world.sectors.set(id, newSector);
    this.selectedSector = newSector;
    this.setMode('select');
  }

  _autoConnectEdge(newEdge, world) {
    for (const ex of world.edges) {
      if (ex.sectorId === newEdge.sectorId) continue;
      const sameDirection = Math.hypot(ex.x1 - newEdge.x1, ex.y1 - newEdge.y1) < 0.2 &&
                            Math.hypot(ex.x2 - newEdge.x2, ex.y2 - newEdge.y2) < 0.2;
      const revDirection = Math.hypot(ex.x1 - newEdge.x2, ex.y1 - newEdge.y2) < 0.2 &&
                           Math.hypot(ex.x2 - newEdge.x1, ex.y2 - newEdge.y1) < 0.2;
      if (sameDirection || revDirection) {
        newEdge.type = 'portal';
        newEdge.neighborSectorId = ex.sectorId;
        ex.type = 'portal';
        ex.neighborSectorId = newEdge.sectorId;
      }
    }
  }

  _createSingleWall(x1, y1, x2, y2) {
    const world = this.game.campaign.world;
    if (!world) return;
    if (Math.hypot(x2 - x1, y2 - y1) < 0.2) return;

    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const sec = this.selectedSector || Array.from(world.sectors.values()).find(s => s.containsPoint(midX, midY)) || Array.from(world.sectors.values())[0];
    if (!sec) return;

    const newEdge = {
      sectorId: sec.id,
      x1, y1, x2, y2,
      type: 'solid',
      texture: 'ancient_bark'
    };

    sec.addEdge(newEdge);
    world.edges.push(newEdge);
    this.selectedEdge = newEdge;
    this.setMode('select');
  }

  _spawnEnemyAt(x, y) {
    const world = this.game.campaign.world;
    if (!world) return;
    const sec = Array.from(world.sectors.values()).find(s => s.containsPoint(x, y));
    const secId = sec ? sec.id : 'path_start';

    const enemy = new Enemy({
      type: 'werewolf',
      x: x,
      y: y,
      sectorId: secId
    });
    enemy.currentSector = sec;
    enemy.z = sec ? sec.floorHeight : 0;

    this.game.campaign.enemies.push(enemy);
    this.selectedEntity = { type: 'enemy', obj: enemy };
    this.setMode('select');
  }

  _spawnPickupAt(x, y) {
    const world = this.game.campaign.world;
    if (!world) return;
    const sec = Array.from(world.sectors.values()).find(s => s.containsPoint(x, y));
    const secId = sec ? sec.id : 'path_start';

    const pk = new Pickup({
      type: 'health',
      name: 'Health Vial',
      x: x,
      y: y,
      sectorId: secId,
      amount: 25
    });

    this.game.campaign.pickups.push(pk);
    this.selectedEntity = { type: 'pickup', obj: pk };
    this.setMode('select');
  }

  _setPlayerStart(x, y) {
    const world = this.game.campaign.world;
    if (!world) return;
    const sec = Array.from(world.sectors.values()).find(s => s.containsPoint(x, y));
    world.start.x = x;
    world.start.y = y;
    if (sec) world.start.sectorId = sec.id;

    if (this.game.campaign.player) {
      this.game.campaign.player.x = x;
      this.game.campaign.player.y = y;
      if (sec) {
        this.game.campaign.player.currentSector = sec;
        this.game.campaign.player.z = sec.floorHeight + 1.6;
      }
    }
    this.setMode('select');
  }

  // DELETE & MODIFY
  deleteSelected() {
    const world = this.game.campaign.world;
    if (!world) return;

    if (this.selectedEntity) {
      if (this.selectedEntity.type === 'enemy') {
        const idx = this.game.campaign.enemies.indexOf(this.selectedEntity.obj);
        if (idx >= 0) this.game.campaign.enemies.splice(idx, 1);
      } else if (this.selectedEntity.type === 'pickup') {
        const idx = this.game.campaign.pickups.indexOf(this.selectedEntity.obj);
        if (idx >= 0) this.game.campaign.pickups.splice(idx, 1);
      }
      this.selectedEntity = null;
    } else if (this.selectedEdge) {
      const eIdx = world.edges.indexOf(this.selectedEdge);
      if (eIdx >= 0) world.edges.splice(eIdx, 1);
      if (this.selectedSector) {
        const secEIdx = this.selectedSector.edges.indexOf(this.selectedEdge);
        if (secEIdx >= 0) this.selectedSector.edges.splice(secEIdx, 1);
      }
      this.selectedEdge = null;
      this.selectedVertex = null;
    } else if (this.selectedSector) {
      world.sectors.delete(this.selectedSector.id);
      world.edges = world.edges.filter(e => e.sectorId !== this.selectedSector.id);
      this.selectedSector = null;
    }

    this._updatePropsPanel();
    this.draw();
  }

  splitSelectedWall() {
    const world = this.game.campaign.world;
    if (!world || !this.selectedEdge) return;
    const e = this.selectedEdge;
    const midX = this._snap((e.x1 + e.x2) / 2);
    const midY = this._snap((e.y1 + e.y2) / 2);

    const origX2 = e.x2;
    const origY2 = e.y2;
    e.x2 = midX;
    e.y2 = midY;

    const newEdge = {
      sectorId: e.sectorId,
      x1: midX,
      y1: midY,
      x2: origX2,
      y2: origY2,
      type: e.type,
      neighborSectorId: e.neighborSectorId,
      texture: e.texture,
      doorId: e.doorId
    };

    const sec = world.sectors.get(e.sectorId);
    if (sec) sec.addEdge(newEdge);
    world.edges.push(newEdge);

    this.selectedEdge = newEdge;
    this._updatePropsPanel();
    this.draw();
  }

  toggleSelectedDoor() {
    if (!this.selectedEdge) return;
    const e = this.selectedEdge;
    if (e.doorId) {
      e.doorId = null;
      e.type = e.neighborSectorId ? 'portal' : 'solid';
    } else {
      e.doorId = `door_${Math.random().toString(36).substr(2, 6)}`;
      e.type = 'portal';
    }
    this._updatePropsPanel();
    this.draw();
  }

  // INSPECTOR PANEL
  _updatePropsPanel() {
    const panel = document.getElementById('editorPropsContent');
    const badge = document.getElementById('inspectTypeBadge');
    if (!panel) return;

    if (this.selectedSector) {
      if (badge) badge.textContent = 'SECTOR';
      const s = this.selectedSector;
      panel.innerHTML = `
        <div style="background: #241430; padding: 6px 10px; border-left: 3px solid #ff5500; margin-bottom: 12px;">
          <strong style="color:#ffaa44;">SECTOR ID:</strong> <span style="color:#fff;">${s.id}</span>
        </div>

        <div style="margin-bottom: 10px;">
          <label style="color:#bbb; font-weight:bold;">Floor Height (Quota Pavimento):</label>
          <div style="display:flex; gap:6px; margin-top:4px;">
            <input type="number" step="0.1" value="${s.floorHeight.toFixed(2)}" id="propFloorH" style="background:#0a050d; border:1px solid #ff5500; color:#fff; width:80px; padding:4px;">
            <button class="ed-sub-btn" id="btnStepDown">-0.35 (Step Down)</button>
            <button class="ed-sub-btn" id="btnStepUp">+0.35 (Step Up)</button>
          </div>
        </div>

        <div style="margin-bottom: 10px;">
          <label style="color:#bbb; font-weight:bold;">Ceiling Height (Soffitto):</label>
          <input type="number" step="0.1" value="${s.ceilingHeight.toFixed(2)}" id="propCeilH" style="background:#0a050d; border:1px solid #ff5500; color:#fff; width:100%; padding:4px; margin-top:4px;">
        </div>

        <div style="margin-bottom: 10px;">
          <label style="color:#bbb; font-weight:bold;">Light (0.2 Dark - 1.0 Bright):</label>
          <input type="range" min="0.2" max="1.0" step="0.05" value="${(s.light || 0.8).toFixed(2)}" id="propLight" style="width:100%; margin-top:4px;">
          <span id="propLightVal" style="color:#ffcc66; font-size:11px;">${(s.light || 0.8).toFixed(2)}</span>
        </div>

        <div style="margin-bottom: 10px;">
          <label style="color:#bbb; font-weight:bold;">Floor Texture:</label>
          <select id="propFloorTexSelect" style="background:#0a050d; border:1px solid #ff5500; color:#fff; width:100%; padding:5px; margin-top:4px;">
            ${this.texturesList.map(t => `<option value="${t}" ${t === s.floorTexture ? 'selected' : ''}>${t}</option>`).join('')}
          </select>
        </div>

        <div style="margin-bottom: 10px;">
          <label style="color:#bbb; font-weight:bold;">Ceiling Texture:</label>
          <select id="propCeilTexSelect" style="background:#0a050d; border:1px solid #ff5500; color:#fff; width:100%; padding:5px; margin-top:4px;">
            ${this.texturesList.map(t => `<option value="${t}" ${t === s.ceilingTexture ? 'selected' : ''}>${t}</option>`).join('')}
          </select>
        </div>

        <div style="margin-top: 15px; border-top: 1px solid #331828; padding-top: 10px;">
          <button id="btnDeleteSector" style="background:#551111; color:#fff; border:1px solid #ff4444; width:100%; padding:6px; cursor:pointer; font-weight:bold;">DELETE THIS SECTOR</button>
        </div>
      `;

      document.getElementById('propFloorH').addEventListener('change', (e) => {
        s.floorHeight = parseFloat(e.target.value) || 0;
        this.draw();
      });
      document.getElementById('btnStepUp').addEventListener('click', () => {
        s.floorHeight = parseFloat((s.floorHeight + 0.35).toFixed(2));
        document.getElementById('propFloorH').value = s.floorHeight.toFixed(2);
        this.draw();
      });
      document.getElementById('btnStepDown').addEventListener('click', () => {
        s.floorHeight = parseFloat((s.floorHeight - 0.35).toFixed(2));
        document.getElementById('propFloorH').value = s.floorHeight.toFixed(2);
        this.draw();
      });
      document.getElementById('propCeilH').addEventListener('change', (e) => {
        s.ceilingHeight = parseFloat(e.target.value) || 3.5;
        this.draw();
      });
      document.getElementById('propLight').addEventListener('input', (e) => {
        s.light = parseFloat(e.target.value);
        document.getElementById('propLightVal').textContent = s.light.toFixed(2);
      });
      document.getElementById('propFloorTexSelect').addEventListener('change', (e) => {
        s.floorTexture = e.target.value;
        this.draw();
      });
      document.getElementById('propCeilTexSelect').addEventListener('change', (e) => {
        s.ceilingTexture = e.target.value;
        this.draw();
      });
      document.getElementById('btnDeleteSector').addEventListener('click', () => this.deleteSelected());

    } else if (this.selectedEdge) {
      if (badge) badge.textContent = 'WALL / EDGE';
      const ed = this.selectedEdge;
      panel.innerHTML = `
        <div style="background: #182230; padding: 6px 10px; border-left: 3px solid #3388ff; margin-bottom: 12px;">
          <strong style="color:#88bbff;">WALL TYPE:</strong> <span style="color:#fff;">${ed.type.toUpperCase()} ${ed.doorId ? '(DOOR)' : ''}</span>
          <div style="font-size:10px; color:#aaa; margin-top:2px;">Sector: ${ed.sectorId}</div>
        </div>

        <div style="margin-bottom: 10px;">
          <label style="color:#bbb; font-weight:bold;">Wall Type:</label>
          <select id="propWallType" style="background:#0a050d; border:1px solid #ff5500; color:#fff; width:100%; padding:5px; margin-top:4px;">
            <option value="solid" ${ed.type === 'solid' ? 'selected' : ''}>Solid (Solid Wall)</option>
            <option value="portal" ${ed.type === 'portal' && !ed.doorId ? 'selected' : ''}>Portal (Passage / Opening)</option>
            <option value="door" ${ed.doorId ? 'selected' : ''}>Door (Interactive Gate)</option>
          </select>
        </div>

        <div style="margin-bottom: 10px;">
          <label style="color:#bbb; font-weight:bold;">Wall Texture:</label>
          <select id="propWallTexSelect" style="background:#0a050d; border:1px solid #ff5500; color:#fff; width:100%; padding:5px; margin-top:4px;">
            ${this.texturesList.map(t => `<option value="${t}" ${t === ed.texture ? 'selected' : ''}>${t}</option>`).join('')}
          </select>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px; margin-bottom: 10px;">
          <div>
            <label style="color:#888; font-size:10px;">X1:</label>
            <input type="number" step="0.1" value="${ed.x1.toFixed(2)}" id="propEdgeX1" style="background:#0a050d; border:1px solid #444; color:#fff; width:100%; padding:3px;">
          </div>
          <div>
            <label style="color:#888; font-size:10px;">Y1:</label>
            <input type="number" step="0.1" value="${ed.y1.toFixed(2)}" id="propEdgeY1" style="background:#0a050d; border:1px solid #444; color:#fff; width:100%; padding:3px;">
          </div>
          <div>
            <label style="color:#888; font-size:10px;">X2:</label>
            <input type="number" step="0.1" value="${ed.x2.toFixed(2)}" id="propEdgeX2" style="background:#0a050d; border:1px solid #444; color:#fff; width:100%; padding:3px;">
          </div>
          <div>
            <label style="color:#888; font-size:10px;">Y2:</label>
            <input type="number" step="0.1" value="${ed.y2.toFixed(2)}" id="propEdgeY2" style="background:#0a050d; border:1px solid #444; color:#fff; width:100%; padding:3px;">
          </div>
        </div>

        <div style="display: flex; gap: 6px; margin-top: 10px;">
          <button id="btnSplitWallInspect" style="flex:1; background:#1b2538; color:#88bbff; border:1px solid #3366bb; padding:6px; cursor:pointer; font-weight:bold;">SPLIT IN 2</button>
          <button id="btnDeleteWall" style="flex:1; background:#551111; color:#fff; border:1px solid #ff4444; padding:6px; cursor:pointer; font-weight:bold;">DELETE WALL</button>
        </div>
      `;

      document.getElementById('propWallType').addEventListener('change', (e) => {
        const val = e.target.value;
        if (val === 'door') {
          ed.doorId = `door_${Math.random().toString(36).substr(2, 6)}`;
          ed.type = 'portal';
        } else if (val === 'portal') {
          ed.doorId = null;
          ed.type = 'portal';
        } else {
          ed.doorId = null;
          ed.type = 'solid';
        }
        this.draw();
      });
      document.getElementById('propWallTexSelect').addEventListener('change', (e) => {
        ed.texture = e.target.value;
        ed.upperTexture = e.target.value;
        ed.lowerTexture = e.target.value;
      });
      document.getElementById('propEdgeX1').addEventListener('change', (e) => { ed.x1 = parseFloat(e.target.value) || 0; this.draw(); });
      document.getElementById('propEdgeY1').addEventListener('change', (e) => { ed.y1 = parseFloat(e.target.value) || 0; this.draw(); });
      document.getElementById('propEdgeX2').addEventListener('change', (e) => { ed.x2 = parseFloat(e.target.value) || 0; this.draw(); });
      document.getElementById('propEdgeY2').addEventListener('change', (e) => { ed.y2 = parseFloat(e.target.value) || 0; this.draw(); });
      document.getElementById('btnSplitWallInspect').addEventListener('click', () => this.splitSelectedWall());
      document.getElementById('btnDeleteWall').addEventListener('click', () => this.deleteSelected());

    } else if (this.selectedEntity) {
      if (badge) badge.textContent = this.selectedEntity.type.toUpperCase();
      const ent = this.selectedEntity;
      
      if (ent.type === 'enemy') {
        panel.innerHTML = `
          <div style="background: #2a1111; padding: 6px 10px; border-left: 3px solid #ff4400; margin-bottom: 12px;">
            <strong style="color:#ff8844;">MONSTER:</strong> <span style="color:#fff;">${ent.obj.name}</span>
          </div>

          <div style="margin-bottom: 10px;">
            <label style="color:#bbb; font-weight:bold;">Archetype (Monster Type):</label>
            <select id="propEnemyType" style="background:#0a050d; border:1px solid #ff5500; color:#fff; width:100%; padding:5px; margin-top:4px;">
              ${this.enemyTypes.map(t => `<option value="${t}" ${t === ent.obj.name ? 'selected' : ''}>${t.toUpperCase()}</option>`).join('')}
            </select>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px; margin-bottom: 10px;">
            <div>
              <label style="color:#888; font-size:10px;">Pos X:</label>
              <input type="number" step="0.1" value="${ent.obj.x.toFixed(2)}" id="propEntX" style="background:#0a050d; border:1px solid #444; color:#fff; width:100%; padding:4px;">
            </div>
            <div>
              <label style="color:#888; font-size:10px;">Pos Y:</label>
              <input type="number" step="0.1" value="${ent.obj.y.toFixed(2)}" id="propEntY" style="background:#0a050d; border:1px solid #444; color:#fff; width:100%; padding:4px;">
            </div>
          </div>

          <button id="btnDeleteEnt" style="background:#551111; color:#fff; border:1px solid #ff4444; width:100%; padding:6px; cursor:pointer; font-weight:bold; margin-top:10px;">DELETE ENEMY</button>
        `;

        document.getElementById('propEnemyType').addEventListener('change', (e) => {
          ent.obj.name = e.target.value;
          this.draw();
        });
        document.getElementById('propEntX').addEventListener('change', (e) => { ent.obj.x = parseFloat(e.target.value) || 0; this.draw(); });
        document.getElementById('propEntY').addEventListener('change', (e) => { ent.obj.y = parseFloat(e.target.value) || 0; this.draw(); });
        document.getElementById('btnDeleteEnt').addEventListener('click', () => this.deleteSelected());

      } else {
        panel.innerHTML = `
          <div style="background: #112a2a; padding: 6px 10px; border-left: 3px solid #00ffff; margin-bottom: 12px;">
            <strong style="color:#88ffff;">PICKUP ITEM:</strong> <span style="color:#fff;">${ent.obj.name}</span>
          </div>

          <div style="margin-bottom: 10px;">
            <label style="color:#bbb; font-weight:bold;">Pickup Preset:</label>
            <select id="propPickupPreset" style="background:#0a050d; border:1px solid #ff5500; color:#fff; width:100%; padding:5px; margin-top:4px;">
              ${this.pickupTypes.map((p, idx) => `<option value="${idx}" ${p.name === ent.obj.name ? 'selected' : ''}>${p.name}</option>`).join('')}
            </select>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px; margin-bottom: 10px;">
            <div>
              <label style="color:#888; font-size:10px;">Pos X:</label>
              <input type="number" step="0.1" value="${ent.obj.x.toFixed(2)}" id="propEntX" style="background:#0a050d; border:1px solid #444; color:#fff; width:100%; padding:4px;">
            </div>
            <div>
              <label style="color:#888; font-size:10px;">Pos Y:</label>
              <input type="number" step="0.1" value="${ent.obj.y.toFixed(2)}" id="propEntY" style="background:#0a050d; border:1px solid #444; color:#fff; width:100%; padding:4px;">
            </div>
          </div>

          <button id="btnDeleteEnt" style="background:#551111; color:#fff; border:1px solid #ff4444; width:100%; padding:6px; cursor:pointer; font-weight:bold; margin-top:10px;">DELETE ITEM</button>
        `;

        document.getElementById('propPickupPreset').addEventListener('change', (e) => {
          const item = this.pickupTypes[parseInt(e.target.value, 10)];
          if (item) {
            ent.obj.name = item.name;
            ent.obj.type = item.type;
            if (item.weaponId) ent.obj.weaponId = item.weaponId;
            if (item.ammoType) ent.obj.ammoType = item.ammoType;
            if (item.amount) ent.obj.amount = item.amount;
          }
          this.draw();
        });
        document.getElementById('propEntX').addEventListener('change', (e) => { ent.obj.x = parseFloat(e.target.value) || 0; this.draw(); });
        document.getElementById('propEntY').addEventListener('change', (e) => { ent.obj.y = parseFloat(e.target.value) || 0; this.draw(); });
        document.getElementById('btnDeleteEnt').addEventListener('click', () => this.deleteSelected());
      }
    } else {
      if (badge) badge.textContent = 'NONE';
      panel.innerHTML = `
        <p style="color: #777; line-height: 1.5;">Click any Sector, Wall, Vertex, Enemy or Pickup to inspect and edit details.</p>
        <div style="margin-top: 15px; font-size: 11px; color: #8c7b6c; background: rgba(0,0,0,0.3); padding: 8px; border: 1px dashed #3a2233;">
          <strong>Quick Keys:</strong><br>
          &bull; <strong>[P]</strong>: Test play here<br>
          &bull; <strong>[Del]</strong>: Remove selected<br>
          &bull; <strong>[Esc]</strong>: Cancel action<br>
          &bull; <strong>[Tab]</strong>: Return to game
        </div>
      `;
    }
  }

  exportMap(asDownload = false) {
    const world = this.game.campaign.world;
    if (!world) return;

    const exportData = {
      id: world.id,
      title: world.title,
      area: world.area,
      panorama: world.panorama,
      start: world.start,
      sectors: Array.from(world.sectors.values()).map(s => ({
        id: s.id,
        floorHeight: s.floorHeight,
        ceilingHeight: s.ceilingHeight,
        floorTexture: s.floorTexture,
        ceilingTexture: s.ceilingTexture,
        light: s.light,
        fog: s.fog,
        isSky: s.isSky
      })),
      edges: world.edges.map(e => ({
        sectorId: e.sectorId,
        x1: parseFloat(e.x1.toFixed(2)),
        y1: parseFloat(e.y1.toFixed(2)),
        x2: parseFloat(e.x2.toFixed(2)),
        y2: parseFloat(e.y2.toFixed(2)),
        type: e.type,
        neighborSectorId: e.neighborSectorId,
        texture: e.texture,
        doorId: e.doorId
      })),
      doors: Array.from(world.doors.values()).map(d => ({
        id: d.id,
        type: d.type,
        state: d.state,
        requiredKey: d.requiredKey,
        speed: d.speed,
        isSecret: d.isSecret
      })),
      props: world.props,
      pickups: this.game.campaign.pickups.map(p => ({
        type: p.type,
        name: p.name,
        sectorId: p.sectorId,
        x: parseFloat(p.x.toFixed(2)),
        y: parseFloat(p.y.toFixed(2)),
        weaponId: p.weaponId,
        ammoType: p.ammoType,
        amount: p.amount
      })),
      enemies: this.game.campaign.enemies.map(e => ({
        type: e.name,
        sectorId: e.sectorId,
        x: parseFloat(e.x.toFixed(2)),
        y: parseFloat(e.y.toFixed(2)),
        isBoss: e.archetype ? e.archetype.isBoss : false
      }))
    };

    const jsonStr = JSON.stringify(exportData, null, 2);

    if (asDownload) {
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${world.id || 'map'}_modified.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      navigator.clipboard.writeText(jsonStr).then(() => {
        alert('Map JSON copied to clipboard successfully!');
      }).catch(() => {
        prompt('Copy map JSON from here:', jsonStr);
      });
    }
  }

  draw() {
    if (!this.active || !this.ctx) return;

    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const world = this.game.campaign.world;

    ctx.fillStyle = '#090510';
    ctx.fillRect(0, 0, w, h);

    // 1. Draw Grid
    this._drawGrid(ctx, w, h);

    if (!world) return;

    // 2. Draw Sectors (Floor Polygons)
    for (const sec of world.sectors.values()) {
      if (!sec.edges || sec.edges.length === 0) continue;

      ctx.beginPath();
      const p0 = this._worldToScreen(sec.edges[0].x1, sec.edges[0].y1);
      ctx.moveTo(p0.x, p0.y);
      for (const e of sec.edges) {
        const p2 = this._worldToScreen(e.x2, e.y2);
        ctx.lineTo(p2.x, p2.y);
      }
      ctx.closePath();

      const isSelected = this.selectedSector && this.selectedSector.id === sec.id;
      const hNorm = Math.max(0, Math.min(1, (sec.floorHeight + 0.5) / 2.5));
      ctx.fillStyle = isSelected ? 'rgba(255, 100, 0, 0.45)' : `rgba(${Math.floor(25 + hNorm * 50)}, ${Math.floor(20 + hNorm * 35)}, ${Math.floor(45 + hNorm * 70)}, 0.55)`;
      ctx.fill();

      // Sector label: ID + Floor Height
      const midX = (sec.bounds.minX + sec.bounds.maxX) / 2;
      const midY = (sec.bounds.minY + sec.bounds.maxY) / 2;
      const sp = this._worldToScreen(midX, midY);

      ctx.font = 'bold 11px monospace';
      ctx.fillStyle = isSelected ? '#ffaa00' : '#88aaff';
      ctx.textAlign = 'center';
      ctx.fillText(sec.id, sp.x, sp.y - 4);
      ctx.font = '9px monospace';
      ctx.fillStyle = '#aaa';
      ctx.fillText(`F:${sec.floorHeight.toFixed(1)} C:${sec.ceilingHeight.toFixed(1)}`, sp.x, sp.y + 8);
    }

    // 3. Draw Edges (Walls, Portals, Doors)
    for (const edge of world.edges) {
      const p1 = this._worldToScreen(edge.x1, edge.y1);
      const p2 = this._worldToScreen(edge.x2, edge.y2);
      const isSelected = this.selectedEdge === edge;

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);

      if (isSelected) {
        ctx.strokeStyle = '#ff2255';
        ctx.lineWidth = 4;
        ctx.setLineDash([]);
      } else if (edge.doorId) {
        ctx.strokeStyle = '#ffcc00';
        ctx.lineWidth = 3.5;
        ctx.setLineDash([4, 4]);
      } else if (edge.type === 'portal') {
        ctx.strokeStyle = '#3388ff';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([2, 2]);
      } else {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([]);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Vertices circles
      this._drawVertex(ctx, p1.x, p1.y, edge, true);
      this._drawVertex(ctx, p2.x, p2.y, edge, false);
    }

    // 4. Draw Props
    if (world.props) {
      for (const pr of world.props) {
        const sp = this._worldToScreen(pr.x, pr.y);
        ctx.fillStyle = '#33cc55';
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = '9px monospace';
        ctx.fillStyle = '#33cc55';
        ctx.fillText(pr.name, sp.x + 6, sp.y + 3);
      }
    }

    // 5. Draw Pickups
    for (const pk of this.game.campaign.pickups) {
      const sp = this._worldToScreen(pk.x, pk.y);
      const isSel = this.selectedEntity && this.selectedEntity.obj === pk;
      ctx.fillStyle = isSel ? '#ffffff' : (pk.type === 'key' ? '#ff33ff' : '#00ffff');
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, isSel ? 7 : 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.font = '9px monospace';
      ctx.fillStyle = '#00ffff';
      ctx.fillText(pk.name, sp.x + 7, sp.y + 3);
    }

    // 6. Draw Enemies
    for (const e of this.game.campaign.enemies) {
      const sp = this._worldToScreen(e.x, e.y);
      const isSel = this.selectedEntity && this.selectedEntity.obj === e;
      ctx.fillStyle = isSel ? '#ffffff' : (e.archetype && e.archetype.isBoss ? '#ff0044' : '#ff4400');
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, isSel ? 8 : (e.archetype && e.archetype.isBoss ? 8 : 6), 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.stroke();
      ctx.font = 'bold 9px monospace';
      ctx.fillStyle = '#ff8866';
      ctx.fillText(e.name, sp.x + 8, sp.y + 3);
    }

    // 7. Draw Player & View Cone
    const player = this.game.campaign.player;
    if (player) {
      const sp = this._worldToScreen(player.x, player.y);
      const facingAngle = Math.atan2(Math.cos(player.angle), -Math.sin(player.angle));
      ctx.fillStyle = 'rgba(255, 255, 100, 0.25)';
      ctx.beginPath();
      ctx.moveTo(sp.x, sp.y);
      const coneLen = 40;
      const halfFov = 35 * (Math.PI / 180);
      ctx.lineTo(sp.x + Math.cos(facingAngle - halfFov) * coneLen, sp.y + Math.sin(facingAngle - halfFov) * coneLen);
      ctx.arc(sp.x, sp.y, coneLen, facingAngle - halfFov, facingAngle + halfFov);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ffff00';
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.stroke();
    }

    // 8. Drawing In-Progress Previews
    if (this.sectorBoxStart) {
      const sp1 = this._worldToScreen(this.sectorBoxStart.x, this.sectorBoxStart.y);
      const sp2 = this._worldToScreen(this._snap(this.mouseWorld.x), this._snap(this.mouseWorld.y));
      ctx.fillStyle = this.mode === 'add_stair' ? 'rgba(80, 160, 255, 0.35)' : 'rgba(255, 160, 0, 0.35)';
      ctx.strokeStyle = this.mode === 'add_stair' ? '#44aaff' : '#ffaa00';
      ctx.lineWidth = 2;
      const rx = Math.min(sp1.x, sp2.x);
      const ry = Math.min(sp1.y, sp2.y);
      const rw = Math.abs(sp2.x - sp1.x);
      const rh = Math.abs(sp2.y - sp1.y);
      ctx.fillRect(rx, ry, rw, rh);
      ctx.strokeRect(rx, ry, rw, rh);
    } else if (this.wallDrawStart) {
      const sp1 = this._worldToScreen(this.wallDrawStart.x, this.wallDrawStart.y);
      const sp2 = this._worldToScreen(this._snap(this.mouseWorld.x), this._snap(this.mouseWorld.y));
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(sp1.x, sp1.y);
      ctx.lineTo(sp2.x, sp2.y);
      ctx.stroke();
    }
  }

  _drawVertex(ctx, sx, sy, edge, isStart) {
    const isSelected = this.selectedVertex && this.selectedVertex.edge === edge && this.selectedVertex.isStart === isStart;
    ctx.fillStyle = isSelected ? '#ff2255' : '#4488ff';
    ctx.beginPath();
    ctx.arc(sx, sy, isSelected ? 5 : 3, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawGrid(ctx, w, h) {
    const gridSize = this.zoom * this.gridStep;
    const startX = this.panX % gridSize;
    const startY = this.panY % gridSize;

    ctx.strokeStyle = '#150d1c';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = startX; x < w; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    for (let y = startY; y < h; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();
  }
}
