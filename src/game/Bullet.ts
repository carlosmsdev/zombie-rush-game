import Phaser from "phaser";

import type { WeaponType } from "./Weapon";

export class Bullet extends Phaser.GameObjects.Rectangle {
  speed: number;

  directionX: number;
  directionY: number;

  damage: number;

  isCritical: boolean;

  weaponType: WeaponType;

  distanceTraveled: number = 0;

  maxDistance: number = 1200;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    angle: number,
    speed: number,
    damage: number,
    isCritical: boolean,
    weaponType: WeaponType,
  ) {
    super(scene, x, y, 14, 5, isCritical ? 0xffff00 : 0xffdd55);

    scene.add.existing(this);

    this.speed = speed;

    this.damage = damage;

    this.isCritical = isCritical;

    this.weaponType = weaponType;

    this.directionX = Math.cos(angle);

    this.directionY = Math.sin(angle);

    this.rotation = angle;

    this.setDepth(15);
  }

  update(delta: number) {
    const deltaSeconds = delta / 1000;

    const distance = this.speed * deltaSeconds;

    this.x += this.directionX * distance;

    this.y += this.directionY * distance;

    this.distanceTraveled += distance;

    if (this.distanceTraveled >= this.maxDistance) {
      this.destroy();
    }
  }
}
