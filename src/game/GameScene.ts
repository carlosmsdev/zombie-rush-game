import Phaser from "phaser";

import { Player } from "./Player";
import { Bullet } from "./Bullet";

import { Zombie } from "./Zombie";
import type { ZombieType } from "./Zombie";

import { WEAPONS } from "./Weapon";
import type { WeaponType } from "./Weapon";

import { UPGRADES } from "./Upgrade";
import type { Upgrade } from "./Upgrade";

import { HealthPickup } from "./HealthPickup";

import { XpGem } from "./pickups/XpGem";

import { SurvivalManager } from "./systems/SurvivalManager";

import { World, WORLD_WIDTH, WORLD_HEIGHT } from "./world/World";

import { Decoration } from "./world/Decoration";

import { SpawnManager } from "./world/SpawnManager";

export class GameScene extends Phaser.Scene {
  player!: Player;

  world!: World;

  decoration!: Decoration;

  spawnManager!: SpawnManager;

  survivalManager!: SurvivalManager;

  bullets: Bullet[] = [];

  zombies: Zombie[] = [];

  healthPickups: HealthPickup[] = [];

  xpGems: XpGem[] = [];

  score: number = 0;

  highScore: number = 0;

  wave: number = 1;

  nextZombieSpawn: number = 0;

  zombieSpawnDelay: number = 1200;

  nextShotTime: number = 0;

  currentWeapon: WeaponType = "pistol";

  gameOver: boolean = false;

  choosingUpgrade: boolean = false;

  lastDamageTime: number = 0;

  damageCooldown: number = 800;

  lastScreenShakeTime: number = 0;

  extractionStarted: boolean = false;

  extractionHoldTime: number = 0;

  extractionRequiredTime: number = 60000;

  extractionRadius: number = 90;

  extractionPosition = new Phaser.Math.Vector2(0, 0);

  extractionZone?: Phaser.GameObjects.Arc;

  extractionLabel?: Phaser.GameObjects.Text;

  extractionArrow?: Phaser.GameObjects.Text;

  extractionDistanceText?: Phaser.GameObjects.Text;

  extractionProgressText?: Phaser.GameObjects.Text;

  scoreText!: Phaser.GameObjects.Text;

  healthText!: Phaser.GameObjects.Text;

  weaponText!: Phaser.GameObjects.Text;

  waveText!: Phaser.GameObjects.Text;

  highScoreText!: Phaser.GameObjects.Text;

  levelText!: Phaser.GameObjects.Text;

  xpText!: Phaser.GameObjects.Text;

  timerText!: Phaser.GameObjects.Text;

  healthBar!: Phaser.GameObjects.Graphics;

  xpBar!: Phaser.GameObjects.Graphics;

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
    this.resetValues();

    this.world = new World(this);

    this.world.create();

    this.decoration = new Decoration(this);

    this.decoration.create();

    this.spawnManager = new SpawnManager(this);

    this.survivalManager = new SurvivalManager();

    this.player = new Player(this, WORLD_WIDTH / 2, WORLD_HEIGHT / 2);

    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    this.cameras.main.setZoom(1);

    this.loadHighScore();

    this.createInterface();

