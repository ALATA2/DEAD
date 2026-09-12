// Pickup.js - Interactive item pickups (weapons, ammo, health, keys, exit sigil)

export class Pickup {
  constructor(data) {
    this.id = data.id || `pk_${Math.random().toString(36).substr(2, 8)}`;
    this.type = data.type; // 'weapon', 'health', 'armor', 'ammo', 'key', 'exit'
    this.name = data.name; // e.g. 'health_vial', 'shotgun', 'blue_raven_key'
    this.x = data.x;
    this.y = data.y;
    this.sectorId = data.sectorId;
    this.amount = data.amount || 1;
    this.collected = false;
    this.scale = data.scale || 0.65;
  }

  checkCollision(player, onExitReached) {
    if (this.collected) return;

    const dx = player.x - this.x;
    const dy = player.y - this.y;
    if (Math.hypot(dx, dy) <= 0.85) {
      let picked = false;

      if (this.type === 'health') {
        picked = player.giveHealth(this.amount);
      } else if (this.type === 'armor') {
        picked = player.giveArmor(this.amount);
      } else if (this.type === 'ammo') {
        picked = player.giveAmmo(this.ammoType || 'bullets', this.amount);
      } else if (this.type === 'weapon') {
        picked = player.giveWeapon(this.weaponId);
      } else if (this.type === 'key') {
        player.giveKey(this.name);
        picked = true;
      } else if (this.type === 'exit') {
        if (onExitReached) onExitReached();
        picked = true;
      }

      if (picked) {
        this.collected = true;
      }
    }
  }
}
