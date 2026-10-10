import Phaser from "phaser";

import { Player } from "./Player";
import { Bullet } from "./Bullet";
import { Zombie } from "./Zombie";
import type { ZombieType } from "./Zombie";
import { Predator } from "./Predator";
import { EnemyProjectile } from "./EnemyProjectile";
import type { WeaponType } from "./Weapon";
import { UPGRADES } from "./Upgrade";
import { HealthPickup } from "./HealthPickup";
import { XpGem } from "./pickups/XpGem";

import { SurvivalManager } from "./systems/SurvivalManager";
import { WeaponProgression } from "./systems/WeaponProgression";
import { ThreatSystem } from "./systems/ThreatSystem";
import { InfectionSystem } from "./systems/InfectionSystem";
import { MutationSystem } from "./systems/MutationSystem";
import { ExtractionSystem } from "./systems/ExtractionSystem";
import { EventSystem } from "./systems/EventSystem";
import { SoundSystem } from "./systems/SoundSystem";
import { ScentSystem } from "./systems/ScentSystem";
import { WeatherSystem } from "./systems/WeatherSystem";
import { AdaptiveVirusSystem } from "./systems/AdaptiveVirusSystem";
import { BiomassSystem } from "./systems/BiomassSystem";
import type { BiomassPatch } from "./systems/BiomassSystem";
import { LegacyRunSystem } from "./systems/LegacyRunSystem";
import { MutationEvolutionSystem } from "./systems/MutationEvolutionSystem";
import type {
  MutationTrait,
  MutationTraitId,
} from "./systems/MutationEvolutionSystem";

import { World, WORLD_WIDTH, WORLD_HEIGHT } from "./world/World";

import { Decoration } from "./world/Decoration";
import { SpawnManager } from "./world/SpawnManager";

interface LevelUpChoice {
  name: string;
  description: string;
  apply: () => void;
}

interface NestVisual {
  circle: Phaser.GameObjects.Arc;
  label: Phaser.GameObjects.Text;
}

export class GameScene extends Phaser.Scene {
  player!: Player;

  world!: World;
  decoration!: Decoration;
  spawnManager!: SpawnManager;

  survivalManager!: SurvivalManager;
  weaponProgression!: WeaponProgression;
  threatSystem!: ThreatSystem;
  infectionSystem!: InfectionSystem;
  mutationSystem!: MutationSystem;
  extractionSystem!: ExtractionSystem;
  eventSystem!: EventSystem;
  soundSystem!: SoundSystem;
  scentSystem!: ScentSystem;
  weatherSystem!: WeatherSystem;
  adaptiveVirusSystem!: AdaptiveVirusSystem;
  biomassSystem!: BiomassSystem;
  legacyRunSystem!: LegacyRunSystem;
  mutationEvolutionSystem!: MutationEvolutionSystem;

  bullets: Bullet[] = [];
  zombies: Zombie[] = [];
  enemyProjectiles: EnemyProjectile[] = [];
  healthPickups: HealthPickup[] = [];
  xpGems: XpGem[] = [];

  score = 0;
  highScore = 0;
  wave = 1;

  nextZombieSpawn = 0;
  zombieSpawnDelay = 1200;
  nextShotTime = 0;
  nextAcidRainTime = 0;
  nextFootstepSoundTime = 0;
  nextScentTime = 0;

  currentWeapon: WeaponType = "pistol";

  gameOver = false;
  choosingUpgrade = false;
  choosingExtraction = false;
  choosingMutationEvolution = false;

  lastDamageTime = 0;
  damageCooldown = 800;
  lastScreenShakeTime = 0;

  boss: Zombie | null = null;

  bossMilestones = [5, 10, 15];

  spawnedBossMilestones: number[] = [];

  predator: Predator | null = null;

  predatorSpawned = false;

  predatorSpawnTime = 120;

  bossHealthBar!: Phaser.GameObjects.Graphics;

  bossNameText!: Phaser.GameObjects.Text;

  scoreText!: Phaser.GameObjects.Text;

  healthText!: Phaser.GameObjects.Text;

  weaponText!: Phaser.GameObjects.Text;

  waveText!: Phaser.GameObjects.Text;

  highScoreText!: Phaser.GameObjects.Text;

  levelText!: Phaser.GameObjects.Text;

  xpText!: Phaser.GameObjects.Text;

  timerText!: Phaser.GameObjects.Text;

  threatText!: Phaser.GameObjects.Text;

  infectionText!: Phaser.GameObjects.Text;

  mutationText!: Phaser.GameObjects.Text;

  eventText!: Phaser.GameObjects.Text;

  virusText!: Phaser.GameObjects.Text;

  biomassText!: Phaser.GameObjects.Text;

  weatherText!: Phaser.GameObjects.Text;

  healthBar!: Phaser.GameObjects.Graphics;

  xpBar!: Phaser.GameObjects.Graphics;

  threatBar!: Phaser.GameObjects.Graphics;

  infectionBar!: Phaser.GameObjects.Graphics;

  mutationKey!: Phaser.Input.Keyboard.Key;

  burnKey!: Phaser.Input.Keyboard.Key;

  restartKey!: Phaser.Input.Keyboard.Key;

  weaponKeys!: {
    one: Phaser.Input.Keyboard.Key;
    two: Phaser.Input.Keyboard.Key;
    three: Phaser.Input.Keyboard.Key;
  };

  extractionPosition = new Phaser.Math.Vector2(0, 0);

  extractionRadius = 95;

  extractionZone?: Phaser.GameObjects.Arc;

  extractionLabel?: Phaser.GameObjects.Text;

  extractionArrow?: Phaser.GameObjects.Text;

  extractionDistanceText?: Phaser.GameObjects.Text;

  extractionProgressText?: Phaser.GameObjects.Text;

  blackoutOverlay?: Phaser.GameObjects.Rectangle;

  rushOverlay?: Phaser.GameObjects.Rectangle;

  supplyDrop?: Phaser.GameObjects.Rectangle;

  supplyDropLabel?: Phaser.GameObjects.Text;

  nestVisuals: Map<number, NestVisual> = new Map();

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

    this.weaponProgression = new WeaponProgression();

    this.threatSystem = new ThreatSystem();

    this.infectionSystem = new InfectionSystem();

    this.mutationSystem = new MutationSystem();

    this.extractionSystem = new ExtractionSystem();

    this.eventSystem = new EventSystem();

    this.soundSystem = new SoundSystem();

    this.scentSystem = new ScentSystem();

    this.weatherSystem = new WeatherSystem();

    this.adaptiveVirusSystem = new AdaptiveVirusSystem();

    this.biomassSystem = new BiomassSystem();

    this.legacyRunSystem = new LegacyRunSystem();

    this.mutationEvolutionSystem = new MutationEvolutionSystem();

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
    this.enemyProjectiles = [];
    this.healthPickups = [];
    this.xpGems = [];

    this.score = 0;
    this.wave = 1;

    this.nextZombieSpawn = 0;
    this.zombieSpawnDelay = 1200;
    this.nextShotTime = 0;
    this.nextAcidRainTime = 0;
    this.nextFootstepSoundTime = 0;
    this.nextScentTime = 0;

    this.currentWeapon = "pistol";

    this.gameOver = false;
    this.choosingUpgrade = false;
    this.choosingExtraction = false;
    this.choosingMutationEvolution = false;

    this.lastDamageTime = 0;
    this.lastScreenShakeTime = 0;

    this.boss = null;

    this.spawnedBossMilestones = [];

    this.predator = null;
    this.predatorSpawned = false;

    this.extractionPosition = new Phaser.Math.Vector2(0, 0);

    this.extractionZone = undefined;

    this.extractionLabel = undefined;

    this.extractionArrow = undefined;

    this.extractionDistanceText = undefined;

    this.extractionProgressText = undefined;

    this.blackoutOverlay = undefined;

    this.rushOverlay = undefined;

    this.supplyDrop = undefined;

    this.supplyDropLabel = undefined;

    this.nestVisuals.clear();
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

