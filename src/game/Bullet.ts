import Phaser from "phaser";

export class Bullet extends Phaser.GameObjects.Rectangle {
  speed: number;

  damage: number;

  velocityX: number;
  velocityY: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    angle: number,
    speed: number,
    damage: number,
  ) {
    super(scene, x, y, 14, 4, 0xffff00);

    scene.add.existing(this);

    this.speed = speed;
    this.damage = damage;

    this.rotation = angle;

    this.velocityX = Math.cos(angle) * this.speed;

    this.velocityY = Math.sin(angle) * this.speed;
  }

  update(delta: number) {
    const deltaSeconds = delta / 1000;

    this.x += this.velocityX * deltaSeconds;

    this.y += this.velocityY * deltaSeconds;

    if (this.x < -100 || this.x > 1100 || this.y < -100 || this.y > 700) {
      this.destroy();
    }
  }
}
