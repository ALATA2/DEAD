// SectorRenderer.js - True 2.5D Sector & Portal Engine with Variable Heights
// Amiga 1200 AGA aesthetic with column-based vertical portal clipping

import { CONFIG } from '../config.js';

export class SectorRenderer {
  constructor(canvas, assetRegistry) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.assets = assetRegistry;

    this.width = canvas.width;
    this.height = canvas.height;

    // Direct pixel manipulation for retro performance
    this.imgData = this.ctx.createImageData(this.width, this.height);
    this.pixels = new Uint32Array(this.imgData.data.buffer);

    // Depth buffer and column clip limits for 1D portal occlusion
    this.zBuffer = new Float32Array(this.width);
    this.clipTop = new Int16Array(this.width);
    this.clipBottom = new Int16Array(this.width);

    // Precomputed ray tables
    this.rayAngles = new Float32Array(this.width);
    this.cosAngles = new Float32Array(this.width);
    this.tanAngles = new Float32Array(this.width);

    this.fov = 70 * (Math.PI / 180);
    this._initTables();
  }

  _initTables() {
    const halfFov = this.fov / 2;
    for (let x = 0; x < this.width; x++) {
      // Screen space x -> angle offset from camera center
      const screenX = (2 * x / this.width) - 1;
      const angle = Math.atan(screenX * Math.tan(halfFov));
      this.rayAngles[x] = angle;
      this.cosAngles[x] = Math.cos(angle); // for fisheye correction
      this.tanAngles[x] = Math.tan(angle);
    }
  }

  // Pre-cached texture pixel data maps for instant sampling
  getTexturePixels(area, name) {
    if (!this._texPixelCache) this._texPixelCache = new Map();
    const key = `${area}/${name}`;
    let cached = this._texPixelCache.get(key);
    if (cached) return cached;

    const img = this.assets.getTexture(area, name);
    if (!img || !img.complete || img.naturalWidth === 0) return null;

    const off = document.createElement('canvas');
    off.width = img.width || 128;
    off.height = img.height || 128;
    const octx = off.getContext('2d');
    octx.drawImage(img, 0, 0);
    const data = octx.getImageData(0, 0, off.width, off.height);
    cached = {
      width: off.width,
      height: off.height,
      pixels: new Uint32Array(data.data.buffer)
    };
    this._texPixelCache.set(key, cached);
    return cached;
  }

  render(world, player, dt) {
    // 1. Clear depth buffer and column clipping windows
    const w = this.width;
    const h = this.height;

    for (let x = 0; x < w; x++) {
      this.zBuffer[x] = 999.0;
      this.clipTop[x] = 0;
      this.clipBottom[x] = h - 1;
    }

    // 2. Render sky / panorama background
    this._renderSky(world.panorama, player.angle);

    // 3. Current player sector
    const currentSector = player.currentSector;
    if (!currentSector) {
      this.ctx.putImageData(this.imgData, 0, 0);
      return;
    }

    // 4. Portal-based recursive or stack-based traversal
    this._renderSectors(world, player, currentSector);

    // 5. Blit rendered 3D scene to canvas
    this.ctx.putImageData(this.imgData, 0, 0);
  }

  _renderSky(panoramaName, playerAngle) {
    const w = this.width;
    const h = this.height;
    const panoImg = this.assets.getPanorama(panoramaName);

    if (panoImg && panoImg.complete) {
      if (!this._panoCache) this._panoCache = new Map();
      let panoData = this._panoCache.get(panoramaName);
      if (!panoData) {
        const off = document.createElement('canvas');
        off.width = panoImg.width;
        off.height = panoImg.height;
        const octx = off.getContext('2d');
        octx.drawImage(panoImg, 0, 0);
        panoData = {
          width: off.width,
          height: off.height,
          pixels: new Uint32Array(octx.getImageData(0, 0, off.width, off.height).data.buffer)
        };
        this._panoCache.set(panoramaName, panoData);
      }

      // Draw scrolling sky
      const panoW = panoData.width;
      const panoH = panoData.height;
      const angleRatio = (((-playerAngle) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      const skyOffset = Math.floor((angleRatio / (Math.PI * 2)) * panoW);

      for (let x = 0; x < w; x++) {
        const panoX = (skyOffset + Math.floor((x / w) * (w * 1.5))) % panoW;
        for (let y = 0; y < h / 2; y++) {
          const panoY = Math.min(panoH - 1, Math.floor((y / (h / 2)) * panoH));
          this.pixels[y * w + x] = panoData.pixels[panoY * panoW + panoX];
        }
        for (let y = Math.floor(h / 2); y < h; y++) {
          this.pixels[y * w + x] = 0xFF140c1c; // Dark eerie floor backdrop
        }
      }
    } else {
      // Solid fallback eerie Amiga night sky
      for (let i = 0; i < (w * h) / 2; i++) {
        this.pixels[i] = 0xFF3b1d28; // purple dusk
      }
      for (let i = Math.floor((w * h) / 2); i < w * h; i++) {
        this.pixels[i] = 0xFF140c1c;
      }
    }
  }

  _renderSectors(world, player, startSector) {
    const w = this.width;
    const h = this.height;
    const halfW = w / 2;
    const halfH = h / 2;
    const camZ = player.z; // smooth interpolated eye height
    const area = world.area;

    // Sector & portal traversal queue
    const queue = [{
      sector: startSector,
      minCol: 0,
      maxCol: w - 1
    }];

    const visited = new Set();
    let loops = 0;

    while (queue.length > 0 && loops++ < 64) {
      const { sector, minCol, maxCol } = queue.shift();
      if (minCol > maxCol) continue;

      // Project each edge of the sector
      for (let eIdx = 0; eIdx < sector.edges.length; eIdx++) {
        const edge = sector.edges[eIdx];

        // Transform edge vertices to camera space
        const dx1 = edge.x1 - player.x;
        const dy1 = edge.y1 - player.y;
        const dx2 = edge.x2 - player.x;
        const dy2 = edge.y2 - player.y;

        const sinA = Math.sin(-player.angle);
        const cosA = Math.cos(-player.angle);

        // Rotate into view space
        let tx1 = dx1 * cosA - dy1 * sinA;
        let tz1 = dx1 * sinA + dy1 * cosA;

        let tx2 = dx2 * cosA - dy2 * sinA;
        let tz2 = dx2 * sinA + dy2 * cosA;

        // Behind camera culling & near plane clipping
        if (tz1 <= 0.1 && tz2 <= 0.1) continue;

        // Clip against near plane
        let u1 = 0, u2 = 1;
        const edgeLen = Math.hypot(edge.x2 - edge.x1, edge.y2 - edge.y1);

        if (tz1 < 0.1) {
          const t = (0.1 - tz1) / (tz2 - tz1);
          tz1 = 0.1;
          const origTx1 = tx1;
          tx1 = origTx1 + t * (tx2 - origTx1);
          u1 = t;
        } else if (tz2 < 0.1) {
          const t = (0.1 - tz2) / (tz1 - tz2);
          tz2 = 0.1;
          const origTx2 = tx2;
          tx2 = origTx2 + t * (tx1 - origTx2);
          u2 = 1 - t;
        }

        // Project to screen columns
        const fovScale = (w / 2) / Math.tan(this.fov / 2);
        const x1 = Math.floor(halfW + (tx1 / tz1) * fovScale);
        const x2 = Math.floor(halfW + (tx2 / tz2) * fovScale);

        // Backface culling: walls must face camera
        if (x1 >= x2) continue;
        if (x2 < minCol || x1 > maxCol) continue;

        const colStart = Math.max(minCol, x1);
        const colEnd = Math.min(maxCol, x2);

        // Heights
        const floorH = sector.floorHeight;
        const ceilH = sector.ceilingHeight;

        let neighborSector = null;
        let door = null;
        if (edge.doorId && world.doors) {
          door = world.doors.get(edge.doorId);
        }

        if (edge.type === 'portal' && edge.neighborSectorId) {
          neighborSector = world.sectors.get(edge.neighborSectorId);
        }

        // Texture retrieval
        const mainTex = this.getTexturePixels(area, edge.texture);
        const upperTex = this.getTexturePixels(area, edge.upperTexture || edge.texture);
        const lowerTex = this.getTexturePixels(area, edge.lowerTexture || edge.texture);

        // If door exists and is closed/closing, it acts as a portal with moving ceiling/vertical barrier
        const doorProgress = door ? door.progress : 1.0;

        let portalMinCol = w;
        let portalMaxCol = -1;

        // Render columns
        for (let col = colStart; col <= colEnd; col++) {
          if (this.clipTop[col] > this.clipBottom[col]) continue;

          // Interpolate distance across edge
          const t = (col - x1) / ((x2 - x1) || 1);
          // Correct depth interpolation (1/z)
          const invZ = (1 - t) / tz1 + t / tz2;
          const z = 1 / invZ;

          // Fisheye correction factor for this column
          const correctedZ = z * this.cosAngles[col];

          // Projected heights on screen
          const projScale = fovScale / correctedZ;

          // Screen Y positions for floor & ceiling of current sector
          const yFloor = Math.floor(halfH + (camZ - floorH) * projScale);
          const yCeil = Math.floor(halfH + (camZ - ceilH) * projScale);

          // Clamp to current column clipping bounds
          const drawTop = Math.max(this.clipTop[col], yCeil);
          const drawBottom = Math.min(this.clipBottom[col], yFloor);

          // Texture U coordinate
          const uNorm = (u1 + t * (u2 - u1)) * edgeLen;

          // Dim light based on distance and sector light
          const lightMult = Math.max(0.2, Math.min(1.0, (sector.light || 0.8) - (z / CONFIG.MAX_RENDER_DISTANCE) * 0.7));

          if (!neighborSector || (door && door.blocksMovement())) {
            // SOLID WALL (or closed door)
            if (drawTop <= drawBottom) {
              const tex = mainTex;
              if (tex) {
                const texU = Math.abs(Math.floor(uNorm * 64)) % tex.width;
                for (let y = drawTop; y <= drawBottom; y++) {
                  const wallNormY = (y - yCeil) / ((yFloor - yCeil) || 1);
                  let texV = Math.floor(wallNormY * (ceilH - floorH) * 64) % tex.height;
                  if (texV < 0) texV += tex.height;

                  const color = tex.pixels[texV * tex.width + texU];
                  this.pixels[y * w + col] = this._shade(color, lightMult);
                }
              }
              this.zBuffer[col] = Math.min(this.zBuffer[col], z);
              // Wall occludes column completely
              this.clipTop[col] = drawBottom + 1;
            }
          } else {
            // PORTAL with lower/upper step walls and pass-through window
            const nFloorH = neighborSector.floorHeight;
            const nCeilH = neighborSector.ceilingHeight;

            // If door is opening vertically, adjust passage top
            const effectiveNCeilH = door ? (floorH + (nCeilH - floorH) * doorProgress) : nCeilH;

            const yNFloor = Math.floor(halfH + (camZ - nFloorH) * projScale);
            const yNCeil = Math.floor(halfH + (camZ - effectiveNCeilH) * projScale);

            // 1. UPPER WALL (if neighbor ceiling is lower than current ceiling)
            if (yNCeil > yCeil) {
              const uDrawTop = Math.max(this.clipTop[col], yCeil);
              const uDrawBottom = Math.min(this.clipBottom[col], yNCeil);
              if (uDrawTop <= uDrawBottom && upperTex) {
                const texU = Math.abs(Math.floor(uNorm * 64)) % upperTex.width;
                for (let y = uDrawTop; y <= uDrawBottom; y++) {
                  const normY = (y - yCeil) / ((yNCeil - yCeil) || 1);
                  let texV = Math.floor(normY * (ceilH - effectiveNCeilH) * 64) % upperTex.height;
                  if (texV < 0) texV += upperTex.height;
                  this.pixels[y * w + col] = this._shade(upperTex.pixels[texV * upperTex.width + texU], lightMult);
                }
              }
            }

            // 2. LOWER WALL (if neighbor floor is higher than current floor, e.g. stair or balcony)
            if (yNFloor < yFloor) {
              const lDrawTop = Math.max(this.clipTop[col], yNFloor);
              const lDrawBottom = Math.min(this.clipBottom[col], yFloor);
              if (lDrawTop <= lDrawBottom && lowerTex) {
                const texU = Math.abs(Math.floor(uNorm * 64)) % lowerTex.width;
                for (let y = lDrawTop; y <= lDrawBottom; y++) {
                  const normY = (y - yNFloor) / ((yFloor - yNFloor) || 1);
                  let texV = Math.floor(normY * (nFloorH - floorH) * 64) % lowerTex.height;
                  if (texV < 0) texV += lowerTex.height;
                  this.pixels[y * w + col] = this._shade(lowerTex.pixels[texV * lowerTex.width + texU], lightMult);
                }
              }
            }

            // Update portal opening column bounds for recursion
            portalMinCol = Math.min(portalMinCol, col);
            portalMaxCol = Math.max(portalMaxCol, col);

            // Shrink column clip window to the open portal aperture
            this.clipTop[col] = Math.max(this.clipTop[col], Math.min(yFloor, Math.max(yCeil, yNCeil)));
            this.clipBottom[col] = Math.min(this.clipBottom[col], Math.max(yCeil, Math.min(yFloor, yNFloor)));
          }
        }

        // If portal is traversable, push neighbor sector to traversal queue
        if (neighborSector && portalMinCol <= portalMaxCol) {
          queue.push({
            sector: neighborSector,
            minCol: portalMinCol,
            maxCol: portalMaxCol
          });
        }
      }
    }
  }

  _shade(color, factor) {
    const r = Math.floor(((color) & 0xFF) * factor);
    const g = Math.floor(((color >> 8) & 0xFF) * factor);
    const b = Math.floor(((color >> 16) & 0xFF) * factor);
    const a = (color >> 24) & 0xFF;
    return (a << 24) | (b << 16) | (g << 8) | r;
  }
}

