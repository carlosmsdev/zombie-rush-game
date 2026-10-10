import Phaser from "phaser";

export const WORLD_WIDTH = 4000;
export const WORLD_HEIGHT = 4000;

export class World {
  scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  create() {
    this.createGroundTexture();

    this.scene.add
      .tileSprite(
        WORLD_WIDTH / 2,
        WORLD_HEIGHT / 2,
        WORLD_WIDTH,
        WORLD_HEIGHT,
        "ground",
      )
      .setDepth(-100);

    this.scene.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    this.createBorder();
  }

  private createGroundTexture() {
    if (this.scene.textures.exists("ground")) {
      return;
    }

    const graphics = this.scene.add.graphics();

    graphics.fillStyle(0x151e19, 1);

    graphics.fillRect(0, 0, 256, 256);

    const colors = [0x1c2921, 0x243229, 0x101712, 0x314137, 0x29372d];

    for (let i = 0; i < 180; i++) {
      const color = Phaser.Utils.Array.GetRandom(colors);

      const x = Phaser.Math.Between(0, 255);

      const y = Phaser.Math.Between(0, 255);

      const size = Phaser.Math.Between(1, 4);

      graphics.fillStyle(color, Phaser.Math.FloatBetween(0.25, 0.75));

      graphics.fillCircle(x, y, size);
    }

    for (let i = 0; i < 25; i++) {
      const x = Phaser.Math.Between(0, 240);

      const y = Phaser.Math.Between(0, 240);

      graphics.lineStyle(1, 0x0c120e, 0.45);

      graphics.beginPath();

      graphics.moveTo(x, y);

      graphics.lineTo(
        x + Phaser.Math.Between(5, 18),
        y + Phaser.Math.Between(-5, 10),
      );

      graphics.strokePath();
    }

    graphics.generateTexture("ground", 256, 256);

    graphics.destroy();
  }

  private createBorder() {
    const border = this.scene.add.graphics();

    border.lineStyle(10, 0x080c09, 1);

    border.strokeRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    border.setDepth(-50);
  }
}
