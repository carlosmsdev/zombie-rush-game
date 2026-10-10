import Phaser from "phaser";

import type { Player } from "../Player";

export class XpGem extends Phaser.GameObjects.Rectangle {
  xpValue: number;

  magnetSpeed: number = 520;

  constructor(scene: Phaser.Scene, x: number, y: number, xpValue: number) {
    let color = 0x00ccff;
    let size = 12;

    if (xpValue >= 35) {
      color = 0x0088ff;
      size = 14;
    }

    if (xpValue >= 60) {
      color = 0xaa44ff;
      size = 17;
    }

    super(scene, x, y, size, size, color);

    scene.add.existing(this);

    this.xpValue = xpValue;

    this.rotation = Math.PI / 4;

    this.setStrokeStyle(2, 0xffffff, 0.6);

    this.setDepth(10);

    scene.tweens.add({
      targets: this,

      scaleX: 1.2,
      scaleY: 1.2,

      duration: 450,

      yoyo: true,

      repeat: -1,
    });
  }

  update(player: Player, delta: number) {
    if (!this.active) {
      return 0;
    }

    const distance = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      player.x,
      player.y,
    );

    if (distance <= player.pickupRange) {
      const angle = Phaser.Math.Angle.Between(
        this.x,
        this.y,
        player.x,
        player.y,
      );

      const deltaSeconds = delta / 1000;

      this.x += Math.cos(angle) * this.magnetSpeed * deltaSeconds;

      this.y += Math.sin(angle) * this.magnetSpeed * deltaSeconds;
    }

    const newDistance = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      player.x,
      player.y,
    );

    if (newDistance <= 22) {
      const xp = this.xpValue;

      this.destroy();

      return xp;
    }

    return 0;
  }
}
