import Phaser from "phaser";

import type { WeaponType } from "../Weapon";

import type { WeatherType } from "./WeatherSystem";

type PlayOptions = {
  volume?: number;
  cooldown?: number;
  cooldownKey?: string;
  detune?: number;
  rate?: number;
  pan?: number;
};

type WorldPlayOptions = PlayOptions & {
  maxDistance?: number;
};

export class AudioSystem {
  private scene: Phaser.Scene;

  private effectsVolume = 0.72;

  private ambientVolume = 0.28;

  private lastPlayed = new Map<string, number>();

  private weatherLoop: Phaser.Sound.BaseSound | null = null;

  private currentWeatherKey: string | null = null;

  private static readonly FILES: Array<[string, string]> = [
    ["pistol-1", "/assets/sounds/weapons/pistol-1.mp3"],
    ["pistol-2", "/assets/sounds/weapons/pistol-2.mp3"],
    ["pistol-3", "/assets/sounds/weapons/pistol-3.mp3"],

    ["rifle-1", "/assets/sounds/weapons/rifle-1.mp3"],
    ["rifle-2", "/assets/sounds/weapons/rifle-2.mp3"],
    ["rifle-3", "/assets/sounds/weapons/rifle-3.mp3"],

    ["shotgun-1", "/assets/sounds/weapons/shotgun-1.mp3"],
    ["shotgun-2", "/assets/sounds/weapons/shotgun-2.mp3"],
    ["shotgun-3", "/assets/sounds/weapons/shotgun-3.mp3"],

    ["hand-cannon-1", "/assets/sounds/weapons/hand-cannon-1.mp3"],
    ["hand-cannon-2", "/assets/sounds/weapons/hand-cannon-2.mp3"],
    ["hand-cannon-3", "/assets/sounds/weapons/hand-cannon-3.mp3"],

    ["minigun-1", "/assets/sounds/weapons/minigun-1.mp3"],
    ["minigun-2", "/assets/sounds/weapons/minigun-2.mp3"],
    ["minigun-3", "/assets/sounds/weapons/minigun-3.mp3"],

    ["hellfire-shotgun-1", "/assets/sounds/weapons/hellfire-shotgun-1.mp3"],
    ["hellfire-shotgun-2", "/assets/sounds/weapons/hellfire-shotgun-2.mp3"],
    ["hellfire-shotgun-3", "/assets/sounds/weapons/hellfire-shotgun-3.mp3"],

    ["zombie-hit-1", "/assets/sounds/zombies/hit-1.mp3"],
    ["zombie-hit-2", "/assets/sounds/zombies/hit-2.mp3"],
    ["zombie-hit-3", "/assets/sounds/zombies/hit-3.mp3"],

    ["zombie-death-1", "/assets/sounds/zombies/death-1.mp3"],
    ["zombie-death-2", "/assets/sounds/zombies/death-2.mp3"],
    ["zombie-death-3", "/assets/sounds/zombies/death-3.mp3"],

    ["zombie-alert", "/assets/sounds/zombies/alert.mp3"],

    ["exploder", "/assets/sounds/zombies/exploder.mp3"],

    ["spitter", "/assets/sounds/zombies/spitter.mp3"],

    ["stalker-appear", "/assets/sounds/stalker/appear.mp3"],

    ["stalker-flee", "/assets/sounds/stalker/flee.mp3"],

    ["stalker-return", "/assets/sounds/stalker/return.mp3"],

    ["rush-start", "/assets/sounds/events/rush-start.mp3"],

    ["mutation", "/assets/sounds/events/mutation.mp3"],

    ["supply", "/assets/sounds/events/supply.mp3"],

    ["biomass-burn", "/assets/sounds/events/biomass-burn.mp3"],

    ["level-up", "/assets/sounds/events/level-up.mp3"],

    ["xp-1", "/assets/sounds/events/xp-1.mp3"],
    ["xp-2", "/assets/sounds/events/xp-2.mp3"],
    ["xp-3", "/assets/sounds/events/xp-3.mp3"],

    ["game-over", "/assets/sounds/events/game-over.mp3"],

    ["extraction", "/assets/sounds/events/extraction.mp3"],

    ["boss-warning", "/assets/sounds/events/boss-warning.mp3"],

    ["weapon-upgrade", "/assets/sounds/events/weapon-upgrade.mp3"],

    ["weather-rain", "/assets/sounds/weather/rain-loop.mp3"],

    ["weather-storm", "/assets/sounds/weather/storm-loop.mp3"],
  ];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  static preload(scene: Phaser.Scene) {
    for (const [key, path] of AudioSystem.FILES) {
      scene.load.audio(key, path);
    }
  }

