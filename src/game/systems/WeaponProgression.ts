import type { WeaponType } from "../Weapon";

import { WEAPONS } from "../Weapon";

export interface WeaponStats {
  name: string;

  damage: number;

  fireRate: number;

  bulletSpeed: number;

  bulletsPerShot: number;

  spread: number;
}

export class WeaponProgression {
  maxLevel: number = 5;

  levels: Record<WeaponType, number> = {
    pistol: 1,
    rifle: 1,
    shotgun: 1,
  };

  evolved: Record<WeaponType, boolean> = {
    pistol: false,
    rifle: false,
    shotgun: false,
  };

  getLevel(type: WeaponType) {
    return this.levels[type];
  }

  isEvolved(type: WeaponType) {
    return this.evolved[type];
  }

  canUpgrade(type: WeaponType) {
    return !this.evolved[type];
  }

  upgrade(type: WeaponType) {
    if (this.evolved[type]) {
      return;
    }

    if (this.levels[type] < this.maxLevel) {
      this.levels[type] += 1;

      return;
    }

    this.evolved[type] = true;
  }

  getStats(type: WeaponType): WeaponStats {
    const base = WEAPONS[type];

    const level = this.levels[type];

    const levelBonus = level - 1;

    let damage = base.damage * (1 + levelBonus * 0.1);

    let fireRate = base.fireRate * Math.pow(0.96, levelBonus);

    let bulletSpeed = base.bulletSpeed * (1 + levelBonus * 0.05);

    let bulletsPerShot = base.bulletsPerShot;

    let spread = base.spread;

    let name = `${base.name} Lv.${level}`;

    if (type === "shotgun") {
      if (level >= 3) {
        bulletsPerShot += 1;
      }

      if (level >= 5) {
        bulletsPerShot += 1;
      }
    }

    if (this.evolved[type]) {
      if (type === "pistol") {
        name = "Hand Cannon";

        damage *= 1.5;

        bulletsPerShot += 1;

        bulletSpeed *= 1.15;
      }

      if (type === "rifle") {
        name = "Minigun";

        damage *= 1.1;

        fireRate *= 0.55;

        spread += 0.04;
      }

      if (type === "shotgun") {
        name = "Hellfire Shotgun";

        damage *= 1.3;

        fireRate *= 0.85;

        bulletsPerShot += 4;

        spread += 0.06;
      }
    }

    return {
      name,
      damage,
      fireRate,
      bulletSpeed,
      bulletsPerShot,
      spread,
    };
  }

  getNextUpgradeName(type: WeaponType) {
    const base = WEAPONS[type];

    const level = this.levels[type];

    if (this.evolved[type]) {
      return base.name;
    }

    if (level < this.maxLevel) {
      return `${base.name} Lv.${level + 1}`;
    }

    if (type === "pistol") {
      return "Evoluir: Hand Cannon";
    }

    if (type === "rifle") {
      return "Evoluir: Minigun";
    }

    return "Evoluir: Hellfire Shotgun";
  }

  getNextUpgradeDescription(type: WeaponType) {
    const level = this.levels[type];

    if (level < this.maxLevel) {
      return "Aumenta dano, cadência e velocidade dos projéteis.";
    }

    if (type === "pistol") {
      return "Transforma a Pistola em Hand Cannon.";
    }

    if (type === "rifle") {
      return "Transforma o Rifle em uma Minigun.";
    }

    return "Transforma a Shotgun na Hellfire Shotgun.";
  }
}
