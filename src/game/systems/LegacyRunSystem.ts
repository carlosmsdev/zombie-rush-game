import type { WeaponType } from "../Weapon";

export interface LegacyRunData {
  score: number;

  level: number;

  infection: number;

  mutationCount: number;

  weapon: WeaponType;

  evolvedWeapon: boolean;
}

export interface LegacyBossStats {
  name: string;

  health: number;

  speed: number;

  damage: number;

  weapon: WeaponType;

  evolvedWeapon: boolean;
}

export class LegacyRunSystem {
  private storageKey = "zombieRushPreviousRun";

  previousRun: LegacyRunData | null = null;

  spawnTimeSeconds: number = 180;

  spawnedThisRun: boolean = false;

  defeatedThisRun: boolean = false;

  weaponUsage: Record<WeaponType, number> = {
    pistol: 0,
    rifle: 0,
    shotgun: 0,
  };

  constructor() {
    this.previousRun = this.loadPreviousRun();
  }

  recordShot(type: WeaponType) {
    this.weaponUsage[type] += 1;
  }

  getMostUsedWeapon(): WeaponType {
    const entries = Object.entries(this.weaponUsage) as Array<
      [WeaponType, number]
    >;

    entries.sort((a, b) => b[1] - a[1]);

    return entries[0][0];
  }

  shouldSpawn(elapsedSeconds: number) {
    return (
      !!this.previousRun &&
      !this.spawnedThisRun &&
      elapsedSeconds >= this.spawnTimeSeconds
    );
  }

  markSpawned() {
    this.spawnedThisRun = true;
  }

  markDefeated() {
    this.defeatedThisRun = true;
  }

  getBossStats(): LegacyBossStats | null {
    const run = this.previousRun;

    if (!run) {
      return null;
    }

    const health = Math.min(4200, 700 + run.level * 85 + run.score * 0.08);

    const speed = Math.min(140, 70 + run.infection * 0.35);

    const damage = Math.min(80, 28 + run.level * 1.8);

    let name = "FALLEN SURVIVOR";

    if (run.weapon === "pistol") {
      name = "FALLEN GUNSLINGER";
    }

    if (run.weapon === "rifle") {
      name = "FALLEN GUNNER";
    }

    if (run.weapon === "shotgun") {
      name = "FALLEN BREACHER";
    }

    if (run.evolvedWeapon) {
      name = `EVOLVED ${name}`;
    }

    return {
      name,

      health,

      speed,

      damage,

      weapon: run.weapon,

      evolvedWeapon: run.evolvedWeapon,
    };
  }

  saveRun(data: {
    score: number;

    level: number;

    infection: number;

    mutationCount: number;

    evolvedWeapon: boolean;
  }) {
    const run: LegacyRunData = {
      score: data.score,

      level: data.level,

      infection: data.infection,

      mutationCount: data.mutationCount,

      weapon: this.getMostUsedWeapon(),

      evolvedWeapon: data.evolvedWeapon,
    };

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(run));
    } catch {
      // Continua funcionando mesmo
      // se o navegador bloquear o save.
    }
  }

  private loadPreviousRun() {
    try {
      const saved = localStorage.getItem(this.storageKey);

      if (!saved) {
        return null;
      }

      return JSON.parse(saved) as LegacyRunData;
    } catch {
      return null;
    }
  }
}
