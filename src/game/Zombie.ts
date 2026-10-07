import Phaser from "phaser";
import { Player } from "./Player";

export type ZombieType = "normal" | "fast" | "tank";

export class Zombie extends Phaser.GameObjects.Rectangle {
  health: number;
  speed: number;
  damage: number;
  points: number;

  zombieType: ZombieType;

  constructor(scene: Phaser.Scene, x: number, y: number, type: ZombieType) {
    let width = 36;
    let height = 36;

    let color = 0xff3333;

    let health = 50;
    let speed = 100;
    let damage = 20;
    let points = 10;

    if (type === "fast") {
      width = 28;
      height = 28;

      color = 0xffaa00;

      health = 30;
      speed = 170;
      damage = 15;
      points = 20;
    }

    if (type === "tank") {
      width = 55;
      height = 55;

      color = 0x9900ff;

      health = 150;
      speed = 65;
      damage = 35;
      points = 40;
    }

    super(scene, x, y, width, height, color);

    scene.add.existing(this);

    this.zombieType = type;

    this.health = health;
    this.speed = speed;
    this.damage = damage;
    this.points = points;
  }

  update(player: Player, delta: number) {
    const deltaSeconds = delta / 1000;

    const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);

    this.x += Math.cos(angle) * this.speed * deltaSeconds;

    this.y += Math.sin(angle) * this.speed * deltaSeconds;
  }

  takeDamage(amount: number) {
    this.health -= amount;

    if (this.health <= 0) {
      this.destroy();
      return true;
    }

    return false;
  }
}