    this.createControls();
  }

  resetValues() {
    this.bullets = [];

    this.zombies = [];

    this.healthPickups = [];

    this.xpGems = [];

    this.score = 0;

    this.wave = 1;

    this.nextZombieSpawn = 0;

    this.zombieSpawnDelay = 1200;

    this.nextShotTime = 0;

    this.currentWeapon = "pistol";

    this.gameOver = false;

    this.choosingUpgrade = false;

    this.lastDamageTime = 0;

    this.lastScreenShakeTime = 0;

    this.extractionStarted = false;

    this.extractionHoldTime = 0;

    this.extractionPosition = new Phaser.Math.Vector2(0, 0);

    this.extractionZone = undefined;

    this.extractionLabel = undefined;

    this.extractionArrow = undefined;

    this.extractionDistanceText = undefined;

    this.extractionProgressText = undefined;
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
    this.scoreText = this.add
      .text(20, 20, "Score: 0", {
        fontSize: "20px",
        color: "#ffffff",
      })
      .setScrollFactor(0)
      .setDepth(500);

    this.healthText = this.add
      .text(20, 50, "HP: 100 / 100", {
        fontSize: "17px",
        color: "#ffffff",
      })
      .setScrollFactor(0)
      .setDepth(500);

    this.healthBar = this.add.graphics();

    this.healthBar.setScrollFactor(0).setDepth(500);

    this.weaponText = this.add
      .text(20, 110, "Arma: Pistola", {
        fontSize: "17px",
        color: "#ffffff",
      })
      .setScrollFactor(0)
      .setDepth(500);

    this.levelText = this.add
      .text(20, 140, "Level: 1", {
        fontSize: "17px",
        color: "#ffffff",
      })
      .setScrollFactor(0)
      .setDepth(500);

    this.xpText = this.add
      .text(20, 168, "XP: 0 / 100", {
        fontSize: "15px",
        color: "#aaaaaa",
      })
      .setScrollFactor(0)
      .setDepth(500);

    this.xpBar = this.add.graphics();

    this.xpBar.setScrollFactor(0).setDepth(500);

    this.waveText = this.add
      .text(820, 20, "Ameaça: 1", {
        fontSize: "20px",
        color: "#ff7777",
      })
      .setScrollFactor(0)
      .setDepth(500);

    this.highScoreText = this.add
      .text(780, 50, `Recorde: ${this.highScore}`, {
        fontSize: "17px",
        color: "#ffffff",
      })
      .setScrollFactor(0)
      .setDepth(500);

    this.add
      .text(500, 25, "ZOMBIE RUSH", {
        fontSize: "27px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(500);

    this.timerText = this.add
      .text(500, 65, "00:00", {
        fontSize: "25px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(500);

    this.add
      .text(500, 570, "WASD • Mouse • 1 Pistola • 2 Rifle • 3 Shotgun", {
        fontSize: "15px",
        color: "#888888",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(500);

    this.updateHealthBar();

    this.updateXpBar();
  }

  update(time: number, delta: number) {
    if (this.gameOver) {
      if (Phaser.Input.Keyboard.JustDown(this.restartKey)) {
        this.scene.restart();
      }

      return;
    }

    if (this.choosingUpgrade) {
      return;
    }

    this.survivalManager.update(delta);

    this.timerText.setText(this.survivalManager.getFormattedTime());

    this.updateDifficulty();

    this.checkExtractionStart();

    this.player.update(delta);

    if (this.extractionStarted) {
      this.updateExtraction(delta);
    }

    this.changeWeapons();

    if (this.input.activePointer.isDown) {
      this.shoot(time);
    }

    this.updateBullets(delta);

    this.updateZombies(delta);

    this.updateHealthPickups(time);

    this.updateXpGems(delta);

    this.spawnZombies(time);

    this.checkBulletZombieCollision();

    this.checkPlayerZombieCollision(time);

    this.cleanObjects();
  }

  updateDifficulty() {
    const difficulty = this.survivalManager.getDifficultyLevel();

    this.zombieSpawnDelay = this.survivalManager.getSpawnDelay();

    if (this.extractionStarted) {
      this.zombieSpawnDelay = Math.max(170, this.zombieSpawnDelay * 0.65);
    }

    if (difficulty === this.wave) {
      return;
    }

    this.wave = difficulty;

    this.waveText.setText(`Ameaça: ${this.wave}`);

    this.showWaveEffect();
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

    const fireRate = weapon.fireRate * this.player.fireRateMultiplier;

    if (time < this.nextShotTime) {
      return;
    }

    this.nextShotTime = time + fireRate;

    const bulletSpeed = weapon.bulletSpeed * this.player.bulletSpeedMultiplier;

    const bulletsPerShot = weapon.bulletsPerShot + this.player.extraProjectiles;

    const pointer = this.input.activePointer;

    const baseAngle = Phaser.Math.Angle.Between(
      this.player.x,
      this.player.y,
      pointer.worldX,
      pointer.worldY,
    );

    for (let i = 0; i < bulletsPerShot; i++) {
      let angle = baseAngle;

      if (bulletsPerShot > 1) {
        const spread = weapon.spread > 0 ? weapon.spread : 0.12;

        angle += Phaser.Math.FloatBetween(-spread, spread);
      }

      let damage = weapon.damage * this.player.damageMultiplier;

      const critical = Math.random() < this.player.criticalChance;

      if (critical) {
        damage *= this.player.criticalMultiplier;
      }

      const bullet = new Bullet(
        this,
        this.player.x,
        this.player.y,
        angle,
        bulletSpeed,
        damage,
        critical,
        this.currentWeapon,
      );

      this.bullets.push(bullet);
    }

    if (this.currentWeapon === "shotgun") {
      this.shakeCamera(0.002);
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

    const position = this.spawnManager.getSpawnPosition();

    const type = this.getZombieType();

    const zombie = new Zombie(this, position.x, position.y, type);

    this.zombies.push(zombie);
  }

  getZombieType(): ZombieType {
    const random = Phaser.Math.Between(1, 100);

    if (this.wave >= 4 && random <= 18) {
      return "tank";
    }

    if (this.wave >= 2 && random <= 45) {
      return "fast";
    }

    return "normal";
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

        const dropX = zombie.x;

        const dropY = zombie.y;

        this.showDamageNumber(
          zombie.x,
          zombie.y,
          bullet.damage,
          bullet.isCritical,
        );

        this.createBloodEffect(zombie.x, zombie.y, bullet.isCritical ? 8 : 5);

        let knockback = 18;

        if (bullet.weaponType === "shotgun") {
          knockback = 30;

          this.shakeCamera(0.003);
        }

        zombie.applyKnockback(bullet.x, bullet.y, knockback);

        const damage = bullet.damage;

        bullet.destroy();

        const killed = zombie.takeDamage(damage);

        if (!killed) {
          return;
        }

        this.createDeathEffect(dropX, dropY);

        this.score += zombie.points;

        this.scoreText.setText(`Score: ${this.score}`);

        this.spawnXpGem(dropX, dropY, zombie.xpReward);

        this.trySpawnHealthPickup(dropX, dropY);
      });
    });
  }

  showDamageNumber(x: number, y: number, damage: number, critical: boolean) {
    const value = Math.round(damage);

    const text = this.add
      .text(x, y - 25, critical ? `${value}!` : `${value}`, {
        fontSize: critical ? "22px" : "16px",

        color: critical ? "#ffff00" : "#ffffff",

        fontStyle: critical ? "bold" : "normal",
      })
      .setOrigin(0.5)
      .setDepth(60);

    this.tweens.add({
      targets: text,

      y: text.y - 35,

      alpha: 0,

      duration: critical ? 650 : 450,

      onComplete: () => {
        text.destroy();
      },
    });
  }

  createBloodEffect(x: number, y: number, amount: number) {
    for (let i = 0; i < amount; i++) {
      const size = Phaser.Math.Between(2, 5);

      const blood = this.add.circle(x, y, size, 0x9b111e).setDepth(9);

      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);

      const distance = Phaser.Math.Between(15, 45);

      this.tweens.add({
        targets: blood,

        x: x + Math.cos(angle) * distance,

        y: y + Math.sin(angle) * distance,

        alpha: 0,

        scale: 0.4,

        duration: Phaser.Math.Between(250, 500),

        onComplete: () => {
          blood.destroy();
        },
      });
    }
  }

  createDeathEffect(x: number, y: number) {
    const stain = this.add
      .ellipse(
        x,
        y,
        Phaser.Math.Between(20, 35),
        Phaser.Math.Between(12, 24),
        0x520707,
        0.35,
      )
      .setRotation(Phaser.Math.FloatBetween(0, Math.PI))
      .setDepth(-5);

    this.tweens.add({
      targets: stain,

      alpha: 0.08,

      duration: 12000,

      onComplete: () => {
        stain.destroy();
      },
    });
  }

  shakeCamera(intensity: number) {
    const now = this.time.now;

    if (now - this.lastScreenShakeTime < 70) {
      return;
    }

    this.lastScreenShakeTime = now;

    this.cameras.main.shake(80, intensity);
  }

  spawnXpGem(x: number, y: number, xp: number) {
    const gem = new XpGem(
      this,

      x + Phaser.Math.Between(-10, 10),

      y + Phaser.Math.Between(-10, 10),

      xp,
    );

    this.xpGems.push(gem);
  }

  updateXpGems(delta: number) {
    for (const gem of this.xpGems) {
      if (!gem.active) {
        continue;
      }

      const xp = gem.update(this.player, delta);

      if (xp <= 0) {
        continue;
      }

      const leveledUp = this.player.gainXp(xp);

      this.updateXpBar();

      if (leveledUp) {
        this.showUpgradeSelection();

        break;
      }
    }
  }

  checkExtractionStart() {
    if (!this.survivalManager.extractionReady) {
      return;
    }

    if (this.extractionStarted) {
      return;
    }

    this.extractionStarted = true;

    this.createExtractionZone();

    this.showExtractionWarning();
  }

  createExtractionZone() {
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);

    const distance = Phaser.Math.Between(700, 1100);

    let x = this.player.x + Math.cos(angle) * distance;

    let y = this.player.y + Math.sin(angle) * distance;

    x = Phaser.Math.Clamp(x, 150, WORLD_WIDTH - 150);

    y = Phaser.Math.Clamp(y, 150, WORLD_HEIGHT - 150);

    this.extractionPosition.set(x, y);

    this.extractionZone = this.add
      .circle(x, y, this.extractionRadius, 0x00ff88, 0.15)
      .setStrokeStyle(5, 0x00ff88, 0.9)
      .setDepth(5);

    this.extractionLabel = this.add
      .text(x, y - 120, "EXTRAÇÃO", {
        fontSize: "20px",
        color: "#00ff88",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(20);

    this.extractionArrow = this.add
      .text(500, 110, "➤", {
        fontSize: "38px",
        color: "#00ff88",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(600);

    this.extractionDistanceText = this.add
      .text(500, 140, "", {
        fontSize: "15px",
        color: "#00ff88",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(600);

    this.extractionProgressText = this.add
      .text(500, 175, "", {
        fontSize: "20px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(600);
  }

  updateExtraction(delta: number) {
    const distance = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.extractionPosition.x,
      this.extractionPosition.y,
    );

    const angle = Phaser.Math.Angle.Between(
      this.player.x,
      this.player.y,
      this.extractionPosition.x,
      this.extractionPosition.y,
    );

    this.extractionArrow?.setRotation(angle);

    this.extractionDistanceText?.setText(`Extração: ${Math.floor(distance)}m`);

    if (distance > this.extractionRadius) {
      this.extractionHoldTime = 0;

      this.extractionProgressText?.setText("Entre na zona de extração");

      return;
    }

    this.extractionHoldTime += delta;

    const seconds = Math.floor(this.extractionHoldTime / 1000);

    const requiredSeconds = Math.floor(this.extractionRequiredTime / 1000);

    this.extractionProgressText?.setText(
      `DEFENDA A ÁREA: ${seconds} / ${requiredSeconds}s`,
    );

    if (this.extractionHoldTime >= this.extractionRequiredTime) {
      this.winGame();
    }
  }

  showExtractionWarning() {
    const title = this.add
      .text(500, 250, "EVACUAÇÃO DISPONÍVEL", {
        fontSize: "40px",
        color: "#00ff88",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1500);

    const subtitle = this.add
      .text(500, 300, "Siga a seta até a zona de extração", {
        fontSize: "20px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1500);

    this.tweens.add({
      targets: [title, subtitle],

      alpha: 0,

      delay: 2200,

      duration: 900,

      onComplete: () => {
        title.destroy();

        subtitle.destroy();
      },
    });
  }

  winGame() {
    if (this.gameOver) {
      return;
    }

    this.gameOver = true;

    this.saveHighScore();

    this.add
      .rectangle(500, 300, 1000, 600, 0x000000, 0.85)
      .setScrollFactor(0)
      .setDepth(3000);

    this.add
      .text(500, 190, "VOCÊ ESCAPOU!", {
        fontSize: "52px",
        color: "#00ff88",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(3001);

    this.add
      .text(500, 270, `Tempo: ${this.survivalManager.getFormattedTime()}`, {
        fontSize: "24px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(3001);

    this.add
      .text(500, 310, `Score: ${this.score}`, {
        fontSize: "24px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(3001);

    this.add
      .text(500, 350, `Level: ${this.player.level}`, {
        fontSize: "22px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(3001);

    this.add
      .text(500, 425, "Pressione R para jogar novamente", {
        fontSize: "19px",
        color: "#aaaaaa",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(3001);
  }

  showUpgradeSelection() {
    if (this.choosingUpgrade) {
      return;
    }

    this.choosingUpgrade = true;

    const shuffled = Phaser.Utils.Array.Shuffle([...UPGRADES]);

    const choices = shuffled.slice(0, 3);

    const overlay = this.add
      .rectangle(500, 300, 1000, 600, 0x000000, 0.88)
      .setScrollFactor(0)
      .setDepth(1000);

    const title = this.add
      .text(500, 105, `LEVEL ${this.player.level}!`, {
        fontSize: "40px",
        color: "#ffff00",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1001);

    const subtitle = this.add
      .text(500, 150, "Escolha um upgrade", {
        fontSize: "19px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1001);

    const objects: Phaser.GameObjects.GameObject[] = [overlay, title, subtitle];

    choices.forEach((upgrade: Upgrade, index: number) => {
      const y = 240 + index * 105;

      const button = this.add
        .rectangle(500, y, 520, 82, 0x222222)
        .setStrokeStyle(2, 0x555555)
        .setInteractive({
          useHandCursor: true,
        })
        .setScrollFactor(0)
        .setDepth(1001);

      const name = this.add
        .text(500, y - 14, upgrade.name, {
          fontSize: "21px",
          color: "#ffffff",
          fontStyle: "bold",
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(1002);

      const description = this.add
        .text(500, y + 17, upgrade.description, {
          fontSize: "14px",
          color: "#aaaaaa",
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(1002);

      objects.push(button, name, description);

      button.on("pointerover", () => {
        button.setFillStyle(0x333333);

        button.setStrokeStyle(2, 0xffff00);
      });

      button.on("pointerout", () => {
        button.setFillStyle(0x222222);

        button.setStrokeStyle(2, 0x555555);
      });

      button.on("pointerdown", () => {
        upgrade.apply(this.player);

        this.updateHealthBar();

        this.updateXpBar();

        objects.forEach((object) => {
          object.destroy();
        });

        this.choosingUpgrade = false;
      });
    });
  }

  updateXpBar() {
    this.levelText.setText(`Level: ${this.player.level}`);

    this.xpText.setText(`XP: ${this.player.xp} / ${this.player.xpToNextLevel}`);

    this.xpBar.clear();

    this.xpBar.fillStyle(0x222222);

    this.xpBar.fillRect(20, 192, 200, 13);

    const percentage = this.player.xp / this.player.xpToNextLevel;

    this.xpBar.fillStyle(0x00aaff);

    this.xpBar.fillRect(20, 192, 200 * percentage, 13);
  }

  trySpawnHealthPickup(x: number, y: number) {
    const chance = Phaser.Math.Between(1, 100);

    if (chance > 12) {
      return;
    }

    const pickup = new HealthPickup(this, x, y);

    this.healthPickups.push(pickup);
  }

  updateHealthPickups(time: number) {
    this.healthPickups.forEach((pickup) => {
      if (!pickup.active) {
        return;
      }

      pickup.update(time);

      if (!pickup.active) {
        return;
      }

      const collected = pickup.checkPlayerCollision(this.player);

      if (collected) {
        this.updateHealthBar();
      }
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

      this.showPlayerDamageEffect();

      if (this.player.isDead()) {
        this.endGame();
      }
    });
  }

  showPlayerDamageEffect() {
    this.player.setFillStyle(0xffffff);

    this.shakeCamera(0.005);

    this.time.delayedCall(100, () => {
      if (this.player.active) {
        this.player.setFillStyle(0x00ff88);
      }
    });
  }

  showWaveEffect() {
    const text = this.add
      .text(500, 115, `AMEAÇA ${this.wave}`, {
        fontSize: "32px",
        color: "#ff5555",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(800);

    this.tweens.add({
      targets: text,

      alpha: 0,

      y: 90,

      duration: 1000,

      onComplete: () => {
        text.destroy();
      },
    });
  }

  updateHealthBar() {
    this.healthText.setText(
      `HP: ${Math.ceil(this.player.health)} / ${this.player.maxHealth}`,
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

    this.healthPickups = this.healthPickups.filter((pickup) => pickup.active);

    this.xpGems = this.xpGems.filter((gem) => gem.active);
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
    if (this.gameOver) {
      return;
    }

    this.gameOver = true;

    this.saveHighScore();

    this.add
      .rectangle(500, 300, 1000, 600, 0x000000, 0.85)
      .setScrollFactor(0)
      .setDepth(3000);

    this.add
      .text(500, 200, "GAME OVER", {
        fontSize: "58px",
        color: "#ff3333",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(3001);

    this.add
      .text(500, 290, `Tempo: ${this.survivalManager.getFormattedTime()}`, {
        fontSize: "22px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(3001);

    this.add
      .text(500, 330, `Score: ${this.score}`, {
        fontSize: "22px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(3001);

    this.add
      .text(500, 370, `Level: ${this.player.level}`, {
        fontSize: "20px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(3001);

    this.add
      .text(500, 430, "Pressione R para jogar novamente", {
        fontSize: "19px",
        color: "#aaaaaa",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(3001);
  }
}
