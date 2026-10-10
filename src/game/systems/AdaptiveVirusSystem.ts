import type { WeaponType } from "../Weapon";

export type VirusAdaptationType =
  | "shotgunCarapace"
  | "rifleDenseTissue"
  | "pistolReflexes"
  | "interceptorPack"
  | "mutationHunters";

export interface VirusAdaptation {
  type: VirusAdaptationType;

  name: string;

  description: string;
}

const ADAPTATIONS: Record<VirusAdaptationType, VirusAdaptation> = {
  shotgunCarapace: {
    type: "shotgunCarapace",

    name: "CARAPAÇA DE IMPACTO",

    description: "O vírus criou tecido resistente contra Shotguns.",
  },

  rifleDenseTissue: {
    type: "rifleDenseTissue",

    name: "TECIDO DENSO",

    description: "Os infectados ficaram mais resistentes ao Rifle.",
  },

  pistolReflexes: {
    type: "pistolReflexes",

    name: "REFLEXOS PREDATÓRIOS",

    description: "Os infectados aprenderam a pressionar usuários de Pistola.",
  },

  interceptorPack: {
    type: "interceptorPack",

    name: "MATILHA INTERCEPTADORA",

    description:
      "O vírus percebeu sua mobilidade e criou caçadores mais rápidos.",
  },

  mutationHunters: {
    type: "mutationHunters",

    name: "CAÇADORES DE MUTANTES",

    description: "O vírus está reagindo ao seu uso frequente de mutação.",
  },
};

export class AdaptiveVirusSystem {
  analysisInterval: number = 90000;

  analysisTimeRemaining: number = 90000;

  maxAdaptations: number = 4;

  adaptations: VirusAdaptationType[] = [];

  weaponUsage: Record<WeaponType, number> = {
    pistol: 0,
    rifle: 0,
    shotgun: 0,
  };

  movementDistance: number = 0;

  mutationTime: number = 0;

  private pendingAdaptation: VirusAdaptation | null = null;

  update(delta: number) {
    if (this.adaptations.length >= this.maxAdaptations) {
      return;
    }

    this.analysisTimeRemaining -= delta;

    if (this.analysisTimeRemaining > 0) {
      return;
    }

    this.analyzePlayer();
  }

  recordShot(type: WeaponType) {
    this.weaponUsage[type] += 1;
  }

  recordMovement(distance: number) {
    if (distance <= 0) {
      return;
    }

    this.movementDistance += distance;
  }

  recordMutation(delta: number) {
    this.mutationTime += delta;
  }

  private analyzePlayer() {
    const candidates: Array<{
      type: VirusAdaptationType;

      score: number;
    }> = [];

    if (!this.adaptations.includes("shotgunCarapace")) {
      candidates.push({
        type: "shotgunCarapace",

        score: this.weaponUsage.shotgun,
      });
    }

    if (!this.adaptations.includes("rifleDenseTissue")) {
      candidates.push({
        type: "rifleDenseTissue",

        score: this.weaponUsage.rifle,
      });
    }

    if (!this.adaptations.includes("pistolReflexes")) {
      candidates.push({
        type: "pistolReflexes",

        score: this.weaponUsage.pistol,
      });
    }

    if (!this.adaptations.includes("interceptorPack")) {
      candidates.push({
        type: "interceptorPack",

        score: this.movementDistance / 220,
      });
    }

    if (!this.adaptations.includes("mutationHunters")) {
      candidates.push({
        type: "mutationHunters",

        score: this.mutationTime / 1000,
      });
    }

    candidates.sort((a, b) => b.score - a.score);

    const best = candidates[0];

    if (!best || best.score < 5) {
      this.resetAnalysisWindow();

      return;
    }

    this.adaptations.push(best.type);

    this.pendingAdaptation = ADAPTATIONS[best.type];

    this.resetAnalysisWindow();
  }

  private resetAnalysisWindow() {
    this.analysisTimeRemaining = this.analysisInterval;

    this.weaponUsage = {
      pistol: 0,
      rifle: 0,
      shotgun: 0,
    };

    this.movementDistance = 0;

    this.mutationTime = 0;
  }

  consumeNewAdaptation() {
    const adaptation = this.pendingAdaptation;

    this.pendingAdaptation = null;

    return adaptation;
  }

  hasAdaptation(type: VirusAdaptationType) {
    return this.adaptations.includes(type);
  }

  getDamageTakenMultiplier(weapon: WeaponType) {
    if (weapon === "shotgun" && this.hasAdaptation("shotgunCarapace")) {
      return 0.68;
    }

    if (weapon === "rifle" && this.hasAdaptation("rifleDenseTissue")) {
      return 0.76;
    }

    if (weapon === "pistol" && this.hasAdaptation("pistolReflexes")) {
      return 0.82;
    }

    return 1;
  }

  getZombieSpeedMultiplier() {
    let multiplier = 1;

    if (this.hasAdaptation("interceptorPack")) {
      multiplier *= 1.18;
    }

    if (this.hasAdaptation("pistolReflexes")) {
      multiplier *= 1.08;
    }

    return multiplier;
  }

  getSpecialEnemyBonus() {
    if (this.hasAdaptation("mutationHunters")) {
      return 18;
    }

    return 0;
  }

  getInfectionMultiplier() {
    if (this.hasAdaptation("mutationHunters")) {
      return 1.35;
    }

    return 1;
  }

  getAwarenessMultiplier() {
    if (this.hasAdaptation("interceptorPack")) {
      return 1.25;
    }

    return 1;
  }

  getAnalysisSecondsRemaining() {
    return Math.ceil(this.analysisTimeRemaining / 1000);
  }

  getCurrentFocus() {
    const entries: Array<{
      name: string;

      score: number;
    }> = [
      {
        name: "Pistola",

        score: this.weaponUsage.pistol,
      },

      {
        name: "Rifle",

        score: this.weaponUsage.rifle,
      },

      {
        name: "Shotgun",

        score: this.weaponUsage.shotgun,
      },

      {
        name: "Movimento",

        score: this.movementDistance / 220,
      },

      {
        name: "Mutação",

        score: this.mutationTime / 1000,
      },
    ];

    entries.sort((a, b) => b.score - a.score);

    if (entries[0].score < 1) {
      return "Coletando dados";
    }

    return entries[0].name;
  }
}
