import Phaser from "phaser";

import type { Player } from "./Player";

export class HealthPickup extends Phaser.GameObjects.Rectangle {
  healAmount: number = 25;

  lifeTime: number = 8000;

  createdAt: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 22, 22, 0x00ff66);

    scene.add.existing(this);

    this.createdAt = scene.time.now;

    this.setStrokeStyle(2, 0xffffff);

    this.setDepth(11);
  }

  update(time: number) {
    if (time - this.createdAt >= this.lifeTime) {
      this.destroy();
    }
  }

  checkPlayerCollision(player: Player) {
    const hit = Phaser.Geom.Intersects.RectangleToRectangle(
      this.getBounds(),
      player.getBounds(),
    );

    if (!hit) {
      return false;
    }

    if (player.health >= player.maxHealth) {
      return false;
    }

    player.heal(this.healAmount);

    this.destroy();

    return true;
  }
}