  private randomKey(prefix: string, variants: number) {
    return `${prefix}-${Phaser.Math.Between(1, variants)}`;
  }

  private canPlay(key: string, cooldown: number) {
    if (cooldown <= 0) {
      return true;
    }

    const now = this.scene.time.now;

    const previous = this.lastPlayed.get(key) ?? -Infinity;

    if (now - previous < cooldown) {
      return false;
    }

    this.lastPlayed.set(key, now);

    return true;
  }

  private play(key: string, options: PlayOptions = {}) {
    if (!this.scene.cache.audio.exists(key)) {
      return;
    }

    const cooldown = options.cooldown ?? 0;

    const cooldownKey = options.cooldownKey ?? key;

    if (!this.canPlay(cooldownKey, cooldown)) {
      return;
    }

    this.scene.sound.play(key, {
      volume: (options.volume ?? 1) * this.effectsVolume,

      detune: options.detune ?? 0,

      rate: options.rate ?? 1,

      pan: options.pan ?? 0,
    });
  }

  private getSpatialData(x: number, y: number, maxDistance: number) {
    const camera = this.scene.cameras.main;

    const listenerX = camera.midPoint.x;

    const listenerY = camera.midPoint.y;

    const distance = Phaser.Math.Distance.Between(listenerX, listenerY, x, y);

    const volume = Phaser.Math.Clamp(1 - distance / maxDistance, 0, 1);

    const halfWidth = Math.max(camera.width / 2, 1);

    const pan = Phaser.Math.Clamp((x - listenerX) / halfWidth, -1, 1);

    return {
      volume,
      pan,
    };
  }

  private playWorld(
    key: string,
    x: number,
    y: number,
    options: WorldPlayOptions = {},
  ) {
    const maxDistance = options.maxDistance ?? 900;

    const spatial = this.getSpatialData(x, y, maxDistance);

    if (spatial.volume <= 0.01) {
      return;
    }

    this.play(key, {
      ...options,

      volume: (options.volume ?? 1) * spatial.volume,

      pan: spatial.pan,
    });
  }

  playWeapon(weapon: WeaponType, evolved: boolean) {
    let prefix = weapon;

    let volume = 0.78;

    let cooldown = 0;

    if (weapon === "pistol") {
      prefix = evolved ? "hand-cannon" : "pistol";

      volume = evolved ? 0.95 : 0.72;

      cooldown = evolved ? 120 : 70;
    }

    if (weapon === "rifle") {
      prefix = evolved ? "minigun" : "rifle";

      volume = 0.58;

      cooldown = evolved ? 35 : 45;
    }

    if (weapon === "shotgun") {
      prefix = evolved ? "hellfire-shotgun" : "shotgun";

      volume = evolved ? 1 : 0.92;

      cooldown = evolved ? 220 : 180;
    }

    this.play(this.randomKey(prefix, 3), {
      volume,

      cooldown,

      cooldownKey: `weapon-${prefix}`,

      detune: Phaser.Math.Between(-18, 18),

      rate: Phaser.Math.FloatBetween(0.985, 1.015),
    });
  }

  playZombieHit(x: number, y: number) {
    this.playWorld(this.randomKey("zombie-hit", 3), x, y, {
      volume: 0.42,

      maxDistance: 650,

      cooldown: 45,

      cooldownKey: "zombie-hit",

      detune: Phaser.Math.Between(-55, 35),
    });
  }

