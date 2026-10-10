import Phaser from "phaser";

import type { Player } from "./Player";

import type { WeaponType } from "./Weapon";

export type ZombieType =
  | "normal"
  | "fast"
  | "tank"
  | "exploder"
  | "spitter"
  | "boss";

export class Zombie extends Phaser.GameObjects.Rectangle {
  health: number;

  maxHealth: number;

  speed: number;

  damage: number;

  points: number;

  xpReward: number;

  zombieType: ZombieType;

  baseColor: number;

  attackCooldown: number = 2000;

  nextAttackTime: number = 0;

  nextSpecialTime: number = 0;

  preferredDistance: number = 0;

  bossStage: number = 0;

  enemyName: string = "Zombie";

  isLegacyBoss: boolean = false;

  legacyWeapon: WeaponType | null = null;

  legacyEvolvedWeapon: boolean = false;

  lastKnownPlayerX: number = 0;

  lastKnownPlayerY: number = 0;

  lastKnownTime: number = 0;

  nextAlertTime: number = 0;

  isFeral: boolean = false;

  nextFeralAttackTime: number = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    type: ZombieType,
    bossStage: number = 1,
  ) {
    let width = 36;
    let height = 36;

    let color = 0xff3333;

    let health = 50;
    let speed = 100;
    let damage = 20;
    let points = 10;
    let xpReward = 25;

    let enemyName = "Zombie";

    if (type === "fast") {
      width = 28;
      height = 28;

      color = 0xffaa00;

      health = 30;
      speed = 170;
      damage = 15;
      points = 20;
      xpReward = 35;

      enemyName = "Runner";
    }

    if (type === "tank") {
      width = 55;
      height = 55;

      color = 0x9900ff;

      health = 150;
      speed = 65;
      damage = 35;
      points = 40;
      xpReward = 60;

      enemyName = "Tank";
    }

    if (type === "exploder") {
      width = 36;
      height = 36;

      color = 0x66ff44;

      health = 55;
      speed = 125;
      damage = 45;
      points = 30;
      xpReward = 45;

      enemyName = "Exploder";
    }

    if (type === "spitter") {
      width = 40;
      height = 40;

      color = 0x33ddaa;

      health = 70;
      speed = 80;
      damage = 18;
      points = 35;
      xpReward = 50;

      enemyName = "Spitter";
    }

    if (type === "boss") {
      const stage = Math.max(1, bossStage);

      width = 85 + stage * 8;

      height = 85 + stage * 8;

      color = 0xff0055;

      health = 900 + (stage - 1) * 700;

      speed = 58 + stage * 2;

      damage = 40 + stage * 10;

      points = 500 * stage;

      xpReward = 250 * stage;

      if (stage === 1) {
        enemyName = "MUTANT BRUTE";
      }

      if (stage === 2) {
        enemyName = "PLAGUE TITAN";
      }

      if (stage >= 3) {
        enemyName = "OMEGA ABOMINATION";
      }
    }

    super(scene, x, y, width, height, color);

    scene.add.existing(this);

    this.setDepth(12);

    this.zombieType = type;

    this.baseColor = color;

    this.health = health;

    this.maxHealth = health;

    this.speed = speed;

    this.damage = damage;

    this.points = points;

    this.xpReward = xpReward;

    this.enemyName = enemyName;

    if (type === "spitter") {
      this.preferredDistance = 270;

      this.attackCooldown = 1800;

      this.nextAttackTime = scene.time.now + 1200;
    }

    if (type === "boss") {
      this.bossStage = bossStage;

      this.attackCooldown = 3000;

      this.nextAttackTime = scene.time.now + 1500;

      this.nextSpecialTime = scene.time.now + 3500;
    }
  }

  update(
    player: Player,
    delta: number,
    speedMultiplier: number = 1,
    targetX: number = player.x,
    targetY: number = player.y,
    huntingPlayer: boolean = true,
  ) {
    this.updateMemory(delta);

    const deltaSeconds = delta / 1000;

    const playerDistance = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      player.x,
      player.y,
    );

    if (
      huntingPlayer &&
      this.zombieType === "spitter" &&
      playerDistance <= this.preferredDistance
    ) {
      return;
    }

    const targetDistance = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      targetX,
      targetY,
    );

    if (!huntingPlayer && targetDistance <= 18) {
      return;
    }

    const angle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);

    const currentSpeed = this.speed * speedMultiplier;

    this.x += Math.cos(angle) * currentSpeed * deltaSeconds;

    this.y += Math.sin(angle) * currentSpeed * deltaSeconds;
  }

  rememberPlayer(x: number, y: number, duration: number = 4000) {
    this.lastKnownPlayerX = x;

    this.lastKnownPlayerY = y;

    this.lastKnownTime = duration;
  }

  updateMemory(delta: number) {
    if (this.lastKnownTime <= 0) {
      return;
    }

    this.lastKnownTime -= delta;

    if (this.lastKnownTime < 0) {
      this.lastKnownTime = 0;
    }
  }

  hasPlayerMemory() {
    return this.lastKnownTime > 0;
  }

  canAlert(time: number) {
    return time >= this.nextAlertTime;
  }

  markAlerted(time: number) {
    this.nextAlertTime = time + 6500;
  }

  setFeral() {
    if (this.zombieType === "boss") {
      return;
    }

    this.isFeral = true;

    this.setStrokeStyle(3, 0x00aaff);

    this.speed *= 1.12;

    this.damage *= 1.15;
  }

  applyKnockback(sourceX: number, sourceY: number, force: number) {
    if (this.zombieType === "boss") {
      force *= 0.2;
    }

    if (this.zombieType === "tank") {
      force *= 0.5;
    }

    const angle = Phaser.Math.Angle.Between(sourceX, sourceY, this.x, this.y);

    this.x += Math.cos(angle) * force;

    this.y += Math.sin(angle) * force;
  }

  takeDamage(amount: number) {
    this.health -= amount;

    if (this.health <= 0) {
      this.destroy();

      return true;
    }

    this.flashHit();

    return false;
  }

  flashHit() {
    if (!this.active) {
      return;
    }

    this.setFillStyle(0xffffff);

    this.scene.time.delayedCall(70, () => {
      if (!this.active) {
        return;
      }

      this.setFillStyle(this.baseColor);
    });
  }
}
