// HUD.js - Amiga 1200 style HUD, animated player face portrait, health, armor, ammo, keys (§11)

export class HUD {
  constructor(canvas, assetRegistry) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.assets = assetRegistry;

    this.width = canvas.width;
    this.height = canvas.height;
  }

  render(player, world) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // 1. Render First-Person Weapon Sprite at bottom center
    this._renderWeaponSprite(player);

    // 2. HUD Bar background at bottom (Amiga 1200 AGA Gothic Bezel)
    const hudImg = this.assets.getHUD();
    const hudHeight = 44;
    const hudY = h - hudHeight;

    // Solid dark stone base plate with brass trim
    ctx.fillStyle = '#100c14';
    ctx.fillRect(0, hudY, w, hudHeight);

    // Beveled borders
    ctx.fillStyle = '#5c4328';
    ctx.fillRect(0, hudY, w, 2); // top gold highlight
    ctx.fillStyle = '#2a1a12';
    ctx.fillRect(0, hudY + 2, w, 1);
    ctx.fillStyle = '#0a060d';
    ctx.fillRect(0, h - 1, w, 1);

    // Recessed stat panels
    // Panel 1: Health & Armor (left: 6 to 140)
    ctx.fillStyle = '#08050a';
    ctx.fillRect(6, hudY + 4, 134, hudHeight - 8);
    ctx.strokeStyle = '#38281a';
    ctx.lineWidth = 1;
    ctx.strokeRect(6.5, hudY + 4.5, 133, hudHeight - 9);

    // Panel 2: Keys & Portrait (center: 146 to 238)
    ctx.fillStyle = '#08050a';
    ctx.fillRect(146, hudY + 4, 92, hudHeight - 8);
    ctx.strokeRect(146.5, hudY + 4.5, 91, hudHeight - 9);

    // Panel 3: Ammo & Weapon (right: 244 to w - 6)
    ctx.fillStyle = '#08050a';
    ctx.fillRect(244, hudY + 4, w - 250, hudHeight - 8);
    ctx.strokeRect(244.5, hudY + 4.5, w - 251, hudHeight - 9);

    // Overlay transparent HUD artwork if present
    if (hudImg && hudImg.complete) {
      ctx.globalAlpha = 0.45;
      ctx.drawImage(hudImg, 0, hudY, w, hudHeight);
      ctx.globalAlpha = 1.0;
    }

    // 3. Hero Portrait Face in center frame
    const faceImg = this.assets.getPlayerFace(player.faceState);
    const faceSize = 32;
    const faceX = 150;
    const faceY = hudY + 6;

    if (faceImg && faceImg.complete) {
      ctx.drawImage(faceImg, faceX, faceY, faceSize, faceSize);
      ctx.strokeStyle = '#cda250';
      ctx.lineWidth = 1;
      ctx.strokeRect(faceX - 0.5, faceY - 0.5, faceSize + 1, faceSize + 1);
    }

    // 4. Numbers and Stats: HEALTH, ARMOR, AMMO (Crisp pixel fonts)
    ctx.font = 'bold 11px monospace';
    ctx.textBaseline = 'top';

    // HEALTH Gauge & Text
    const hp = Math.max(0, Math.ceil(player.health));
    ctx.fillStyle = '#1a0d0d';
    ctx.fillRect(10, hudY + 8, 45, 11);
    ctx.fillStyle = player.godMode ? '#00e5ff' : (hp <= 25 ? '#e62222' : '#e68222');
    ctx.fillRect(10, hudY + 8, Math.floor(45 * Math.min(1.0, hp / 100)), 11);

    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#000000';
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    if (player.godMode) {
      ctx.fillText('GOD 100%', 60, hudY + 8);
    } else {
      ctx.fillText(`HP ${hp}%`, 60, hudY + 8);
    }

    // ARMOR Gauge & Text
    const arm = Math.max(0, Math.ceil(player.armor));
    ctx.fillStyle = '#0d1520';
    ctx.fillRect(10, hudY + 23, 45, 11);
    ctx.fillStyle = '#3a8ee6';
    ctx.fillRect(10, hudY + 23, Math.floor(45 * Math.min(1.0, arm / 100)), 11);

    ctx.fillStyle = '#c5e0ff';
    ctx.fillText(`ARM ${arm}%`, 60, hudY + 23);

    // AMMO & WEAPON (Right Panel)
    const weapon = player.getCurrentWeapon();
    const ammoCount = weapon.ammoType ? player.ammo[weapon.ammoType] : '---';
    ctx.fillStyle = '#ffe042';
    ctx.fillText(`AMMO: ${ammoCount}`, 252, hudY + 8);

    ctx.fillStyle = '#d6b896';
    ctx.font = '10px monospace';
    ctx.fillText(weapon.name.toUpperCase().substring(0, 14), 252, hudY + 24);

    ctx.shadowColor = 'transparent';
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // 5. KEYS DISPLAY (In center panel next to face)
    const keySlotX = faceX + faceSize + 6;
    ctx.font = '9px monospace';
    ctx.fillStyle = '#6e5a40';
    ctx.fillText('KEYS', keySlotX, hudY + 7);

    const keysList = [
      { id: 'blue_raven_key', col: '#3978ff' },
      { id: 'orange_pumpkin_key', col: '#ff8800' },
      { id: 'red_skull_key', col: '#ff2222' },
      { id: 'purple_clock_key', col: '#aa33ff' }
    ];

    keysList.forEach((k, idx) => {
      const kx = keySlotX + (idx % 2) * 18;
      const ky = hudY + 18 + Math.floor(idx / 2) * 10;
      if (player.keys.has(k.id)) {
        ctx.fillStyle = k.col;
        ctx.fillRect(kx, ky, 12, 7);
        ctx.strokeStyle = '#fff';
        ctx.strokeRect(kx - 0.5, ky - 0.5, 13, 8);
      } else {
        ctx.fillStyle = '#1e1424';
        ctx.fillRect(kx, ky, 12, 7);
      }
    });

    // 6. Pain Flash red vignette
    if (player.painTimer > 0) {
      ctx.fillStyle = `rgba(180, 20, 20, ${player.painTimer * 0.7})`;
      ctx.fillRect(0, 0, w, h);
    }
  }

  _renderWeaponSprite(player) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const hudHeight = 44;

    const weapon = player.getCurrentWeapon();
    const pickupKey = weapon.id === 'axe' ? 'woodsman_axe' :
                      weapon.id === 'pistol' ? 'pistol' :
                      weapon.id === 'shotgun' ? 'shotgun' :
                      weapon.id === 'double_barrel' ? 'double_barrel_shotgun' : 'gothic_crossbow';

    const img = this.assets.getPickup(pickupKey);
    if (!img || !img.complete) return;

    // Bobbing and recoil animation
    const recoilOffset = player.recoilAnim * 16;
    const bobX = Math.cos(player.footstepTimer * Math.PI * 4) * 4;
    const bobY = Math.abs(Math.sin(player.footstepTimer * Math.PI * 4)) * 5;

    const scale = 0.38;
    const weaponW = Math.floor(img.width * scale);
    const weaponH = Math.floor(img.height * scale);

    // Natural retro FPS positioning (held in right hand, lower corner)
    const drawX = Math.floor(w / 2 - weaponW / 4 + bobX);
    const drawY = Math.floor(h - hudHeight - weaponH * 0.72 + bobY + recoilOffset);

    ctx.drawImage(img, drawX, drawY, weaponW, weaponH);

    // Muzzle flash on attack
    if (player.recoilAnim > 0.6 && weapon.id !== 'axe') {
      ctx.fillStyle = 'rgba(255, 230, 120, 0.4)';
      ctx.beginPath();
      ctx.arc(drawX + 8, drawY + 12, 18, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
