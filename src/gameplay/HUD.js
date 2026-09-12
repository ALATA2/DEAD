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

    // 2. HUD Bar background at bottom
    const hudImg = this.assets.getHUD();
    const hudHeight = 44;
    const hudY = h - hudHeight;

    if (hudImg && hudImg.complete) {
      // Draw transparent retro frame scaled cleanly
      ctx.drawImage(hudImg, 0, hudY, w, hudHeight);
    } else {
      // Procedural fallback gothic bronze border
      ctx.fillStyle = '#1c1524';
      ctx.fillRect(0, hudY, w, hudHeight);
      ctx.strokeStyle = '#5a3d28';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, hudY + 1, w - 2, hudHeight - 2);
    }

    // 3. Hero Portrait Face (384x384 downscaled to HUD medallion at center)
    const faceImg = this.assets.getPlayerFace(player.faceState);
    const faceSize = 34;
    const faceX = Math.floor(w / 2 - faceSize / 2);
    const faceY = hudY + 5;

    if (faceImg && faceImg.complete) {
      ctx.drawImage(faceImg, faceX, faceY, faceSize, faceSize);
    }

    // 4. Numbers and Stats: HEALTH, ARMOR, AMMO (Crisp pixel fonts)
    ctx.font = 'bold 12px "Courier New", monospace';
    ctx.textBaseline = 'top';

    // HEALTH (Left)
    if (player.godMode) {
      ctx.fillStyle = '#00ffcc';
      ctx.fillText('HP: GOD (100%)', 14, hudY + 8);
    } else {
      ctx.fillStyle = player.health <= 25 ? '#ff2a2a' : '#e6a13b';
      ctx.fillText(`HP: ${Math.ceil(player.health)}%`, 14, hudY + 8);
    }

    // ARMOR (Left second column)
    ctx.fillStyle = '#4fa3e3';
    ctx.fillText(`ARM: ${Math.ceil(player.armor)}%`, 14, hudY + 24);

    // AMMO & WEAPON (Right)
    const weapon = player.getCurrentWeapon();
    const ammoCount = weapon.ammoType ? player.ammo[weapon.ammoType] : '---';
    ctx.fillStyle = '#e8d44f';
    ctx.fillText(`AMMO: ${ammoCount}`, w - 90, hudY + 8);
    ctx.fillStyle = '#bfa588';
    ctx.fillText(weapon.name.substring(0, 10), w - 90, hudY + 24);

    // 5. KEYS DISPLAY (Small badges)
    let keyX = faceX - 32;
    if (player.keys.has('blue_raven_key')) {
      ctx.fillStyle = '#3978ff';
      ctx.fillRect(keyX, hudY + 10, 6, 10);
    }
    if (player.keys.has('orange_pumpkin_key')) {
      ctx.fillStyle = '#ff8800';
      ctx.fillRect(keyX + 9, hudY + 10, 6, 10);
    }
    if (player.keys.has('red_skull_key')) {
      ctx.fillStyle = '#ff2222';
      ctx.fillRect(keyX + 18, hudY + 10, 6, 10);
    }
    if (player.keys.has('purple_clock_key')) {
      ctx.fillStyle = '#aa33ff';
      ctx.fillRect(keyX + 27, hudY + 10, 6, 10);
    }

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

    const scale = 0.55;
    const weaponW = img.width * scale;
    const weaponH = img.height * scale;

    const drawX = Math.floor(w / 2 - weaponW / 2 + bobX + 15);
    const drawY = Math.floor(h - 40 - weaponH + bobY + recoilOffset);

    ctx.drawImage(img, drawX, drawY, weaponW, weaponH);

    // Muzzle flash on attack
    if (player.recoilAnim > 0.6 && weapon.id !== 'axe') {
      ctx.fillStyle = 'rgba(255, 230, 120, 0.4)';
      ctx.beginPath();
      ctx.arc(drawX + weaponW / 2, drawY + 10, 24, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
