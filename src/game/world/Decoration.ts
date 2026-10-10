import Phaser from "phaser";

import { WORLD_WIDTH, WORLD_HEIGHT } from "./World";

export class Decoration {
  scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  create() {
    this.createBlood(65);
    this.createRocks(120);
    this.createDeadTrees(85);
    this.createRuins(35);
    this.createBones(55);
  }

  private randomPosition() {
    return {
      x: Phaser.Math.Between(80, WORLD_WIDTH - 80),

      y: Phaser.Math.Between(80, WORLD_HEIGHT - 80),
    };
  }

  private createRocks(amount: number) {
    for (let i = 0; i < amount; i++) {
      const position = this.randomPosition();

      const width = Phaser.Math.Between(18, 42);

      const height = Phaser.Math.Between(12, 28);

      this.scene.add
        .ellipse(position.x, position.y, width, height, 0x505a54)
        .setRotation(Phaser.Math.FloatBetween(0, Math.PI))
        .setAlpha(Phaser.Math.FloatBetween(0.45, 0.8))
        .setDepth(-20);
    }
  }

  private createDeadTrees(amount: number) {
    for (let i = 0; i < amount; i++) {
      const position = this.randomPosition();

      const trunk = this.scene.add
        .rectangle(
          position.x,
          position.y,
          10,
          Phaser.Math.Between(35, 55),
          0x49372b,
        )
        .setRotation(Phaser.Math.FloatBetween(-0.45, 0.45))
        .setDepth(-15);

      this.scene.add
        .rectangle(trunk.x - 8, trunk.y - 10, 22, 5, 0x49372b)
        .setRotation(Phaser.Math.FloatBetween(-1, 1))
        .setDepth(-15);

      this.scene.add
        .rectangle(trunk.x + 8, trunk.y - 18, 20, 4, 0x3b2c23)
        .setRotation(Phaser.Math.FloatBetween(-1, 1))
        .setDepth(-15);
    }
  }

  private createBlood(amount: number) {
    for (let i = 0; i < amount; i++) {
      const position = this.randomPosition();

      this.scene.add
        .ellipse(
          position.x,
          position.y,
          Phaser.Math.Between(20, 60),
          Phaser.Math.Between(12, 35),
          0x5e0707,
          Phaser.Math.FloatBetween(0.2, 0.45),
        )
        .setRotation(Phaser.Math.FloatBetween(0, Math.PI))
        .setDepth(-30);
    }
  }

  private createRuins(amount: number) {
    for (let i = 0; i < amount; i++) {
      const position = this.randomPosition();

      this.scene.add
        .rectangle(
          position.x,
          position.y,
          Phaser.Math.Between(30, 70),
          Phaser.Math.Between(12, 24),
          0x454d49,
        )
        .setRotation(Phaser.Math.FloatBetween(-1, 1))
        .setAlpha(0.65)
        .setDepth(-18);
    }
  }

  private createBones(amount: number) {
    for (let i = 0; i < amount; i++) {
      const position = this.randomPosition();

      const rotation = Phaser.Math.FloatBetween(0, Math.PI);

      this.scene.add
        .rectangle(position.x, position.y, 18, 3, 0xb8b4a2)
        .setRotation(rotation)
        .setAlpha(0.5)
        .setDepth(-17);

      this.scene.add
        .circle(position.x - 8, position.y, 3, 0xb8b4a2, 0.5)
        .setDepth(-17);

      this.scene.add
        .circle(position.x + 8, position.y, 3, 0xb8b4a2, 0.5)
        .setDepth(-17);
    }
  }
}