    this.mutationKey = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.F,
    );

    this.burnKey = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.E,
    );
  }

  createInterface() {
    this.scoreText = this.add
      .text(20, 20, "Score: 0", {
        fontSize: "19px",
        color: "#ffffff",
      })
      .setScrollFactor(0)
      .setDepth(500);

    this.healthText = this.add
      .text(20, 48, "HP: 100 / 100", {
        fontSize: "16px",
        color: "#ffffff",
      })
      .setScrollFactor(0)
      .setDepth(500);

    this.healthBar = this.add.graphics();

    this.healthBar.setScrollFactor(0).setDepth(500);

    this.weaponText = this.add
      .text(20, 105, "Arma: Pistola Lv.1", {
        fontSize: "16px",
        color: "#ffffff",
      })
      .setScrollFactor(0)
      .setDepth(500);

    this.levelText = this.add
      .text(20, 132, "Level: 1", {
        fontSize: "16px",
        color: "#ffffff",
      })
      .setScrollFactor(0)
      .setDepth(500);

    this.xpText = this.add
      .text(20, 158, "XP: 0 / 100", {
        fontSize: "14px",
        color: "#aaaaaa",
      })
      .setScrollFactor(0)
      .setDepth(500);

    this.xpBar = this.add.graphics();

    this.xpBar.setScrollFactor(0).setDepth(500);

    this.add
      .text(500, 22, "ZOMBIE RUSH", {
        fontSize: "26px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(500);

    this.timerText = this.add
      .text(500, 58, "00:00", {
        fontSize: "24px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(500);

    this.eventText = this.add
      .text(500, 90, "", {
        fontSize: "16px",
        color: "#ffdd66",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(700);

    this.waveText = this.add
      .text(805, 20, "Ameaça: 1", {
        fontSize: "18px",
        color: "#ff7777",
      })
      .setScrollFactor(0)
      .setDepth(500);

    this.highScoreText = this.add
      .text(805, 47, `Recorde: ${this.highScore}`, {
        fontSize: "15px",
        color: "#ffffff",
      })
      .setScrollFactor(0)
      .setDepth(500);

    this.threatText = this.add
      .text(805, 82, "BARULHO: 0%", {
        fontSize: "14px",
        color: "#ffaa44",
        fontStyle: "bold",
      })
      .setScrollFactor(0)
      .setDepth(500);

    this.threatBar = this.add.graphics();

    this.threatBar.setScrollFactor(0).setDepth(500);

    this.infectionText = this.add
      .text(805, 128, "INFECÇÃO: 0%", {
        fontSize: "14px",
        color: "#88ff66",
        fontStyle: "bold",
      })
      .setScrollFactor(0)
      .setDepth(500);

    this.infectionBar = this.add.graphics();

    this.infectionBar.setScrollFactor(0).setDepth(500);

    this.mutationText = this.add
      .text(805, 177, "", {
        fontSize: "14px",
        color: "#cc77ff",
        fontStyle: "bold",
      })
      .setScrollFactor(0)
      .setDepth(500);

    this.virusText = this.add
      .text(805, 212, "VÍRUS: analisando...", {
        fontSize: "13px",
        color: "#ff6688",
      })
      .setScrollFactor(0)
      .setDepth(500);

    this.biomassText = this.add
      .text(805, 238, "", {
        fontSize: "13px",
        color: "#9cff66",
      })
      .setScrollFactor(0)
      .setDepth(500);

    this.weatherText = this.add
      .text(805, 264, "TEMPO LIMPO", {
        fontSize: "13px",
        color: "#88ccff",
      })
      .setScrollFactor(0)
      .setDepth(500);

    this.bossNameText = this.add
      .text(500, 500, "", {
        fontSize: "17px",
        color: "#ff5577",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(700)
      .setVisible(false);

    this.bossHealthBar = this.add.graphics();

    this.bossHealthBar.setScrollFactor(0).setDepth(700).setVisible(false);

    this.add
      .text(
        500,
        572,
        "WASD • Mouse • 1/2/3 Armas • F Mutação • E Queimar biomassa",
        {
          fontSize: "14px",
          color: "#888888",
        },
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(500);

    this.updateHealthBar();
    this.updateXpBar();
    this.updateSystemHud();
  }

  update(time: number, delta: number) {
    if (this.gameOver) {
      if (Phaser.Input.Keyboard.JustDown(this.restartKey)) {
        this.scene.restart();
      }

      return;
    }

    if (
      this.choosingUpgrade ||
      this.choosingExtraction ||
      this.choosingMutationEvolution
    ) {
      return;
    }

    this.updateSystems(time, delta);

    if (this.gameOver || this.choosingMutationEvolution) {
      return;
    }

    this.updateDifficulty();

    this.updateLegacyBossSpawn();

    this.updateBossSpawns();

    this.checkExtractionOffer();

    this.applyPlayerStatus();

    const oldX = this.player.x;

    const oldY = this.player.y;

    this.player.update(delta);

    const movedDistance = Phaser.Math.Distance.Between(
      oldX,
      oldY,
      this.player.x,
      this.player.y,
    );

    this.handlePlayerMovementNoise(time, movedDistance);

    this.leaveBloodTrail(time);

    this.updateExtraction(delta);

    this.checkSupplyDropPickup();

    this.handleBurnInput();

    this.changeWeapons();

    if (this.input.activePointer.isDown) {
      this.shoot(time);
    }

    this.updateBullets(delta);

    this.updateZombies(time, delta);

    this.updateSpecialEnemies(time);

    this.updateEnemyProjectiles(delta);

    this.updateHealthPickups(time);

    this.updateXpGems(delta);

    this.spawnZombies(time);

    this.checkBulletZombieCollision();

    this.checkEnemyProjectileCollision();

    this.checkPlayerZombieCollision(time);

    this.cleanObjects();
  }

  updateSystems(time: number, delta: number) {
    this.survivalManager.update(delta);

    this.timerText.setText(this.survivalManager.getFormattedTime());

    this.threatSystem.update(delta);

    this.eventSystem.update(delta);

    this.soundSystem.update(delta);

    this.scentSystem.update(delta);

    this.weatherSystem.update(delta);

    this.handleWeatherChange();

    this.adaptiveVirusSystem.update(delta);

    this.extractionSystem.update(this.survivalManager.getElapsedSeconds());

    this.handleMutationInput();

    this.mutationSystem.update(delta, this.infectionSystem);

    if (this.mutationSystem.active) {
      this.adaptiveVirusSystem.recordMutation(delta);
    }

    this.mutationEvolutionSystem.update(this.infectionSystem.infection);

    if (this.mutationEvolutionSystem.hasPendingChoice()) {
      this.showMutationEvolutionSelection();

      return;
    }

    this.enforceInfectionFloor();

    this.handleRushState();

    this.handleEventState();

    this.handleAdaptiveVirusState();

    this.updateEventGameplay(time);

    this.updateBiomass(delta);

    this.updatePredatorSpawn();

    this.handlePredatorReturn();

    if (this.mutationSystem.consumeFinished()) {
      this.player.setFillStyle(0x00ff88);

      this.showCenterMessage("MUTAÇÃO ENCERRADA", "#cc77ff");
    }

    if (this.infectionSystem.isFullyInfected()) {
      this.loseByInfection();

      return;
    }

    this.updateSystemHud();
  }

  applyPlayerStatus() {
    const infectionSpeed = this.infectionSystem.getSpeedMultiplier();

    const mutationSpeed = this.mutationSystem.getSpeedMultiplier();

    const bodySpeed = this.mutationEvolutionSystem.getSpeedMultiplier();

    const weatherSpeed = this.weatherSystem.getPlayerSpeedMultiplier();

    this.player.setMovementMultiplier(
      infectionSpeed * mutationSpeed * bodySpeed * weatherSpeed,
    );

    const healthPenalty = this.infectionSystem.getMaxHealthPenalty();

    this.player.setHealthLimitMultiplier(1 - healthPenalty);

    this.updateHealthBar();
  }

  handlePlayerMovementNoise(time: number, movedDistance: number) {
    this.adaptiveVirusSystem.recordMovement(movedDistance);

    if (movedDistance <= 0) {
      return;
    }

    if (time < this.nextFootstepSoundTime) {
      return;
    }

    this.nextFootstepSoundTime = time + 650;

    const noiseMultiplier =
      this.mutationEvolutionSystem.getMovementNoiseMultiplier();

    const radius =
      130 * noiseMultiplier * this.weatherSystem.getSoundMultiplier();

    this.soundSystem.addSound(
      this.player.x,
      this.player.y,
      radius,
      0.35 * noiseMultiplier,
      900,
    );

    if (noiseMultiplier > 1) {
      this.threatSystem.addNoise(0.8);
    }
  }

  leaveBloodTrail(time: number) {
    const maxHealth = this.player.getEffectiveMaxHealth();

    const healthPercent = this.player.health / maxHealth;

    if (healthPercent > 0.65) {
      return;
    }

    if (time < this.nextScentTime) {
      return;
    }

    this.nextScentTime = time + 700;

    let strength = 1;

    if (healthPercent <= 0.4) {
      strength = 1.5;
    }

    if (healthPercent <= 0.2) {
      strength = 2.2;
    }

    strength *= this.weatherSystem.getScentMultiplier();

    this.scentSystem.addScent(this.player.x, this.player.y, strength, 8500);

    const blood = this.add
      .circle(this.player.x, this.player.y, 4, 0x770000, 0.5)
      .setDepth(-2);

    this.tweens.add({
      targets: blood,
      alpha: 0,
      duration: 7000,

      onComplete: () => {
        blood.destroy();
      },
    });
  }

  handleMutationInput() {
    if (!Phaser.Input.Keyboard.JustDown(this.mutationKey)) {
      return;
    }

    const activated = this.mutationSystem.activate(this.infectionSystem);

    if (!activated) {
      return;
    }

    this.player.setFillStyle(0xaa44ff);

    this.threatSystem.addNoise(15);

    this.soundSystem.addSound(this.player.x, this.player.y, 700, 1.4, 2200);

    this.showCenterMessage("MUTAÇÃO ATIVADA", "#cc66ff");

    this.shakeCamera(0.006);
  }

  enforceInfectionFloor() {
    const floor = this.mutationEvolutionSystem.getInfectionFloor();

    if (this.infectionSystem.infection < floor) {
      this.infectionSystem.infection = floor;
    }
  }

  handleWeatherChange() {
    const weather = this.weatherSystem.consumeWeatherChanged();

    if (!weather) {
      return;
    }

    this.showCenterMessage(weather.name, "#88ccff", 1800);
  }

  updatePredatorSpawn() {
    if (this.predatorSpawned) {
      return;
    }

    if (this.survivalManager.getElapsedSeconds() < this.predatorSpawnTime) {
      return;
    }

    this.spawnPredator();
  }

  spawnPredator() {
    const position = this.spawnManager.getSpawnPosition();

    const predator = new Predator(this, position.x, position.y);

    this.predator = predator;

    this.predatorSpawned = true;

    this.zombies.push(predator);

    this.showCenterMessage("ALGO ESTÁ TE CAÇANDO...", "#ff3355", 2200);

    this.soundSystem.addSound(predator.x, predator.y, 700, 1.5, 3000);
  }

  handlePredatorReturn() {
    if (!this.predator || !this.predator.active) {
      return;
    }

    const adaptedTo = this.predator.consumeReturned();

    if (!adaptedTo) {
      return;
    }

    let weaponName = "ARMA";

    if (adaptedTo === "pistol") {
      weaponName = "PISTOLA";
    }

    if (adaptedTo === "rifle") {
      weaponName = "RIFLE";
    }

    if (adaptedTo === "shotgun") {
      weaponName = "SHOTGUN";
    }

    this.showCenterMessage(
      `O STALKER SE ADAPTOU À ${weaponName}`,
      "#ff3355",
      2200,
    );

    this.threatSystem.addNoise(15);
  }

  broadcastZombieAlert(zombie: Zombie, time: number) {
    if (!zombie.canAlert(time)) {
      return;
    }

    zombie.markAlerted(time);

    const alertRadius = 650;

    for (const other of this.zombies) {
      if (!other.active || other === zombie) {
        continue;
      }

      const distance = Phaser.Math.Distance.Between(
        zombie.x,
        zombie.y,
        other.x,
        other.y,
      );

      if (distance > alertRadius) {
        continue;
      }

      other.rememberPlayer(this.player.x, this.player.y, 4500);
    }

    this.soundSystem.addSound(zombie.x, zombie.y, alertRadius, 0.9, 1800);

    this.threatSystem.addNoise(1.5);

    this.showWorldMessage(zombie.x, zombie.y - 30, "!", "#ff3333");
  }

  findFeralTarget(zombie: Zombie) {
    let target: Zombie | null = null;

    let closest = 230;

    for (const other of this.zombies) {
      if (
        !other.active ||
        other === zombie ||
        other.isFeral ||
        other.zombieType === "boss"
      ) {
        continue;
      }

      const distance = Phaser.Math.Distance.Between(
        zombie.x,
        zombie.y,
        other.x,
        other.y,
      );

      if (distance < closest) {
        closest = distance;

        target = other;
      }
    }

    return target;
  }

  handleRushState() {
    if (this.threatSystem.consumeRushStarted()) {
      this.startRushVisual();

      this.showCenterMessage("⚠ RUSH", "#ff3344", 1800);

      this.soundSystem.addSound(this.player.x, this.player.y, 1400, 3, 4500);

      this.shakeCamera(0.008);
    }

    if (this.threatSystem.consumeRushEnded()) {
      this.stopRushVisual();

      this.score += 250;

      this.scoreText.setText(`Score: ${this.score}`);

      const leveledUp = this.player.gainXp(100);

      this.updateXpBar();

      this.showCenterMessage("RUSH SOBREVIVIDO +250", "#ffff55", 1800);

      if (leveledUp) {
        this.showUpgradeSelection();
      }
    }
  }

  startRushVisual() {
    this.rushOverlay?.destroy();

    this.rushOverlay = this.add
      .rectangle(500, 300, 1000, 600, 0xff0000, 0.07)
      .setScrollFactor(0)
      .setDepth(420);
  }

  stopRushVisual() {
    this.rushOverlay?.destroy();

    this.rushOverlay = undefined;
  }

  handleEventState() {
    if (this.eventSystem.consumeEventStarted()) {
      const event = this.eventSystem.activeEvent;

      if (event) {
        this.showEventBanner(event.name, event.description);

        if (event.type === "blackout") {
          this.startBlackout();
        }

        if (event.type === "supplyDrop") {
          this.spawnSupplyDrop();
        }

        if (event.type === "acidRain") {
          this.nextAcidRainTime = this.time.now + 500;
        }
      }
    }

    if (this.eventSystem.consumeEventEnded()) {
      this.stopBlackout();

      this.removeSupplyDrop();

      this.eventText.setText("");
    }

    if (this.eventSystem.activeEvent) {
      this.eventText.setText(
        `${this.eventSystem.activeEvent.name} • ${this.eventSystem.getSecondsRemaining()}s`,
      );
    } else {
      this.eventText.setText("");
    }
  }

  handleAdaptiveVirusState() {
    const adaptation = this.adaptiveVirusSystem.consumeNewAdaptation();

    if (!adaptation) {
      return;
    }

    const title = this.add
      .text(500, 215, "VÍRUS ADAPTADO", {
        fontSize: "35px",
        color: "#ff4f72",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(2100);

    const name = this.add
      .text(500, 260, adaptation.name, {
        fontSize: "22px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(2100);

    const description = this.add
      .text(500, 300, adaptation.description, {
        fontSize: "16px",
        color: "#dddddd",
        align: "center",

        wordWrap: {
          width: 620,
        },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(2100);

    this.tweens.add({
      targets: [title, name, description],

      alpha: 0,
      delay: 2500,
      duration: 900,

      onComplete: () => {
        title.destroy();
        name.destroy();
        description.destroy();
      },
    });

    this.shakeCamera(0.004);
  }

  updateEventGameplay(time: number) {
    if (this.eventSystem.isAcidRainActive() && time >= this.nextAcidRainTime) {
      this.nextAcidRainTime = time + 1800;

      this.createAcidRainDrop();
    }
  }

  startBlackout() {
    this.blackoutOverlay?.destroy();

    this.blackoutOverlay = this.add
      .rectangle(500, 300, 1000, 600, 0x000000, 0.48)
      .setScrollFactor(0)
      .setDepth(410);
  }

  stopBlackout() {
    this.blackoutOverlay?.destroy();

    this.blackoutOverlay = undefined;
  }

  spawnSupplyDrop() {
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);

    const distance = Phaser.Math.Between(300, 550);

    const x = Phaser.Math.Clamp(
      this.player.x + Math.cos(angle) * distance,
      60,
      WORLD_WIDTH - 60,
    );

    const y = Phaser.Math.Clamp(
      this.player.y + Math.sin(angle) * distance,
      60,
      WORLD_HEIGHT - 60,
    );

    this.supplyDrop = this.add
      .rectangle(x, y, 42, 42, 0xffcc33)
      .setStrokeStyle(4, 0xffffff)
      .setDepth(15);

    this.supplyDropLabel = this.add
      .text(x, y - 38, "SUPPLY", {
        fontSize: "14px",
        color: "#ffdd55",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(20);

    this.soundSystem.addSound(x, y, 900, 1.8, 5000);
  }

  removeSupplyDrop() {
    this.supplyDrop?.destroy();

    this.supplyDropLabel?.destroy();

    this.supplyDrop = undefined;

    this.supplyDropLabel = undefined;
  }

  checkSupplyDropPickup() {
    if (!this.supplyDrop || !this.supplyDrop.active) {
      return;
    }

    const hit = Phaser.Geom.Intersects.RectangleToRectangle(
      this.player.getBounds(),
      this.supplyDrop.getBounds(),
    );

    if (!hit) {
      return;
    }

    this.player.heal(35);

    this.infectionSystem.reduceInfection(15);

    this.enforceInfectionFloor();

    this.threatSystem.reduceNoise(20);

    this.score += 200;

    this.scoreText.setText(`Score: ${this.score}`);

    const leveledUp = this.player.gainXp(75);

    this.updateHealthBar();
    this.updateXpBar();
    this.updateSystemHud();

    this.showCenterMessage("SUPPLY COLETADO", "#ffdd55");

    this.removeSupplyDrop();

    if (leveledUp) {
      this.showUpgradeSelection();
    }
  }

  createAcidRainDrop() {
    const x = Phaser.Math.Clamp(
      this.player.x + Phaser.Math.Between(-260, 260),
      50,
      WORLD_WIDTH - 50,
    );

    const y = Phaser.Math.Clamp(
      this.player.y + Phaser.Math.Between(-220, 220),
      50,
      WORLD_HEIGHT - 50,
    );

    const marker = this.add
      .circle(x, y, 38, 0xaaff00, 0.12)
      .setStrokeStyle(3, 0xaaff00, 0.7)
      .setDepth(8);

    this.tweens.add({
      targets: marker,
      scale: 1.25,
      duration: 650,

      onComplete: () => {
        if (!marker.active) {
          return;
        }

        marker.setFillStyle(0x55ff33, 0.45);

        const distance = Phaser.Math.Distance.Between(
          marker.x,
          marker.y,
          this.player.x,
          this.player.y,
        );

        if (distance <= 55 && !this.gameOver) {
          this.player.takeDamage(8);

          this.addInfection(3);

          this.updateHealthBar();

          this.showPlayerDamageEffect();

          if (this.player.isDead()) {
            this.endGame();
          }
        }

        this.tweens.add({
          targets: marker,
          alpha: 0,
          duration: 700,

          onComplete: () => {
            marker.destroy();
          },
        });
      },
    });
  }

  showEventBanner(name: string, description: string) {
    const title = this.add
      .text(500, 235, name, {
        fontSize: "38px",
        color: "#ffdd55",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1800);

    const subtitle = this.add
      .text(500, 285, description, {
        fontSize: "18px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1800);

    this.tweens.add({
      targets: [title, subtitle],

      alpha: 0,
      delay: 1800,
      duration: 800,

      onComplete: () => {
        title.destroy();
        subtitle.destroy();
      },
    });
  }

  updateBiomass(delta: number) {
    const spawnPatches = this.biomassSystem.update(delta);

    for (const patch of spawnPatches) {
      this.spawnFromNest(patch);
    }

    this.processNewNests();
  }

  processNewNests() {
    while (true) {
      const patch = this.biomassSystem.consumeNewNest();

      if (!patch) {
        break;
      }

      this.createNestVisual(patch);

      this.showCenterMessage("UM NINHO SE FORMOU", "#8cff55", 1600);

      this.threatSystem.addNoise(12);

      this.soundSystem.addSound(patch.x, patch.y, 650, 1.5, 3500);
    }
  }

  createNestVisual(patch: BiomassPatch) {
    if (this.nestVisuals.has(patch.id)) {
      return;
    }

    const circle = this.add
      .circle(patch.x, patch.y, 48, 0x5cab32, 0.25)
      .setStrokeStyle(4, 0x9dff66, 0.8)
      .setDepth(4);

    const label = this.add
      .text(patch.x, patch.y - 65, "NINHO", {
        fontSize: "15px",
        color: "#aaff77",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(18);

    this.nestVisuals.set(patch.id, {
      circle,
      label,
    });
  }

  removeNestVisual(id: number) {
    const visual = this.nestVisuals.get(id);

    if (!visual) {
      return;
    }

    visual.circle.destroy();
    visual.label.destroy();

    this.nestVisuals.delete(id);
  }

  spawnFromNest(patch: BiomassPatch) {
    const amount = Phaser.Math.Between(1, 2);

    for (let i = 0; i < amount; i++) {
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);

      const distance = Phaser.Math.Between(55, 90);

      const x = Phaser.Math.Clamp(
        patch.x + Math.cos(angle) * distance,
        30,
        WORLD_WIDTH - 30,
      );

      const y = Phaser.Math.Clamp(
        patch.y + Math.sin(angle) * distance,
        30,
        WORLD_HEIGHT - 30,
      );

      const type: ZombieType = Math.random() < 0.3 ? "fast" : "normal";

      const zombie = new Zombie(this, x, y, type);

      this.zombies.push(zombie);
    }
  }

  handleBurnInput() {
    if (!Phaser.Input.Keyboard.JustDown(this.burnKey)) {
      return;
    }

    const patch = this.biomassSystem.burnClosest(
      this.player.x,
      this.player.y,
      120,
    );

    if (!patch) {
      return;
    }

    this.removeNestVisual(patch.id);

    const blastRadius = Math.min(260, 130 + patch.amount * 8);

    const burnDamage = 30 + patch.amount * 10;

    for (const zombie of this.zombies) {
      if (!zombie.active || zombie.zombieType === "boss") {
        continue;
      }

      const distance = Phaser.Math.Distance.Between(
        patch.x,
        patch.y,
        zombie.x,
        zombie.y,
      );

      if (distance > blastRadius) {
        continue;
      }

      const zombieX = zombie.x;

      const zombieY = zombie.y;

      const killed = zombie.takeDamage(burnDamage);

      if (killed) {
        this.createDeathEffect(zombieX, zombieY);
      }
    }

    this.threatSystem.addNoise(25);

    this.soundSystem.addSound(patch.x, patch.y, 850, 2.2, 3000);

    const fire = this.add
      .circle(patch.x, patch.y, 36, 0xff7a22, 0.65)
      .setDepth(22);

    this.tweens.add({
      targets: fire,

      scale: 1.8,
      alpha: 0,
      duration: 900,

      onComplete: () => {
        fire.destroy();
      },
    });

    this.showCenterMessage("BIOMASSA QUEIMADA • BARULHO +25", "#ff9a55", 1500);
  }

  updateDifficulty() {
    const difficulty = this.survivalManager.getDifficultyLevel();

    const baseDelay = this.survivalManager.getSpawnDelay();

    this.zombieSpawnDelay =
      baseDelay * this.threatSystem.getSpawnDelayMultiplier();

    if (this.extractionSystem.extractionActive) {
      this.zombieSpawnDelay *= 0.65;
    }

    this.zombieSpawnDelay = Math.max(130, this.zombieSpawnDelay);

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

    const weapon = this.weaponProgression.getStats(this.currentWeapon);

    this.weaponText.setText(`Arma: ${weapon.name}`);
  }

  getCurrentWeaponNoise() {
    const evolved = this.weaponProgression.isEvolved(this.currentWeapon);

    if (evolved && this.currentWeapon === "pistol") {
      return 6;
    }

    if (evolved && this.currentWeapon === "rifle") {
      return 2;
    }

    if (evolved && this.currentWeapon === "shotgun") {
      return 12;
    }

    if (this.currentWeapon === "pistol") {
      return 2;
    }

    if (this.currentWeapon === "rifle") {
      return 3;
    }

    return 7;
  }

  getCurrentWeaponSoundRadius() {
    const evolved = this.weaponProgression.isEvolved(this.currentWeapon);

    if (this.currentWeapon === "pistol") {
      return evolved ? 700 : 450;
    }

    if (this.currentWeapon === "rifle") {
      return evolved ? 780 : 580;
    }

    return evolved ? 1150 : 850;
  }

  shoot(time: number) {
    const weapon = this.weaponProgression.getStats(this.currentWeapon);

    const fireRate =
      weapon.fireRate *
      this.player.fireRateMultiplier *
      this.mutationEvolutionSystem.getFireRateMultiplier();

    if (time < this.nextShotTime) {
      return;
    }

    this.nextShotTime = time + fireRate;

    this.threatSystem.addNoise(this.getCurrentWeaponNoise());

    this.soundSystem.addSound(
      this.player.x,
      this.player.y,
      this.getCurrentWeaponSoundRadius() *
        this.weatherSystem.getSoundMultiplier(),
      this.getCurrentWeaponNoise() / 4,
      1800,
    );

    this.adaptiveVirusSystem.recordShot(this.currentWeapon);

    this.legacyRunSystem.recordShot(this.currentWeapon);

    const bulletSpeed = weapon.bulletSpeed * this.player.bulletSpeedMultiplier;

    const bulletsPerShot =
      weapon.bulletsPerShot +
      this.player.extraProjectiles +
      this.mutationSystem.getExtraProjectiles();

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
        const spread = weapon.spread > 0 ? weapon.spread : 0.08;

        angle += Phaser.Math.FloatBetween(-spread, spread);
      }

      let damage = weapon.damage * this.player.damageMultiplier;

      damage *= this.infectionSystem.getDamageMultiplier();

      damage *= this.mutationSystem.getDamageMultiplier();

      damage *= this.mutationEvolutionSystem.getDamageMultiplier();

      const criticalChance = Math.min(
        0.9,
        this.player.criticalChance +
          this.infectionSystem.getCriticalChanceBonus() +
          this.mutationEvolutionSystem.getCriticalChanceBonus(),
      );

      const critical = Math.random() < criticalChance;

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
    for (const bullet of this.bullets) {
      if (bullet.active) {
        bullet.update(delta);
      }
    }
  }

  updateZombies(time: number, delta: number) {
    let speedMultiplier = this.eventSystem.getZombieSpeedMultiplier();

    speedMultiplier *= this.adaptiveVirusSystem.getZombieSpeedMultiplier();

    if (this.threatSystem.rushActive) {
      speedMultiplier *= 1.12;
    }

    const detectionRange =
      240 *
      this.adaptiveVirusSystem.getAwarenessMultiplier() *
      this.weatherSystem.getVisionMultiplier();

    for (const zombie of this.zombies) {
      if (!zombie.active) {
        continue;
      }

      if (zombie instanceof Predator) {
        zombie.updatePredator(this.player, delta, time);

        continue;
      }

      if (zombie.isFeral) {
        const feralTarget = this.findFeralTarget(zombie);

        if (feralTarget) {
          const distance = Phaser.Math.Distance.Between(
            zombie.x,
            zombie.y,
            feralTarget.x,
            feralTarget.y,
          );

          zombie.update(
            this.player,
            delta,
            speedMultiplier,
            feralTarget.x,
            feralTarget.y,
            false,
          );

          if (distance <= 38 && time >= zombie.nextFeralAttackTime) {
            zombie.nextFeralAttackTime = time + 850;

            const x = feralTarget.x;

            const y = feralTarget.y;

            const killed = feralTarget.takeDamage(28);

            if (killed) {
              this.createDeathEffect(x, y);

              this.biomassSystem.addDeath(x, y, 1);

              this.processNewNests();
            }
          }

          continue;
        }
      }

      const distanceToPlayer = Phaser.Math.Distance.Between(
        zombie.x,
        zombie.y,
        this.player.x,
        this.player.y,
      );

      const alwaysHunts =
        zombie.zombieType === "boss" || this.threatSystem.rushActive;

      const seesPlayer = alwaysHunts || distanceToPlayer <= detectionRange;

      if (seesPlayer) {
        zombie.rememberPlayer(this.player.x, this.player.y, 4500);

        this.broadcastZombieAlert(zombie, time);

        zombie.update(
          this.player,
          delta,
          speedMultiplier,
          this.player.x,
          this.player.y,
          true,
        );

        continue;
      }

      const sound = this.soundSystem.getBestSoundFor(zombie.x, zombie.y);

      if (sound) {
        zombie.update(
          this.player,
          delta,
          speedMultiplier,
          sound.x,
          sound.y,
          false,
        );

        continue;
      }

      const scent = this.scentSystem.getBestScentFor(zombie.x, zombie.y, 550);

      if (scent) {
        zombie.update(
          this.player,
          delta,
          speedMultiplier,
          scent.x,
          scent.y,
          false,
        );

        continue;
      }

      if (zombie.hasPlayerMemory()) {
        zombie.update(
          this.player,
          delta,
          speedMultiplier,
          zombie.lastKnownPlayerX,
          zombie.lastKnownPlayerY,
          false,
        );
      }
    }
  }

  spawnZombies(time: number) {
    if (time < this.nextZombieSpawn) {
      return;
    }

    this.nextZombieSpawn = time + this.zombieSpawnDelay;

    const position = this.spawnManager.getSpawnPosition();

    const type = this.getZombieType();

    const zombie = new Zombie(this, position.x, position.y, type);

    if (this.wave >= 4 && type !== "boss") {
      const feralChance = Phaser.Math.Between(1, 100);

      if (feralChance <= 7) {
        zombie.setFeral();
      }
    }

    this.zombies.push(zombie);
  }

  getZombieType(): ZombieType {
    const random = Phaser.Math.Between(1, 100);

    const specialBonus =
      this.threatSystem.getSpecialEnemyBonus() +
      this.eventSystem.getSpecialEnemyBonus() +
      this.adaptiveVirusSystem.getSpecialEnemyBonus();

    if (this.wave >= 6 && random <= 10 + Math.floor(specialBonus * 0.35)) {
      return "spitter";
    }

    if (this.wave >= 3 && random <= 20 + Math.floor(specialBonus * 0.6)) {
      return "exploder";
    }

    if (this.wave >= 4 && random <= 35 + specialBonus) {
      return "tank";
    }

    if (this.wave >= 2 && random <= 60 + Math.floor(specialBonus * 0.4)) {
      return "fast";
    }

    return "normal";
  }

  updateSpecialEnemies(time: number) {
    for (const zombie of this.zombies) {
      if (!zombie.active) {
        continue;
      }

      if (zombie instanceof Predator) {
        continue;
      }

      const distance = Phaser.Math.Distance.Between(
        zombie.x,
        zombie.y,
        this.player.x,
        this.player.y,
      );

      if (zombie.zombieType === "exploder") {
        if (distance <= 75) {
          this.explodeZombie(zombie);
        }

        continue;
      }

      if (zombie.zombieType === "spitter") {
        if (distance <= 480 && time >= zombie.nextAttackTime) {
          zombie.nextAttackTime = time + zombie.attackCooldown;

          this.spitterAttack(zombie);
        }

        continue;
      }

      if (zombie.zombieType === "boss") {
        if (zombie.isLegacyBoss) {
          if (time >= zombie.nextAttackTime) {
            zombie.nextAttackTime = time + zombie.attackCooldown;

            this.legacyBossAttack(zombie);
          }

          if (time >= zombie.nextSpecialTime) {
            zombie.nextSpecialTime = time + 5200;

            this.bossDash(zombie);
          }

          continue;
        }

        if (time >= zombie.nextAttackTime) {
          zombie.nextAttackTime = time + zombie.attackCooldown;

          this.bossDash(zombie);
        }

        if (time >= zombie.nextSpecialTime) {
          zombie.nextSpecialTime = time + 6500;

          this.bossSummon(zombie);
        }
      }
    }
  }

  spitterAttack(zombie: Zombie) {
    const angle = Phaser.Math.Angle.Between(
      zombie.x,
      zombie.y,
      this.player.x,
      this.player.y,
    );

    const projectile = new EnemyProjectile(
      this,
      zombie.x,
      zombie.y,
      angle,
      240,
      zombie.damage,
    );

    this.enemyProjectiles.push(projectile);
  }

  updateEnemyProjectiles(delta: number) {
    for (const projectile of this.enemyProjectiles) {
      if (projectile.active) {
        projectile.update(delta);
      }
    }
  }

  checkEnemyProjectileCollision() {
    for (const projectile of this.enemyProjectiles) {
      if (!projectile.active) {
        continue;
      }

      const hit = Phaser.Geom.Intersects.RectangleToRectangle(
        projectile.getBounds(),
        this.player.getBounds(),
      );

      if (!hit) {
        continue;
      }

      const x = projectile.x;

      const y = projectile.y;

      projectile.destroy();

      this.player.takeDamage(projectile.damage);

      this.addInfection(7);

      this.updateHealthBar();

      this.updateSystemHud();

      this.showPlayerDamageEffect();

      const acid = this.add.circle(x, y, 22, 0x44ff55, 0.25).setDepth(-3);

      this.tweens.add({
        targets: acid,
        alpha: 0,
        duration: 1800,

        onComplete: () => {
          acid.destroy();
        },
      });

      if (this.player.isDead()) {
        this.endGame();
      }
    }
  }

  explodeZombie(zombie: Zombie) {
    if (!zombie.active) {
      return;
    }

    const x = zombie.x;

    const y = zombie.y;

    const damage = zombie.damage;

    zombie.destroy();

    const explosion = this.add.circle(x, y, 45, 0x77ff44, 0.35).setDepth(30);

    this.tweens.add({
      targets: explosion,
      scale: 2.2,
      alpha: 0,
      duration: 350,

      onComplete: () => {
        explosion.destroy();
      },
    });

    this.createBloodEffect(x, y, 10);

    this.shakeCamera(0.006);

    this.soundSystem.addSound(
      x,
      y,
      780 * this.weatherSystem.getSoundMultiplier(),
      2.1,
      2400,
    );

    this.threatSystem.addNoise(10);

    const distance = Phaser.Math.Distance.Between(
      x,
      y,
      this.player.x,
      this.player.y,
    );

    if (distance <= 105) {
      this.player.takeDamage(damage);

      this.addInfection(12);

      this.updateHealthBar();

      this.updateSystemHud();

      this.showPlayerDamageEffect();

      if (this.player.isDead()) {
        this.endGame();
      }
    }
  }

  checkBulletZombieCollision() {
    for (const bullet of this.bullets) {
      if (!bullet.active) {
        continue;
      }

      for (const zombie of this.zombies) {
        if (!zombie.active || !bullet.active) {
          continue;
        }

        const hit = Phaser.Geom.Intersects.RectangleToRectangle(
          bullet.getBounds(),
          zombie.getBounds(),
        );

        if (!hit) {
          continue;
        }

        const dropX = zombie.x;

        const dropY = zombie.y;

        const points = zombie.points;

        const xpReward = zombie.xpReward;

        const zombieType = zombie.zombieType;

        const wasLegacyBoss = zombie.isLegacyBoss;

        const wasPredator = zombie instanceof Predator;

        const adaptationMultiplier =
          this.adaptiveVirusSystem.getDamageTakenMultiplier(bullet.weaponType);

        const finalDamage = bullet.damage * adaptationMultiplier;

        let actualDamage = finalDamage;

        let killed = false;

        let predatorRetreated = false;

        if (wasPredator) {
          const result = zombie.receiveDamage(
            finalDamage,
            bullet.weaponType,
            this.time.now,
          );

          actualDamage = result.damage;

          killed = result.killed;

          predatorRetreated = result.retreated;
        } else {
          killed = zombie.takeDamage(finalDamage);
        }

        this.showDamageNumber(
          zombie.x,
          zombie.y,
          actualDamage,
          bullet.isCritical,
        );

        this.createBloodEffect(zombie.x, zombie.y, bullet.isCritical ? 8 : 5);

        let knockback = 18;

        if (bullet.weaponType === "shotgun") {
          knockback = 30;
        }

        knockback *= this.mutationSystem.getKnockbackMultiplier();

        knockback *= this.mutationEvolutionSystem.getKnockbackMultiplier();

        zombie.applyKnockback(bullet.x, bullet.y, knockback);

        bullet.destroy();

        const totalLifeSteal =
          this.mutationSystem.getLifeSteal() +
          this.mutationEvolutionSystem.getLifeSteal();

        if (totalLifeSteal > 0) {
          this.player.heal(actualDamage * totalLifeSteal);

          this.updateHealthBar();
        }

        if (predatorRetreated) {
          this.showCenterMessage("O STALKER ESTÁ FUGINDO...", "#ffff55", 1600);
        }

        if (!killed) {
          if (zombieType === "boss" && !wasPredator) {
            this.updateBossHealthBar();
          }

          continue;
        }

        this.createDeathEffect(dropX, dropY);

        const biomassValue =
          zombieType === "boss" ? 5 : zombieType === "tank" ? 2 : 1;

        this.biomassSystem.addDeath(dropX, dropY, biomassValue);

        this.processNewNests();

        const rewardMultiplier = this.threatSystem.getRewardMultiplier();

        const scoreReward = Math.round(points * rewardMultiplier);

        this.score += scoreReward;

        this.scoreText.setText(`Score: ${this.score}`);

        const xpMultiplier =
          this.eventSystem.getXpMultiplier() * rewardMultiplier;

        const finalXp = Math.round(xpReward * xpMultiplier);

        this.spawnXpGem(dropX, dropY, finalXp);

        this.trySpawnHealthPickup(dropX, dropY);

        if (wasPredator) {
          this.predator = null;

          this.score += 1000;

          this.scoreText.setText(`Score: ${this.score}`);

          this.showCenterMessage("THE STALKER FOI ELIMINADO", "#ff5577", 2200);

          continue;
        }

        if (zombieType === "boss") {
          this.bossDefeated(wasLegacyBoss);
        }
      }
    }
  }

  addInfection(amount: number) {
    const multiplier = this.adaptiveVirusSystem.getInfectionMultiplier();

    this.infectionSystem.addInfection(amount * multiplier);
  }

  getZombieInfection(zombie: Zombie) {
    if (zombie.zombieType === "fast") {
      return 5;
    }

    if (zombie.zombieType === "tank") {
      return 8;
    }

    if (zombie.zombieType === "spitter") {
      return 7;
    }

    if (zombie.zombieType === "boss") {
      return 10;
    }

    return 4;
  }

  checkPlayerZombieCollision(time: number) {
    for (const zombie of this.zombies) {
      if (!zombie.active) {
        continue;
      }

      if (zombie instanceof Predator && zombie.hibernating) {
        continue;
      }

      const hit = Phaser.Geom.Intersects.RectangleToRectangle(
        this.player.getBounds(),
        zombie.getBounds(),
      );

      if (!hit) {
        continue;
      }

      if (zombie.zombieType === "exploder") {
        this.explodeZombie(zombie);

        continue;
      }

      if (time - this.lastDamageTime < this.damageCooldown) {
        continue;
      }

      this.lastDamageTime = time;

      this.player.takeDamage(zombie.damage);

      this.addInfection(this.getZombieInfection(zombie));

      if (zombie.zombieType !== "boss") {
        zombie.destroy();
      }

      this.updateHealthBar();

      this.updateSystemHud();

      this.showPlayerDamageEffect();

      if (this.player.isDead()) {
        this.endGame();
      }
    }
  }

  showPlayerDamageEffect() {
    this.player.setFillStyle(0xffffff);

    this.shakeCamera(0.005);

    this.time.delayedCall(100, () => {
      if (!this.player.active) {
        return;
      }

      if (this.mutationSystem.active) {
        this.player.setFillStyle(0xaa44ff);

        return;
      }

      this.player.setFillStyle(0x00ff88);
    });
  }

  updateLegacyBossSpawn() {
    if (
      !this.legacyRunSystem.shouldSpawn(
        this.survivalManager.getElapsedSeconds(),
      )
    ) {
      return;
    }

    if (this.boss && this.boss.active) {
      return;
    }

    this.spawnLegacyBoss();
  }

  spawnLegacyBoss() {
    const stats = this.legacyRunSystem.getBossStats();

    if (!stats) {
      return;
    }

    const position = this.spawnManager.getSpawnPosition();

    const boss = new Zombie(this, position.x, position.y, "boss", 1);

    boss.isLegacyBoss = true;

    boss.legacyWeapon = stats.weapon;

    boss.legacyEvolvedWeapon = stats.evolvedWeapon;

    boss.enemyName = stats.name;

    boss.health = stats.health;

    boss.maxHealth = stats.health;

    boss.speed = stats.speed;

    boss.damage = stats.damage;

    boss.points = 750;
    boss.xpReward = 350;

    boss.baseColor = 0x3f9cff;

    boss.setFillStyle(0x3f9cff);

    boss.setStrokeStyle(4, 0xbfe0ff);

    boss.attackCooldown = stats.weapon === "rifle" ? 1300 : 1900;

    boss.nextAttackTime = this.time.now + 1000;

    boss.nextSpecialTime = this.time.now + 3500;

    this.boss = boss;

    this.zombies.push(boss);

    this.legacyRunSystem.markSpawned();

    this.showBossWarning(`${boss.enemyName}\nSUA RUN ANTERIOR VOLTOU`);

    this.updateBossHealthBar();
  }

  legacyBossAttack(boss: Zombie) {
    if (!boss.legacyWeapon) {
      return;
    }

    let bullets = 3;
    let spread = 0.18;
    let speed = 300;
    let damage = boss.damage * 0.35;

    if (boss.legacyWeapon === "rifle") {
      bullets = boss.legacyEvolvedWeapon ? 9 : 6;

      spread = 0.24;
      speed = 370;

      damage = boss.damage * 0.2;
    }

    if (boss.legacyWeapon === "shotgun") {
      bullets = boss.legacyEvolvedWeapon ? 11 : 7;

      spread = 0.85;
      speed = 285;

      damage = boss.damage * 0.27;
    }

    if (boss.legacyWeapon === "pistol") {
      bullets = boss.legacyEvolvedWeapon ? 4 : 2;

      spread = 0.12;
      speed = 340;

      damage = boss.damage * 0.45;
    }

    const baseAngle = Phaser.Math.Angle.Between(
      boss.x,
      boss.y,
      this.player.x,
      this.player.y,
    );

    for (let i = 0; i < bullets; i++) {
      const normalized = bullets <= 1 ? 0 : i / (bullets - 1) - 0.5;

      const angle = baseAngle + normalized * spread;

      const projectile = new EnemyProjectile(
        this,
        boss.x,
        boss.y,
        angle,
        speed,
        damage,
      );

      this.enemyProjectiles.push(projectile);
    }

    this.soundSystem.addSound(boss.x, boss.y, 700, 1.5, 1700);
  }

  updateBossSpawns() {
    const minute = Math.floor(this.survivalManager.getElapsedSeconds() / 60);

    for (const milestone of this.bossMilestones) {
      if (this.spawnedBossMilestones.includes(milestone)) {
        continue;
      }

      if (minute < milestone) {
        continue;
      }

      if (this.boss && this.boss.active) {
        return;
      }

      this.spawnedBossMilestones.push(milestone);

      this.spawnBoss(milestone);

      return;
    }
  }

  spawnBoss(milestone: number) {
    const stage = Math.max(1, Math.floor(milestone / 5));

    const position = this.spawnManager.getSpawnPosition();

    const boss = new Zombie(this, position.x, position.y, "boss", stage);

    this.boss = boss;

    this.zombies.push(boss);

    this.showBossWarning(boss.enemyName);

    this.updateBossHealthBar();
  }

  updateBossHealthBar() {
    if (!this.boss || !this.boss.active) {
      this.hideBossInterface();

      return;
    }

    this.bossNameText.setVisible(true).setText(this.boss.enemyName);

    this.bossHealthBar.setVisible(true);

    this.bossHealthBar.clear();

    this.bossHealthBar.fillStyle(0x222222);

    this.bossHealthBar.fillRect(300, 525, 400, 16);

    const percentage = Math.max(0, this.boss.health / this.boss.maxHealth);

    this.bossHealthBar.fillStyle(this.boss.isLegacyBoss ? 0x3f9cff : 0xff2244);

    this.bossHealthBar.fillRect(300, 525, 400 * percentage, 16);
  }

  hideBossInterface() {
    this.bossHealthBar.clear().setVisible(false);

    this.bossNameText.setVisible(false);
  }

  bossDefeated(wasLegacyBoss: boolean) {
    this.boss = null;

    this.hideBossInterface();

    this.shakeCamera(0.009);

    if (wasLegacyBoss) {
      this.legacyRunSystem.markDefeated();

      this.score += 500;

      this.scoreText.setText(`Score: ${this.score}`);

      this.showCenterMessage("VOCÊ DERROTOU SUA RUN ANTERIOR", "#7fc8ff", 2200);

      return;
    }

    this.showCenterMessage("BOSS DERROTADO!", "#ffff55", 1800);
  }

  showBossWarning(bossName: string) {
    const warning = this.add
      .text(500, 225, "BOSS INCOMING", {
        fontSize: "42px",
        color: "#ff3355",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1800);

    const name = this.add
      .text(500, 285, bossName, {
        fontSize: "23px",
        color: "#ffffff",
        fontStyle: "bold",
        align: "center",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1800);

    this.shakeCamera(0.006);

    this.tweens.add({
      targets: [warning, name],

      alpha: 0,
      delay: 1800,
      duration: 900,

      onComplete: () => {
        warning.destroy();
        name.destroy();
      },
    });
  }

  bossDash(boss: Zombie) {
    if (!boss.active) {
      return;
    }

    const angle = Phaser.Math.Angle.Between(
      boss.x,
      boss.y,
      this.player.x,
      this.player.y,
    );

    const distance = 120 + boss.bossStage * 20;

    boss.x += Math.cos(angle) * distance;

    boss.y += Math.sin(angle) * distance;

    boss.x = Phaser.Math.Clamp(boss.x, 60, WORLD_WIDTH - 60);

    boss.y = Phaser.Math.Clamp(boss.y, 60, WORLD_HEIGHT - 60);

    this.shakeCamera(0.003);
  }

  bossSummon(boss: Zombie) {
    if (!boss.active) {
      return;
    }

    const amount = 2 + boss.bossStage;

    for (let i = 0; i < amount; i++) {
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);

      const distance = Phaser.Math.Between(80, 150);

      const x = Phaser.Math.Clamp(
        boss.x + Math.cos(angle) * distance,
        30,
        WORLD_WIDTH - 30,
      );

      const y = Phaser.Math.Clamp(
        boss.y + Math.sin(angle) * distance,
        30,
        WORLD_HEIGHT - 30,
      );

      let type: ZombieType = "normal";

      if (boss.bossStage >= 2 && Math.random() < 0.5) {
        type = "fast";
      }

      const zombie = new Zombie(this, x, y, type);

      this.zombies.push(zombie);
    }

    this.showWorldMessage(boss.x, boss.y - 70, "HORDA!", "#ff5577");
  }

  checkExtractionOffer() {
    if (this.boss && this.boss.active) {
      return;
    }

    if (!this.extractionSystem.consumeNewOffer()) {
      return;
    }

    this.showExtractionOffer();
  }

  showExtractionOffer() {
    const offer = this.extractionSystem.currentOffer;

    if (!offer) {
      return;
    }

    this.choosingExtraction = true;

    const overlay = this.add
      .rectangle(500, 300, 1000, 600, 0x000000, 0.9)
      .setScrollFactor(0)
      .setDepth(2200);

    const title = this.add
      .text(500, 130, "EVACUAÇÃO DISPONÍVEL", {
        fontSize: "38px",
        color: "#00ff88",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(2201);

    const reward = this.add
      .text(500, 185, `Recompensa x${offer.rewardMultiplier}`, {
        fontSize: "23px",
        color: "#ffff66",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(2201);

    const description = this.add
      .text(500, 225, "Você pode sair agora ou arriscar continuar.", {
        fontSize: "17px",
        color: "#cccccc",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(2201);

    const extractButton = this.add
      .rectangle(500, 315, 420, 65, 0x174d36)
      .setStrokeStyle(2, 0x00ff88)
      .setInteractive({
        useHandCursor: true,
      })
      .setScrollFactor(0)
      .setDepth(2201);

    const extractText = this.add
      .text(500, 315, "IR PARA EXTRAÇÃO", {
        fontSize: "20px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(2202);

    const continueButton = this.add
      .rectangle(500, 405, 420, 65, 0x3b2222)
      .setStrokeStyle(2, 0xff5555)
      .setInteractive({
        useHandCursor: true,
      })
      .setScrollFactor(0)
      .setDepth(2201);

    const continueText = this.add
      .text(500, 405, "CONTINUAR A RUN", {
        fontSize: "20px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(2202);

    const objects: Phaser.GameObjects.GameObject[] = [
      overlay,
      title,
      reward,
      description,
      extractButton,
      extractText,
      continueButton,
      continueText,
    ];

    const closeMenu = () => {
      for (const object of objects) {
        object.destroy();
      }

      this.choosingExtraction = false;
    };

    extractButton.on("pointerdown", () => {
      const accepted = this.extractionSystem.acceptExtraction();

      if (!accepted) {
        return;
      }

      closeMenu();

      this.createExtractionZone();

      this.showCenterMessage("CHEGUE À EXTRAÇÃO", "#00ff88");
    });

    continueButton.on("pointerdown", () => {
      this.extractionSystem.continueRun();

      closeMenu();

      this.showCenterMessage("VOCÊ DECIDIU FICAR", "#ff7755");
    });
  }

  createExtractionZone() {
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);

    const distance = Phaser.Math.Between(600, 950);

    const x = Phaser.Math.Clamp(
      this.player.x + Math.cos(angle) * distance,
      150,
      WORLD_WIDTH - 150,
    );

    const y = Phaser.Math.Clamp(
      this.player.y + Math.sin(angle) * distance,
      150,
      WORLD_HEIGHT - 150,
    );

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
      .text(500, 125, "➤", {
        fontSize: "38px",
        color: "#00ff88",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(700);

    this.extractionDistanceText = this.add
      .text(500, 155, "", {
        fontSize: "14px",
        color: "#00ff88",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(700);

    this.extractionProgressText = this.add
      .text(500, 185, "", {
        fontSize: "18px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(700);
  }

  updateExtraction(delta: number) {
    if (!this.extractionSystem.extractionActive) {
      return;
    }

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

    const inside = distance <= this.extractionRadius;

    const completed = this.extractionSystem.updateExtraction(delta, inside);

    if (!inside) {
      this.extractionProgressText?.setText("Entre na zona de extração");
    } else {
      this.extractionProgressText?.setText(
        `DEFENDA: ${this.extractionSystem.getHoldSeconds()} / ${this.extractionSystem.getRequiredHoldSeconds()}s`,
      );
    }

    if (completed) {
      this.winGame();
    }
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

  trySpawnHealthPickup(x: number, y: number) {
    const chance = Phaser.Math.Between(1, 100);

    if (chance > 12) {
      return;
    }

    const pickup = new HealthPickup(this, x, y);

    this.healthPickups.push(pickup);
  }

  updateHealthPickups(time: number) {
    for (const pickup of this.healthPickups) {
      if (!pickup.active) {
        continue;
      }

      pickup.update(time);

      if (!pickup.active) {
        continue;
      }

      const collected = pickup.checkPlayerCollision(this.player);

      if (collected) {
        this.updateHealthBar();
      }
    }
  }

  showMutationEvolutionSelection() {
    if (this.choosingMutationEvolution) {
      return;
    }

    const choices = this.mutationEvolutionSystem.getChoices();

    if (choices.length === 0) {
      return;
    }

    this.choosingMutationEvolution = true;

    const overlay = this.add
      .rectangle(500, 300, 1000, 600, 0x09000f, 0.94)
      .setScrollFactor(0)
      .setDepth(2500);

    const title = this.add
      .text(500, 95, "SEU CORPO ESTÁ MUDANDO", {
        fontSize: "34px",
        color: "#d477ff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(2501);

    const subtitle = this.add
      .text(500, 142, "Escolha uma mutação permanente para esta run", {
        fontSize: "17px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(2501);

    const objects: Phaser.GameObjects.GameObject[] = [overlay, title, subtitle];

    choices.forEach((trait: MutationTrait, index: number) => {
      const y = 235 + index * 115;

      const button = this.add
        .rectangle(500, y, 590, 92, 0x291333)
        .setStrokeStyle(2, 0xb455dd)
        .setInteractive({
          useHandCursor: true,
        })
        .setScrollFactor(0)
        .setDepth(2501);

      const name = this.add
        .text(500, y - 18, trait.name, {
          fontSize: "20px",
          color: "#e6a1ff",
          fontStyle: "bold",
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(2502);

      const description = this.add
        .text(500, y + 18, trait.description, {
          fontSize: "14px",
          color: "#dddddd",
          align: "center",

          wordWrap: {
            width: 520,
          },
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(2502);

      objects.push(button, name, description);

      button.on("pointerdown", () => {
        const selected = this.mutationEvolutionSystem.selectTrait(trait.id);

        if (!selected) {
          return;
        }

        this.applyMutationTraitImmediateEffects(trait.id);

        for (const object of objects) {
          object.destroy();
        }

        this.choosingMutationEvolution = false;

        this.showCenterMessage(trait.name, "#d477ff", 1600);

        this.updateSystemHud();
      });
    });
  }

  applyMutationTraitImmediateEffects(id: MutationTraitId) {
    if (id === "parasiteEye") {
      this.player.pickupRange += 100;
    }

    if (id === "mutantHeart") {
      this.enforceInfectionFloor();
    }
  }

  showUpgradeSelection() {
    if (this.choosingUpgrade) {
      return;
    }

    this.choosingUpgrade = true;

    const playerChoices: LevelUpChoice[] = UPGRADES.map((upgrade) => ({
      name: upgrade.name,

      description: upgrade.description,

      apply: () => {
        upgrade.apply(this.player);
      },
    }));

    const shuffled = Phaser.Utils.Array.Shuffle([...playerChoices]);

    const choices: LevelUpChoice[] = shuffled.slice(0, 2);

    const weaponTypes: WeaponType[] = ["pistol", "rifle", "shotgun"];

    const availableWeapons = weaponTypes.filter((type) =>
      this.weaponProgression.canUpgrade(type),
    );

    if (availableWeapons.length > 0) {
      const weaponType = Phaser.Utils.Array.GetRandom(availableWeapons);

      choices.push({
        name: this.weaponProgression.getNextUpgradeName(weaponType),

        description:
          this.weaponProgression.getNextUpgradeDescription(weaponType),

        apply: () => {
          this.weaponProgression.upgrade(weaponType);
        },
      });
    }

    while (choices.length < 3) {
      choices.push(Phaser.Utils.Array.GetRandom(playerChoices));
    }

    Phaser.Utils.Array.Shuffle(choices);

    const overlay = this.add
      .rectangle(500, 300, 1000, 600, 0x000000, 0.9)
      .setScrollFactor(0)
      .setDepth(2000);

    const title = this.add
      .text(500, 105, `LEVEL ${this.player.level}!`, {
        fontSize: "40px",
        color: "#ffff00",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(2001);

    const subtitle = this.add
      .text(500, 150, "Escolha uma melhoria", {
        fontSize: "19px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(2001);

    const objects: Phaser.GameObjects.GameObject[] = [overlay, title, subtitle];

    choices.forEach((choice, index) => {
      const y = 240 + index * 105;

      const button = this.add
        .rectangle(500, y, 540, 82, 0x222222)
        .setStrokeStyle(2, 0x555555)
        .setInteractive({
          useHandCursor: true,
        })
        .setScrollFactor(0)
        .setDepth(2001);

      const name = this.add
        .text(500, y - 14, choice.name, {
          fontSize: "21px",
          color: "#ffffff",
          fontStyle: "bold",
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(2002);

      const description = this.add
        .text(500, y + 17, choice.description, {
          fontSize: "14px",
          color: "#aaaaaa",
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(2002);

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
        choice.apply();

        this.updateHealthBar();

        this.updateXpBar();

        const weapon = this.weaponProgression.getStats(this.currentWeapon);

        this.weaponText.setText(`Arma: ${weapon.name}`);

        for (const object of objects) {
          object.destroy();
        }

        this.choosingUpgrade = false;

        this.showCenterMessage(choice.name, "#00ff88");
      });
    });
  }

  updateSystemHud() {
    const noise = Math.round(this.threatSystem.noise);

    this.threatText.setText(
      this.threatSystem.rushActive
        ? `RUSH: ${this.threatSystem.getRushSecondsRemaining()}s`
        : `BARULHO: ${noise}%`,
    );

    this.threatBar.clear();

    this.threatBar.fillStyle(0x252525);

    this.threatBar.fillRect(805, 105, 165, 12);

    let threatColor = 0xffaa44;

    if (noise >= 75) {
      threatColor = 0xff3333;
    }

    if (this.threatSystem.rushActive) {
      threatColor = 0xff0033;
    }

    this.threatBar.fillStyle(threatColor);

    this.threatBar.fillRect(
      805,
      105,
      165 * this.threatSystem.getNoisePercentage(),
      12,
    );

    const infection = Math.round(this.infectionSystem.infection);

    this.infectionText.setText(`INFECÇÃO: ${infection}%`);

    this.infectionBar.clear();

    this.infectionBar.fillStyle(0x252525);

    this.infectionBar.fillRect(805, 151, 165, 12);

    let infectionColor = 0x66cc55;

    if (infection >= 50) {
      infectionColor = 0xccaa33;
    }

    if (infection >= 75) {
      infectionColor = 0xff7733;
    }

    if (infection >= 90) {
      infectionColor = 0xcc44ff;
    }

    this.infectionBar.fillStyle(infectionColor);

    this.infectionBar.fillRect(
      805,
      151,
      165 * this.infectionSystem.getPercentage(),
      12,
    );

    if (this.mutationSystem.active) {
      this.mutationText.setText(
        `MUTAÇÃO: ${this.mutationSystem.getSecondsRemaining()}s`,
      );
    } else if (this.infectionSystem.canMutate()) {
      this.mutationText.setText("F - ATIVAR MUTAÇÃO");
    } else {
      this.mutationText.setText("");
    }

    if (
      this.adaptiveVirusSystem.adaptations.length >=
      this.adaptiveVirusSystem.maxAdaptations
    ) {
      this.virusText.setText(
        `VÍRUS: ${this.adaptiveVirusSystem.adaptations.length} adaptações ativas`,
      );
    } else {
      this.virusText.setText(
        `VÍRUS: ${this.adaptiveVirusSystem.getCurrentFocus()} • ${this.adaptiveVirusSystem.getAnalysisSecondsRemaining()}s`,
      );
    }

    const nearest = this.biomassSystem.findNearestPatch(
      this.player.x,
      this.player.y,
      260,
    );

    if (!nearest) {
      this.biomassText.setText("");
    } else if (nearest.isNest) {
      this.biomassText.setText("NINHO PRÓXIMO • E para queimar");
    } else {
      this.biomassText.setText(
        `BIOMASSA: ${nearest.amount}/${this.biomassSystem.nestThreshold}`,
      );
    }

    const weather = this.weatherSystem.getCurrentWeather();

    this.weatherText.setText(
      `${weather.name} • ${this.weatherSystem.getSecondsRemaining()}s`,
    );
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
      const blood = this.add
        .circle(x, y, Phaser.Math.Between(2, 5), 0x9b111e)
        .setDepth(9);

      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);

      const distance = Phaser.Math.Between(15, 45);

      this.tweens.add({
        targets: blood,

        x: x + Math.cos(angle) * distance,

        y: y + Math.sin(angle) * distance,

        alpha: 0,

        duration: 400,

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

  showWorldMessage(x: number, y: number, message: string, color: string) {
    const text = this.add
      .text(x, y, message, {
        fontSize: "20px",
        color,
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(100);

    this.tweens.add({
      targets: text,

      y: y - 35,

      alpha: 0,

      duration: 800,

      onComplete: () => {
        text.destroy();
      },
    });
  }

  showCenterMessage(message: string, color: string, duration: number = 1100) {
    const text = this.add
      .text(500, 270, message, {
        fontSize: "30px",
        color,
        fontStyle: "bold",
        align: "center",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1900);

    this.tweens.add({
      targets: text,

      y: 230,

      alpha: 0,

      duration,

      onComplete: () => {
        text.destroy();
      },
    });
  }

  showWaveEffect() {
    this.showCenterMessage(`AMEAÇA ${this.wave}`, "#ff5555");
  }

  shakeCamera(intensity: number) {
    const now = this.time.now;

    if (now - this.lastScreenShakeTime < 70) {
      return;
    }

    this.lastScreenShakeTime = now;

    this.cameras.main.shake(80, intensity);
  }

  updateHealthBar() {
    const effectiveMaxHealth = this.player.getEffectiveMaxHealth();

    this.healthText.setText(
      `HP: ${Math.ceil(this.player.health)} / ${effectiveMaxHealth}`,
    );

    this.healthBar.clear();

    this.healthBar.fillStyle(0x333333);

    this.healthBar.fillRect(20, 74, 200, 17);

    const percentage = this.player.health / effectiveMaxHealth;

    let color = 0x00ff00;

    if (percentage <= 0.5) {
      color = 0xffff00;
    }

    if (percentage <= 0.25) {
      color = 0xff0000;
    }

    this.healthBar.fillStyle(color);

    this.healthBar.fillRect(20, 74, 200 * percentage, 17);
  }

  updateXpBar() {
    this.levelText.setText(`Level: ${this.player.level}`);

    this.xpText.setText(`XP: ${this.player.xp} / ${this.player.xpToNextLevel}`);

    this.xpBar.clear();

    this.xpBar.fillStyle(0x222222);

    this.xpBar.fillRect(20, 181, 200, 12);

    const percentage = this.player.xp / this.player.xpToNextLevel;

    this.xpBar.fillStyle(0x00aaff);

    this.xpBar.fillRect(20, 181, 200 * percentage, 12);
  }

  cleanObjects() {
    this.bullets = this.bullets.filter((bullet) => bullet.active);

    this.zombies = this.zombies.filter((zombie) => zombie.active);

    this.enemyProjectiles = this.enemyProjectiles.filter(
      (projectile) => projectile.active,
    );

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

    this.highScoreText?.setText(`Recorde: ${this.highScore}`);
  }

  saveCurrentRunAsLegacy() {
    const mostUsedWeapon = this.legacyRunSystem.getMostUsedWeapon();

    this.legacyRunSystem.saveRun({
      score: this.score,

      level: this.player.level,

      infection: this.infectionSystem.infection,

      mutationCount: this.mutationSystem.mutationCount,

      evolvedWeapon: this.weaponProgression.isEvolved(mostUsedWeapon),
    });
  }

  loseByInfection() {
    if (this.gameOver) {
      return;
    }

    this.gameOver = true;

    this.saveCurrentRunAsLegacy();

    this.saveHighScore();

    this.showEndScreen("A INFECÇÃO VENCEU!", "#cc55ff");
  }

  winGame() {
    if (this.gameOver) {
      return;
    }

    this.gameOver = true;

    this.saveCurrentRunAsLegacy();

    this.saveHighScore();

    this.showEndScreen("VOCÊ ESCAPOU!", "#00ff88");
  }

  endGame() {
    if (this.gameOver) {
      return;
    }

    this.gameOver = true;

    this.saveCurrentRunAsLegacy();

    this.saveHighScore();

    this.showEndScreen("GAME OVER", "#ff3333");
  }

  showEndScreen(title: string, color: string) {
    this.add
      .rectangle(500, 300, 1000, 600, 0x000000, 0.9)
      .setScrollFactor(0)
      .setDepth(4000);

    this.add
      .text(500, 85, title, {
        fontSize: "42px",
        color,
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(4001);

    const reward = this.extractionSystem.rewardMultiplier;

    const traits =
      this.mutationEvolutionSystem.chosenTraits.length > 0
        ? this.mutationEvolutionSystem.chosenTraits.join(", ")
        : "nenhuma";

    const stats = [
      `Tempo: ${this.survivalManager.getFormattedTime()}`,

      `Score: ${this.score}`,

      `Level: ${this.player.level}`,

      `Rush sobrevividos: ${this.threatSystem.rushCount}`,

      `Mutações usadas: ${this.mutationSystem.mutationCount}`,

      `Infecção final: ${Math.round(this.infectionSystem.infection)}%`,

      `Adaptações do vírus: ${this.adaptiveVirusSystem.adaptations.length}`,

      `Mutações corporais: ${traits}`,

      `Stalker derrotado: ${
        this.predator === null && this.predatorSpawned ? "sim" : "não"
      }`,

      `Eco anterior derrotado: ${
        this.legacyRunSystem.defeatedThisRun ? "sim" : "não"
      }`,

      `Multiplicador: x${reward}`,
    ];

    this.add
      .text(500, 155, stats.join("\n"), {
        fontSize: "16px",
        color: "#ffffff",
        align: "center",
        lineSpacing: 5,
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(4001);

    this.add
      .text(
        500,
        520,
        "Sua build foi salva. Ela pode voltar infectada na próxima run.",
        {
          fontSize: "14px",
          color: "#7fc8ff",
        },
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(4001);

    this.add
      .text(500, 552, "Pressione R para jogar novamente", {
        fontSize: "17px",
        color: "#aaaaaa",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(4001);
  }
}
