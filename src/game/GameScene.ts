import Phaser from "phaser";

import { Player } from "./Player";
import { Bullet } from "./Bullet";

import { Zombie } from "./Zombie";
import type { ZombieType } from "./Zombie";

import { WEAPONS } from "./Weapon";
import type { WeaponType } from "./Weapon";

export class GameScene extends Phaser.Scene {
  player!: Player;

  bullets: Bullet[] = [];
  zombies: Zombie[] = [];

  score: number = 0;
  highScore: number = 0;
  wave: number = 1;

  nextZombieSpawn: number = 0;
  zombieSpawnDelay: number = 1200;

  nextShotTime: number = 0;
  currentWeapon: WeaponType = "pistol";

  gameOver: boolean = false;

  lastDamageTime: number = 0;
  damageCooldown: number = 800;

  scoreText!: Phaser.GameObjects.Text;
  healthText!: Phaser.GameObjects.Text;
  weaponText!: Phaser.GameObjects.Text;
  waveText!: Phaser.GameObjects.Text;
  highScoreText!: Phaser.GameObjects.Text;

  healthBar!: Phaser.GameObjects.Graphics;

  weaponKeys!: {
    one: Phaser.Input.Keyboard.Key;
    two: Phaser.Input.Keyboard.Key;
    three: Phaser.Input.Keyboard.Key;
  };

  restartKey!: Phaser.Input.Keyboard.Key;

  constructor() {
    super("GameScene");
  }

  create() {
    this.player = new Player(this, 500, 300);

    this.loadHighScore();

    this.createInterface();

    this.createControls();
  }

  createControls() {
    this.weaponKeys = {
      one: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),

      two: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),

