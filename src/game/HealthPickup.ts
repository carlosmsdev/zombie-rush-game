import Phaser from "phaser";

import type { Player } from "./Player";

export class HealthPickup extends Phaser.GameObjects.Rectangle {
  healAmount: number = 25;

  lifetime: number = 8000;

  createdAt: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 22, 22, 0xffffff);

    scene.add.existing(this);

    this.createdAt = scene.time.now;

    this.setStrokeStyle(3, 0xff3333);

    this.setDepth(11);
  }

  update(time: number) {
    if (time - this.createdAt >= this.lifetime) {
      this.destroy();
    }
  }

  checkPlayerCollision(player: Player) {
    if (!this.active) {
      return false;
    }

    const hit = Phaser.Geom.Intersects.RectangleToRectangle(
      this.getBounds(),
      player.getBounds(),
    );

    if (!hit) {
      return false;
    }

    if (player.health >= player.getEffectiveMaxHealth()) {
      return false;
    }

    player.heal(this.healAmount);

    this.destroy();

    return true;
  }
}
