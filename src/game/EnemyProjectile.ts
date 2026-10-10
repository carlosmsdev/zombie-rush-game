import Phaser from "phaser";

export class EnemyProjectile extends Phaser.GameObjects.Rectangle {
  speed: number;

  damage: number;

  directionX: number;
  directionY: number;

  distanceTraveled: number = 0;
  maxDistance: number = 900;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    angle: number,
    speed: number,
    damage: number,
  ) {
    super(scene, x, y, 14, 14, 0x55ff66);

    scene.add.existing(this);

    this.speed = speed;
    this.damage = damage;

    this.directionX = Math.cos(angle);

    this.directionY = Math.sin(angle);

    this.setRotation(Math.PI / 4);

    this.setStrokeStyle(2, 0xaaffaa);

    this.setDepth(14);
  }

  update(delta: number) {
    const deltaSeconds = delta / 1000;

    const movement = this.speed * deltaSeconds;

    this.x += this.directionX * movement;

    this.y += this.directionY * movement;

    this.distanceTraveled += movement;

    if (this.distanceTraveled >= this.maxDistance) {
      this.destroy();
    }
  }
}