      three: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
    };

    this.restartKey = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.R,
    );
  }

  createInterface() {
    this.scoreText = this.add.text(20, 20, "Score: 0", {
      fontSize: "22px",
      color: "#ffffff",
    });

    this.healthText = this.add.text(20, 50, "HP: 100 / 100", {
      fontSize: "18px",
      color: "#ffffff",
    });

    this.healthBar = this.add.graphics();

    this.weaponText = this.add.text(20, 110, "Arma: Pistola", {
      fontSize: "18px",
      color: "#ffffff",
    });

    this.waveText = this.add.text(830, 20, "Wave: 1", {
      fontSize: "22px",
      color: "#ffffff",
    });

    this.highScoreText = this.add.text(780, 50, `Recorde: ${this.highScore}`, {
      fontSize: "18px",
      color: "#ffffff",
    });

    this.add
      .text(500, 30, "ZOMBIE RUSH", {
        fontSize: "30px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.add
      .text(500, 570, "WASD • Mouse • 1 Pistola • 2 Rifle • 3 Shotgun", {
        fontSize: "16px",
        color: "#888888",
      })
      .setOrigin(0.5);

    this.updateHealthBar();
  }

  update(time: number, delta: number) {
    if (this.gameOver) {
      if (Phaser.Input.Keyboard.JustDown(this.restartKey)) {
        this.scene.restart();
      }

      return;
    }

    this.player.update(delta);

    this.changeWeapons();

    if (this.input.activePointer.isDown) {
      this.shoot(time);
    }

    this.updateBullets(delta);

    this.updateZombies(delta);

    this.spawnZombies(time);

    this.checkBulletZombieCollision();

    this.checkPlayerZombieCollision(time);

    this.updateWave();

    this.cleanObjects();
  }

  changeWeapons() {
    if (Phaser.Input.Keyboard.JustDown(this.weaponKeys.one)) {
      this.currentWeapon = "pistol";
    }

    if (Phaser.Input.Keyboard.JustDown(this.weaponKeys.two)) {
      this.currentWeapon = "rifle";
    }

    if (Phaser.Input.Keyboard.JustDown(this.weaponKeys.three)) {
      this.currentWeapon = "shotgun";
    }

    this.weaponText.setText(`Arma: ${WEAPONS[this.currentWeapon].name}`);
  }

  shoot(time: number) {
    const weapon = WEAPONS[this.currentWeapon];

    if (time < this.nextShotTime) {
      return;
    }

    this.nextShotTime = time + weapon.fireRate;

    const pointer = this.input.activePointer;

    const baseAngle = Phaser.Math.Angle.Between(
      this.player.x,
      this.player.y,
      pointer.x,
      pointer.y,
    );

    for (let i = 0; i < weapon.bulletsPerShot; i++) {
      let angle = baseAngle;

      if (weapon.bulletsPerShot > 1) {
        const spread = Phaser.Math.FloatBetween(-weapon.spread, weapon.spread);

        angle += spread;
      }

      const bullet = new Bullet(
        this,
        this.player.x,
        this.player.y,
        angle,
        weapon.bulletSpeed,
        weapon.damage,
      );

      this.bullets.push(bullet);
    }
  }

  updateBullets(delta: number) {
    this.bullets.forEach((bullet) => {
      if (bullet.active) {
        bullet.update(delta);
      }
    });
  }

  updateZombies(delta: number) {
    this.zombies.forEach((zombie) => {
      if (zombie.active) {
        zombie.update(this.player, delta);
      }
    });
  }

  spawnZombies(time: number) {
    if (time < this.nextZombieSpawn) {
      return;
    }

    this.nextZombieSpawn = time + this.zombieSpawnDelay;

    const position = this.getRandomSpawnPosition();

    const type = this.getZombieType();

    const zombie = new Zombie(this, position.x, position.y, type);

    this.zombies.push(zombie);
  }

  getZombieType(): ZombieType {
    const random = Phaser.Math.Between(1, 100);

    if (this.wave >= 4 && random <= 15) {
      return "tank";
    }

    if (this.wave >= 2 && random <= 40) {
      return "fast";
    }

    return "normal";
  }

  getRandomSpawnPosition() {
    const side = Phaser.Math.Between(0, 3);

    switch (side) {
      case 0:
        return {
          x: Phaser.Math.Between(0, 1000),
          y: -50,
        };

      case 1:
        return {
          x: 1050,
          y: Phaser.Math.Between(0, 600),
        };

      case 2:
        return {
          x: Phaser.Math.Between(0, 1000),
          y: 650,
        };

      default:
        return {
          x: -50,
          y: Phaser.Math.Between(0, 600),
        };
    }
  }

  checkBulletZombieCollision() {
    this.bullets.forEach((bullet) => {
      if (!bullet.active) {
        return;
      }

      this.zombies.forEach((zombie) => {
        if (!zombie.active || !bullet.active) {
          return;
        }

        const hit = Phaser.Geom.Intersects.RectangleToRectangle(
          bullet.getBounds(),
          zombie.getBounds(),
        );

        if (!hit) {
          return;
        }

        const damage = bullet.damage;

        bullet.destroy();

        const killed = zombie.takeDamage(damage);

        if (killed) {
          this.score += zombie.points;

          this.scoreText.setText(`Score: ${this.score}`);
        }
      });
    });
  }

  checkPlayerZombieCollision(time: number) {
    this.zombies.forEach((zombie) => {
      if (!zombie.active) {
        return;
      }

      const hit = Phaser.Geom.Intersects.RectangleToRectangle(
        this.player.getBounds(),
        zombie.getBounds(),
      );

      if (!hit) {
        return;
      }

      if (time - this.lastDamageTime < this.damageCooldown) {
        return;
      }

      this.lastDamageTime = time;

      this.player.takeDamage(zombie.damage);

      zombie.destroy();

      this.updateHealthBar();

      if (this.player.isDead()) {
        this.endGame();
      }
    });
  }

  updateWave() {
    const newWave = Math.floor(this.score / 100) + 1;

    if (newWave === this.wave) {
      return;
    }

    this.wave = newWave;

    this.waveText.setText(`Wave: ${this.wave}`);

    this.zombieSpawnDelay = Math.max(350, 1200 - this.wave * 80);
  }

  updateHealthBar() {
    this.healthText.setText(
      `HP: ${this.player.health} / ${this.player.maxHealth}`,
    );

    this.healthBar.clear();

    this.healthBar.fillStyle(0x333333);

    this.healthBar.fillRect(20, 78, 200, 18);

    const percentage = this.player.health / this.player.maxHealth;

    let color = 0x00ff00;

    if (percentage <= 0.5) {
      color = 0xffff00;
    }

    if (percentage <= 0.25) {
      color = 0xff0000;
    }

    this.healthBar.fillStyle(color);

    this.healthBar.fillRect(20, 78, 200 * percentage, 18);
  }

  cleanObjects() {
    this.bullets = this.bullets.filter((bullet) => bullet.active);

    this.zombies = this.zombies.filter((zombie) => zombie.active);
  }

  loadHighScore() {
    const saved = localStorage.getItem("zombieRushHighScore");

    this.highScore = saved ? Number(saved) : 0;
  }

  saveHighScore() {
    if (this.score <= this.highScore) {
      return;
    }

    this.highScore = this.score;

    localStorage.setItem("zombieRushHighScore", String(this.highScore));
  }

  endGame() {
    this.gameOver = true;

    this.saveHighScore();

    this.add.rectangle(500, 300, 1000, 600, 0x000000, 0.65);

    this.add
      .text(500, 230, "GAME OVER", {
        fontSize: "64px",
        color: "#ff3333",
      })
      .setOrigin(0.5);

    this.add
      .text(500, 305, `Score: ${this.score}`, {
        fontSize: "28px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.add
      .text(500, 345, `Recorde: ${this.highScore}`, {
        fontSize: "22px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.add
      .text(500, 400, "Pressione R para jogar novamente", {
        fontSize: "20px",
        color: "#aaaaaa",
      })
      .setOrigin(0.5);
  }
}
