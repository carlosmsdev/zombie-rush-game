import Phaser from "phaser";

import { WORLD_WIDTH, WORLD_HEIGHT } from "./world/World";

export class Player extends Phaser.GameObjects.Rectangle {
  speed: number = 250;

  health: number = 100;
  maxHealth: number = 100;

  healthLimitMultiplier: number = 1;

  movementMultiplier: number = 1;

  level: number = 1;

  xp: number = 0;
  xpToNextLevel: number = 100;

  damageMultiplier: number = 1;

  fireRateMultiplier: number = 1;

  bulletSpeedMultiplier: number = 1;

  extraProjectiles: number = 0;

  criticalChance: number = 0;

  criticalMultiplier: number = 2;

  pickupRange: number = 100;

  cursors: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 50, 24, 0x00ff88);

    scene.add.existing(this);

    this.setDepth(20);

    this.cursors = scene.input.keyboard!.addKeys({
      W: "W",
      A: "A",
      S: "S",
      D: "D",
    }) as {
      W: Phaser.Input.Keyboard.Key;
      A: Phaser.Input.Keyboard.Key;
      S: Phaser.Input.Keyboard.Key;
      D: Phaser.Input.Keyboard.Key;
    };
  }

  update(delta: number) {
    const deltaSeconds = delta / 1000;

    let directionX = 0;
    let directionY = 0;

    if (this.cursors.D.isDown) {
      directionX += 1;
    }

    if (this.cursors.A.isDown) {
      directionX -= 1;
    }

    if (this.cursors.S.isDown) {
      directionY += 1;
    }

    if (this.cursors.W.isDown) {
      directionY -= 1;
    }

    const direction = new Phaser.Math.Vector2(directionX, directionY);

    if (direction.length() > 0) {
      direction.normalize();

      const currentSpeed = this.speed * this.movementMultiplier;

      this.x += direction.x * currentSpeed * deltaSeconds;

      this.y += direction.y * currentSpeed * deltaSeconds;
    }

    this.x = Phaser.Math.Clamp(this.x, 25, WORLD_WIDTH - 25);

    this.y = Phaser.Math.Clamp(this.y, 15, WORLD_HEIGHT - 15);

    const pointer = this.scene.input.activePointer;

    this.rotation = Phaser.Math.Angle.Between(
      this.x,
      this.y,
      pointer.worldX,
      pointer.worldY,
    );
  }

  setMovementMultiplier(multiplier: number) {
    this.movementMultiplier = Math.max(0.3, multiplier);
  }

  setHealthLimitMultiplier(multiplier: number) {
    this.healthLimitMultiplier = Phaser.Math.Clamp(multiplier, 0.5, 1);

    const effectiveMaxHealth = this.getEffectiveMaxHealth();

    if (this.health > effectiveMaxHealth) {
      this.health = effectiveMaxHealth;
    }
  }

  getEffectiveMaxHealth() {
    return Math.max(1, Math.floor(this.maxHealth * this.healthLimitMultiplier));
  }

  takeDamage(amount: number) {
    this.health -= amount;

    if (this.health < 0) {
      this.health = 0;
    }
  }

  heal(amount: number) {
    const effectiveMaxHealth = this.getEffectiveMaxHealth();

    this.health += amount;

    if (this.health > effectiveMaxHealth) {
      this.health = effectiveMaxHealth;
    }
  }

  gainXp(amount: number) {
    this.xp += amount;

    if (this.xp < this.xpToNextLevel) {
      return false;
    }

    this.xp -= this.xpToNextLevel;

    this.level += 1;

    this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.25);

    return true;
  }

  isDead() {
    return this.health <= 0;
  }
}
