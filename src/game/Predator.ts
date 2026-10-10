import Phaser from "phaser";

import { Zombie } from "./Zombie";

import type { Player } from "./Player";

import type { WeaponType } from "./Weapon";

import { WORLD_WIDTH, WORLD_HEIGHT } from "./world/World";

export class Predator extends Zombie {
  predatorPhase: number = 1;

  maxPredatorPhases: number = 3;

  retreating: boolean = false;

  hibernating: boolean = false;

  returnAt: number = 0;

  adaptedTo: WeaponType | null = null;

  private returnedPending: boolean = false;

  damageByWeapon: Record<WeaponType, number> = {
    pistol: 0,
    rifle: 0,
    shotgun: 0,
  };

  resistance: Record<WeaponType, number> = {
    pistol: 1,
    rifle: 1,
    shotgun: 1,
  };

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "boss", 1);

    this.enemyName = "THE STALKER";

    this.health = 850;

    this.maxHealth = 850;

    this.speed = 135;

    this.damage = 30;

    this.points = 900;

    this.xpReward = 400;

    this.baseColor = 0x111111;

    this.setFillStyle(0x111111);

    this.setStrokeStyle(4, 0xff3355);

    this.displayWidth = 68;

    this.displayHeight = 68;

    this.attackCooldown = 1600;
  }

  updatePredator(player: Player, delta: number, time: number) {
    if (this.hibernating) {
      if (time >= this.returnAt) {
        this.returnToHunt(player);
      }

      return;
    }

    const deltaSeconds = delta / 1000;

    const angleToPlayer = Phaser.Math.Angle.Between(
      this.x,
      this.y,
      player.x,
      player.y,
    );

    if (this.retreating) {
      const fleeAngle = angleToPlayer + Math.PI;

      const fleeSpeed = this.speed * 1.65;

      this.x += Math.cos(fleeAngle) * fleeSpeed * deltaSeconds;

      this.y += Math.sin(fleeAngle) * fleeSpeed * deltaSeconds;

      const distance = Phaser.Math.Distance.Between(
        this.x,
        this.y,
        player.x,
        player.y,
      );

      if (distance >= 850) {
        this.hibernate(time);
      }

      return;
    }

    const distance = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      player.x,
      player.y,
    );

    let movementAngle = angleToPlayer;

    if (distance < 180) {
      movementAngle += Math.PI / 2;
    }

    this.x += Math.cos(movementAngle) * this.speed * deltaSeconds;

    this.y += Math.sin(movementAngle) * this.speed * deltaSeconds;

    this.x = Phaser.Math.Clamp(this.x, 40, WORLD_WIDTH - 40);

    this.y = Phaser.Math.Clamp(this.y, 40, WORLD_HEIGHT - 40);
  }

  receiveDamage(damage: number, weapon: WeaponType, time: number) {
    if (this.hibernating) {
      return {
        damage: 0,
        killed: false,
        retreated: false,
      };
    }

    this.damageByWeapon[weapon] += damage;

    const finalDamage = damage * this.resistance[weapon];

    this.health -= finalDamage;

    if (this.health <= 0 && this.predatorPhase >= this.maxPredatorPhases) {
      this.destroy();

      return {
        damage: finalDamage,
        killed: true,
        retreated: false,
      };
    }

    if (
      this.health <= this.maxHealth * 0.25 &&
      this.predatorPhase < this.maxPredatorPhases &&
      !this.retreating
    ) {
      this.beginRetreat();

      return {
        damage: finalDamage,
        killed: false,
        retreated: true,
      };
    }

    this.flashHit();

    return {
      damage: finalDamage,
      killed: false,
      retreated: false,
    };
  }

  private beginRetreat() {
    this.retreating = true;

    this.setStrokeStyle(5, 0xffff00);
  }

  private hibernate(time: number) {
    this.retreating = false;

    this.hibernating = true;

    this.setVisible(false);

    this.returnAt = time + 12000;

    this.adaptToPlayer();

    this.predatorPhase += 1;

    this.maxHealth *= 1.25;

    this.health = this.maxHealth * 0.75;

    this.speed *= 1.08;

    this.damage *= 1.12;
  }

  private adaptToPlayer() {
    const entries = Object.entries(this.damageByWeapon) as Array<
      [WeaponType, number]
    >;

    entries.sort((a, b) => b[1] - a[1]);

    const weapon = entries[0][0];

    this.adaptedTo = weapon;

    this.resistance[weapon] = Math.max(0.45, this.resistance[weapon] * 0.62);

    this.damageByWeapon = {
      pistol: 0,
      rifle: 0,
      shotgun: 0,
    };
  }

  private returnToHunt(player: Player) {
    this.hibernating = false;

    this.setVisible(true);

    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);

    const distance = Phaser.Math.Between(550, 750);

    this.x = Phaser.Math.Clamp(
      player.x + Math.cos(angle) * distance,
      70,
      WORLD_WIDTH - 70,
    );

    this.y = Phaser.Math.Clamp(
      player.y + Math.sin(angle) * distance,
      70,
      WORLD_HEIGHT - 70,
    );

    this.setStrokeStyle(5, 0xff3355);

    this.returnedPending = true;
  }

  consumeReturned() {
    if (!this.returnedPending) {
      return null;
    }

    this.returnedPending = false;

    return this.adaptedTo;
  }
}