  playZombieDeath(x: number, y: number) {
    this.playWorld(this.randomKey("zombie-death", 3), x, y, {
      volume: 0.5,

      maxDistance: 750,

      cooldown: 90,

      cooldownKey: "zombie-death",

      detune: Phaser.Math.Between(-70, 45),
    });
  }

  playZombieAlert(x: number, y: number) {
    this.playWorld("zombie-alert", x, y, {
      volume: 0.58,

      maxDistance: 900,

      cooldown: 550,

      cooldownKey: "zombie-alert",

      detune: Phaser.Math.Between(-60, 35),
    });
  }

  playExploder(x: number, y: number) {
    this.playWorld("exploder", x, y, {
      volume: 0.95,

      maxDistance: 1200,

      cooldown: 120,

      cooldownKey: "exploder",
    });
  }

  playSpitter(x: number, y: number) {
    this.playWorld("spitter", x, y, {
      volume: 0.55,

      maxDistance: 850,

      cooldown: 180,

      cooldownKey: "spitter",

      detune: Phaser.Math.Between(-35, 35),
    });
  }

  playStalkerAppear(x: number, y: number) {
    this.playWorld("stalker-appear", x, y, {
      volume: 1,

      maxDistance: 1800,
    });
  }

  playStalkerFlee(x: number, y: number) {
    this.playWorld("stalker-flee", x, y, {
      volume: 0.9,

      maxDistance: 1500,
    });
  }

  playStalkerReturn(x: number, y: number) {
    this.playWorld("stalker-return", x, y, {
      volume: 1,

      maxDistance: 1800,
    });
  }

  playRushStart() {
    this.play("rush-start", {
      volume: 0.82,

      cooldown: 1500,
    });
  }

  playMutation() {
    this.play("mutation", {
      volume: 0.82,
    });
  }

  playSupply(x: number, y: number) {
    this.playWorld("supply", x, y, {
      volume: 0.72,

      maxDistance: 1400,
    });
  }

  playBiomassBurn(x: number, y: number) {
    this.playWorld("biomass-burn", x, y, {
      volume: 0.95,

      maxDistance: 1400,
    });
  }

  playLevelUp() {
    this.play("level-up", {
      volume: 0.72,

      cooldown: 250,
    });
  }

  playWeaponUpgrade() {
    this.play("weapon-upgrade", {
      volume: 0.78,

      cooldown: 250,
    });
  }

  playXp() {
    this.play(this.randomKey("xp", 3), {
      volume: 0.2,

      cooldown: 45,

      cooldownKey: "xp",

      detune: Phaser.Math.Between(-25, 25),
    });
  }

  playBossWarning() {
    this.play("boss-warning", {
      volume: 0.85,

      cooldown: 1000,
    });
  }

  playGameOver() {
    this.play("game-over", {
      volume: 0.78,
    });
  }

  playExtraction() {
    this.play("extraction", {
      volume: 0.82,
    });
  }

  setWeather(weather: WeatherType) {
    if (weather === "clear" || weather === "fog") {
      this.stopWeather();

      return;
    }

    const key = weather === "rain" ? "weather-rain" : "weather-storm";

    if (this.currentWeatherKey === key && this.weatherLoop?.isPlaying) {
      return;
    }

    this.stopWeather();

    if (!this.scene.cache.audio.exists(key)) {
      return;
    }

    this.weatherLoop = this.scene.sound.add(key, {
      loop: true,

      volume: this.ambientVolume,
    });

    this.currentWeatherKey = key;

    this.weatherLoop.play();
  }

  stopWeather() {
    if (this.weatherLoop) {
      this.weatherLoop.stop();

      this.weatherLoop.destroy();

      this.weatherLoop = null;
    }

    this.currentWeatherKey = null;
  }

  toggleMute() {
    this.scene.sound.mute = !this.scene.sound.mute;

    return this.scene.sound.mute;
  }

  destroy() {
    this.stopWeather();

    this.lastPlayed.clear();
  }
}
