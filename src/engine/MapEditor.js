// MapEditor.js - Visual Top-Down Map Viewer & Interactive 2.5D Sector Editor
// Permette di:
// 1. Vedere la mappa dall'alto (pan, zoom, settori, pareti, portali, altezze, porte, nemici, pickup)
// 2. Cliccare e trascinare vertici/porte/entità
// 3. Modificare floorHeight, ceilingHeight, texture, luci, porte e tipologie di settore
// 4. Esportare/salvare il JSON della mappa modificata direttamente negli appunti o come download file!

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

    this.selectedSector = null;
    this.selectedVertex = null; // { sectorId, edgeIndex, isStart }
    this.selectedEntity = null; // { type, obj }
    this.hoveredItem = null;

    this.domElement = null;
    this._createUI();
  }

  _createUI() {
    // Top-bar toggle and editor panel overlay
    const editorContainer = document.createElement('div');
    editorContainer.id = 'mapEditorContainer';
    editorContainer.style.cssText = `
      display: none;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(14, 10, 20, 0.96);
      z-index: 1000;
      font-family: 'Courier New', monospace;
      color: #e6a13b;
    `;

    editorContainer.innerHTML = `
      <div id="editorTopBar" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; background: #1f1124; border-bottom: 2px solid #ff5500;">
        <div>
          <span style="font-weight: bold; font-size: 16px; color: #ff5500;">MAP INSPECTOR & EDITOR</span>
          <span id="editorMapTitle" style="margin-left: 15px; color: #aaa;">Livello</span>
        </div>
        <div style="display: flex; gap: 8px;">
          <button id="btnExportMap" style="background: #2a1420; color: #ffaa44; border: 1px solid #ff5500; padding: 4px 12px; cursor: pointer; font-family: inherit; font-weight: bold;">ESPORTA JSON</button>
          <button id="btnCopyMap" style="background: #2a1420; color: #ffaa44; border: 1px solid #ff5500; padding: 4px 12px; cursor: pointer; font-family: inherit; font-weight: bold;">COPIA DATI</button>
          <button id="btnCloseEditor" style="background: #551111; color: #fff; border: 1px solid #ff4444; padding: 4px 12px; cursor: pointer; font-family: inherit; font-weight: bold;">TORNA AL GIOCO [TAB / M]</button>
        </div>
      </div>
      
      <div style="display: flex; width: 100%; height: calc(100% - 50px);">
        <!-- 2D Interactive Canvas -->
        <div style="position: relative; flex: 1; height: 100%; overflow: hidden; background: #0b070f;">
          <canvas id="editorCanvas" style="width: 100%; height: 100%; cursor: crosshair; display: block;"></canvas>
          <div style="position: absolute; bottom: 10px; left: 10px; color: #888; font-size: 11px; background: rgba(0,0,0,0.7); padding: 6px; border: 1px solid #333;">
            Tasto SX: Trascina Vista / Seleziona &bull; Shift + Trascina: Sposta Elementi &bull; Rotellina: Zoom &bull; TAB / M: Chiudi
          </div>
        </div>

        <!-- Properties Panel Sidebar -->
        <div id="editorSidebar" style="width: 320px; background: #160c1c; border-left: 2px solid #ff5500; padding: 14px; overflow-y: auto; font-size: 12px;">
          <h3 style="color: #ff5500; border-bottom: 1px solid #3d1c2b; padding-bottom: 4px; margin-bottom: 12px;">PROPRIETÀ SELEZIONE</h3>
          <div id="editorPropsContent">
            <p style="color: #777;">Clicca su un settore, vertice, porta o nemico per visualizzarne e modificarne le quote e i parametri.</p>
          </div>
        </div>
      </div>
    `;

    document.getElementById('gameContainer').appendChild(editorContainer);
    this.domElement = editorContainer;
    this.canvas = document.getElementById('editorCanvas');
    this.ctx = this.canvas.getContext('2d');

    // Button event handlers
    document.getElementById('btnCloseEditor').addEventListener('click', () => this.toggle());
    document.getElementById('btnExportMap').addEventListener('click', () => this.exportMap(true));
    document.getElementById('btnCopyMap').addEventListener('click', () => this.exportMap(false));

    // Global shortcut to toggle editor (TAB or KeyM)
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Tab' || e.code === 'KeyM') {
        e.preventDefault();
        this.toggle();
      }
    });

    this._bindCanvasEvents();
  }

  toggle() {
    this.active = !this.active;
    if (this.active) {
      if (document.exitPointerLock) document.exitPointerLock();
      this.domElement.style.display = 'block';
      this.resize();
      // Center on player
      if (this.game.campaign.player) {
        this.panX = this.canvas.width / 2 - this.game.campaign.player.x * this.zoom;
        this.panY = this.canvas.height / 2 - this.game.campaign.player.y * this.zoom;
      }
      document.getElementById('editorMapTitle').textContent = `[${this.game.campaign.world.title}]`;
      this.draw();
    } else {
      this.domElement.style.display = 'none';
      this.game.canvas.requestPointerLock?.();
    }
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = this.canvas.parentElement.clientWidth;
    this.canvas.height = this.canvas.parentElement.clientHeight;
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

      // Zoom centered at cursor
      this.panX = mouseX - (mouseX - this.panX) * zoomFactor;
      this.panY = mouseY - (mouseY - this.panY) * zoomFactor;
      this.zoom *= zoomFactor;
      this.zoom = Math.max(8, Math.min(120, this.zoom));
      this.draw();
    });

    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.dragStartX = e.clientX;
      this.dragStartY = e.clientY;

      const worldPos = this._screenToWorld(e.offsetX, e.offsetY);
      this._handleSelection(worldPos.x, worldPos.y, e.shiftKey);
      this.draw();
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.active) return;
      if (this.isDragging) {
        const dx = e.clientX - this.dragStartX;
        const dy = e.clientY - this.dragStartY;
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;

        if (e.shiftKey && this.selectedVertex) {
          // Drag vertex
          const deltaWorldX = dx / this.zoom;
          const deltaWorldY = dy / this.zoom;
          this.selectedVertex.edge[this.selectedVertex.isStart ? 'x1' : 'x2'] += deltaWorldX;
          this.selectedVertex.edge[this.selectedVertex.isStart ? 'y1' : 'y2'] += deltaWorldY;
          this._updatePropsPanel();
        } else if (e.shiftKey && this.selectedEntity) {
          // Drag enemy or pickup or player
          this.selectedEntity.obj.x += dx / this.zoom;
          this.selectedEntity.obj.y += dy / this.zoom;
          this._updatePropsPanel();
        } else {
          // Pan camera
          this.panX += dx;
          this.panY += dy;
        }
        this.draw();
      }
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });
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

  _handleSelection(wx, wy, isShift) {
    const world = this.game.campaign.world;
    if (!world) return;

    // 1. Check vertex selection (tolerance 0.4 units)
    for (const edge of world.edges) {
      if (Math.hypot(edge.x1 - wx, edge.y1 - wy) < 0.4) {
        this.selectedVertex = { edge, isStart: true };
        this.selectedEntity = null;
        this._updatePropsPanel();
        return;
      }
      if (Math.hypot(edge.x2 - wx, edge.y2 - wy) < 0.4) {
        this.selectedVertex = { edge, isStart: false };
        this.selectedEntity = null;
        this._updatePropsPanel();
        return;
      }
    }

    // 2. Check entities (Enemies, Pickups, Player)
    for (const e of this.game.campaign.enemies) {
      if (Math.hypot(e.x - wx, e.y - wy) < 0.6) {
        this.selectedEntity = { type: 'enemy', obj: e };
        this.selectedVertex = null;
        this._updatePropsPanel();
        return;
      }
    }

    for (const pk of this.game.campaign.pickups) {
      if (Math.hypot(pk.x - wx, pk.y - wy) < 0.5) {
        this.selectedEntity = { type: 'pickup', obj: pk };
        this.selectedVertex = null;
        this._updatePropsPanel();
        return;
      }
    }

    // 3. Check Sector
    for (const sec of world.sectors.values()) {
      if (sec.containsPoint(wx, wy)) {
        this.selectedSector = sec;
        this.selectedVertex = null;
        this.selectedEntity = null;
        this._updatePropsPanel();
        return;
      }
    }

    this.selectedSector = null;
    this.selectedVertex = null;
    this.selectedEntity = null;
    this._updatePropsPanel();
  }

  _updatePropsPanel() {
    const panel = document.getElementById('editorPropsContent');
    if (!panel) return;

    if (this.selectedSector) {
      const s = this.selectedSector;
      panel.innerHTML = `
        <h4 style="color:#ffaa44; margin-bottom: 8px;">Settore: <span style="color:#fff;">${s.id}</span></h4>
        <div style="margin-bottom: 8px;">
          <label style="display:block; color:#aaa;">Quota Pavimento (floorHeight):</label>
          <input type="number" step="0.1" value="${s.floorHeight.toFixed(2)}" id="propFloorH" style="background:#0a050d; border:1px solid #ff5500; color:#fff; width:100%; padding:4px;">
        </div>
        <div style="margin-bottom: 8px;">
          <label style="display:block; color:#aaa;">Quota Soffitto (ceilingHeight):</label>
          <input type="number" step="0.1" value="${s.ceilingHeight.toFixed(2)}" id="propCeilH" style="background:#0a050d; border:1px solid #ff5500; color:#fff; width:100%; padding:4px;">
        </div>
        <div style="margin-bottom: 8px;">
          <label style="display:block; color:#aaa;">Luce (0.0 - 1.0):</label>
          <input type="number" step="0.05" min="0" max="1" value="${(s.light || 0.8).toFixed(2)}" id="propLight" style="background:#0a050d; border:1px solid #ff5500; color:#fff; width:100%; padding:4px;">
        </div>
        <div style="margin-bottom: 8px;">
          <label style="display:block; color:#aaa;">Texture Pavimento:</label>
          <input type="text" value="${s.floorTexture || ''}" id="propFloorTex" style="background:#0a050d; border:1px solid #ff5500; color:#fff; width:100%; padding:4px;">
        </div>
        <div style="margin-bottom: 8px;">
          <label style="display:block; color:#aaa;">Texture Soffitto:</label>
          <input type="text" value="${s.ceilingTexture || ''}" id="propCeilTex" style="background:#0a050d; border:1px solid #ff5500; color:#fff; width:100%; padding:4px;">
        </div>
        <div style="margin-top: 14px; font-size: 11px; color: #888;">
          Pareti / Edges nel settore: ${s.edges.length}
        </div>
      `;

      document.getElementById('propFloorH').addEventListener('change', (e) => {
        s.floorHeight = parseFloat(e.target.value) || 0;
        this.draw();
      });
      document.getElementById('propCeilH').addEventListener('change', (e) => {
        s.ceilingHeight = parseFloat(e.target.value) || 3.5;
        this.draw();
      });
      document.getElementById('propLight').addEventListener('change', (e) => {
        s.light = parseFloat(e.target.value) || 0.8;
      });
      document.getElementById('propFloorTex').addEventListener('change', (e) => {
        s.floorTexture = e.target.value;
      });
      document.getElementById('propCeilTex').addEventListener('change', (e) => {
        s.ceilingTexture = e.target.value;
      });
    } else if (this.selectedVertex) {
      const v = this.selectedVertex;
      const xKey = v.isStart ? 'x1' : 'x2';
      const yKey = v.isStart ? 'y1' : 'y2';
      panel.innerHTML = `
        <h4 style="color:#ffaa44; margin-bottom: 8px;">Vertice Parete</h4>
        <p style="color:#aaa; font-size:11px;">Settore: ${v.edge.sectorId}</p>
        <p style="color:#aaa; font-size:11px;">Tipo: ${v.edge.type} ${v.edge.doorId ? '(Porta: ' + v.edge.doorId + ')' : ''}</p>
        <div style="margin-bottom: 8px; margin-top:8px;">
          <label style="display:block; color:#aaa;">Coordinata X:</label>
          <input type="number" step="0.1" value="${v.edge[xKey].toFixed(2)}" id="propVertX" style="background:#0a050d; border:1px solid #ff5500; color:#fff; width:100%; padding:4px;">
        </div>
        <div style="margin-bottom: 8px;">
          <label style="display:block; color:#aaa;">Coordinata Y:</label>
          <input type="number" step="0.1" value="${v.edge[yKey].toFixed(2)}" id="propVertY" style="background:#0a050d; border:1px solid #ff5500; color:#fff; width:100%; padding:4px;">
        </div>
        <p style="color:#ff7744; font-size:11px; margin-top:12px;">Suggerimento: puoi anche tenere premuto SHIFT e trascinare il vertice con il mouse per muoverlo in tempo reale!</p>
      `;

      document.getElementById('propVertX').addEventListener('change', (e) => {
        v.edge[xKey] = parseFloat(e.target.value) || 0;
        this.draw();
      });
      document.getElementById('propVertY').addEventListener('change', (e) => {
        v.edge[yKey] = parseFloat(e.target.value) || 0;
        this.draw();
      });
    } else if (this.selectedEntity) {
      const ent = this.selectedEntity;
      panel.innerHTML = `
        <h4 style="color:#ffaa44; margin-bottom: 8px;">Entità: <span style="color:#fff;">${ent.type.toUpperCase()}</span></h4>
        <p style="color:#aaa; font-size:11px;">Nome / Tipo: ${ent.obj.name || ent.obj.type}</p>
        <div style="margin-bottom: 8px; margin-top:8px;">
          <label style="display:block; color:#aaa;">Posizione X:</label>
          <input type="number" step="0.1" value="${ent.obj.x.toFixed(2)}" id="propEntX" style="background:#0a050d; border:1px solid #ff5500; color:#fff; width:100%; padding:4px;">
        </div>
        <div style="margin-bottom: 8px;">
          <label style="display:block; color:#aaa;">Posizione Y:</label>
          <input type="number" step="0.1" value="${ent.obj.y.toFixed(2)}" id="propEntY" style="background:#0a050d; border:1px solid #ff5500; color:#fff; width:100%; padding:4px;">
        </div>
        <p style="color:#ff7744; font-size:11px; margin-top:12px;">Trascina con SHIFT + Click per riposizionare ovunque nella mappa.</p>
      `;

      document.getElementById('propEntX').addEventListener('change', (e) => {
        ent.obj.x = parseFloat(e.target.value) || 0;
        this.draw();
      });
      document.getElementById('propEntY').addEventListener('change', (e) => {
        ent.obj.y = parseFloat(e.target.value) || 0;
        this.draw();
      });
    } else {
      panel.innerHTML = `<p style="color: #777;">Clicca su un settore, vertice o entità per modificarne le caratteristiche.</p>`;
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
        isBoss: e.archetype.isBoss || false
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
        alert('Mappa copiata negli appunti in formato JSON!');
      }).catch(() => {
        prompt('Copia il JSON della mappa da qui:', jsonStr);
      });
    }
  }

  draw() {
    if (!this.active || !this.ctx) return;

    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const world = this.game.campaign.world;

    ctx.fillStyle = '#08050c';
    ctx.fillRect(0, 0, w, h);

    // 1. Draw Grid lines
    this._drawGrid(ctx, w, h);

    if (!world) return;

    // 2. Draw Sectors (Floor Polygons with heights)
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
      // Shade sector based on height: lower is darker, higher is brighter
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
      ctx.fillText(`${sec.id}`, sp.x, sp.y - 4);
      ctx.font = '9px monospace';
      ctx.fillStyle = '#aaa';
      ctx.fillText(`F:${sec.floorHeight.toFixed(1)} C:${sec.ceilingHeight.toFixed(1)}`, sp.x, sp.y + 8);
    }

    // 3. Draw Edges (Solid walls, Portals, Doors)
    for (const edge of world.edges) {
      const p1 = this._worldToScreen(edge.x1, edge.y1);
      const p2 = this._worldToScreen(edge.x2, edge.y2);

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);

      if (edge.doorId) {
        // Door edge: Amber/Yellow dashed
        ctx.strokeStyle = '#ffcc00';
        ctx.lineWidth = 4;
        ctx.setLineDash([4, 4]);
      } else if (edge.type === 'portal') {
        // Portal edge: Cyan / Blue thin
        ctx.strokeStyle = '#2277bb';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([2, 2]);
      } else {
        // Solid wall: White / Red solid
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
      ctx.arc(sp.x, sp.y, 5, 0, Math.PI * 2);
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
      ctx.fillStyle = isSel ? '#ffffff' : (e.archetype.isBoss ? '#ff0044' : '#ff4400');
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, e.archetype.isBoss ? 8 : 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.stroke();
      ctx.font = 'bold 9px monospace';
      ctx.fillStyle = '#ff8866';
      ctx.fillText(e.name, sp.x + 8, sp.y + 3);
    }

    // 7. Draw Player with View Cone
    const player = this.game.campaign.player;
    if (player) {
      const sp = this._worldToScreen(player.x, player.y);
      // View Cone oriented with camera forward (-sin(angle), cos(angle))
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

      // Player point
      ctx.fillStyle = '#ffff00';
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.stroke();
    }
  }

  _drawVertex(ctx, sx, sy, edge, isStart) {
    const isSelected = this.selectedVertex && this.selectedVertex.edge === edge && this.selectedVertex.isStart === isStart;
    ctx.fillStyle = isSelected ? '#ff5500' : '#4488ff';
    ctx.beginPath();
    ctx.arc(sx, sy, isSelected ? 5 : 3, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawGrid(ctx, w, h) {
    const gridSize = this.zoom;
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
