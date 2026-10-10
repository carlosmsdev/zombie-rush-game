export type MutationTraitId =
  | "mutantArm"
  | "parasiteEye"
  | "feralLegs"
  | "mutantHeart";

export interface MutationTrait {
  id: MutationTraitId;

  name: string;

  description: string;
}

export const MUTATION_TRAITS: MutationTrait[] = [
  {
    id: "mutantArm",

    name: "BRAÇO ABERRANTE",

    description: "+30% dano e +25% knockback, mas atira 10% mais devagar.",
  },

  {
    id: "parasiteEye",

    name: "OLHO PARASITA",

    description: "+12% crítico e +100 alcance para coletar XP.",
  },

  {
    id: "feralLegs",

    name: "PERNAS FERAIS",

    description: "+20% velocidade, mas seus passos fazem mais barulho.",
  },

  {
    id: "mutantHeart",

    name: "CORAÇÃO MUTANTE",

    description:
      "Rouba 4% do dano como vida, mas a infecção nunca fica abaixo de 50%.",
  },
];

export class MutationEvolutionSystem {
  thresholds: number[] = [50, 80];

  chosenTraits: MutationTraitId[] = [];

  claimedThresholds: number[] = [];

  pendingThreshold: number | null = null;

  update(infection: number) {
    if (this.pendingThreshold !== null) {
      return;
    }

    for (const threshold of this.thresholds) {
      if (
        infection >= threshold &&
        !this.claimedThresholds.includes(threshold)
      ) {
        this.pendingThreshold = threshold;

        return;
      }
    }
  }

  hasPendingChoice() {
    return this.pendingThreshold !== null;
  }

  getChoices() {
    const available = MUTATION_TRAITS.filter(
      (trait) => !this.chosenTraits.includes(trait.id),
    );

    return available.sort(() => Math.random() - 0.5).slice(0, 3);
  }

  selectTrait(id: MutationTraitId) {
    if (this.pendingThreshold === null) {
      return false;
    }

    if (this.chosenTraits.includes(id)) {
      return false;
    }

    this.chosenTraits.push(id);

    this.claimedThresholds.push(this.pendingThreshold);

    this.pendingThreshold = null;

    return true;
  }

  hasTrait(id: MutationTraitId) {
    return this.chosenTraits.includes(id);
  }

  getDamageMultiplier() {
    return this.hasTrait("mutantArm") ? 1.3 : 1;
  }

  getFireRateMultiplier() {
    return this.hasTrait("mutantArm") ? 1.1 : 1;
  }

  getKnockbackMultiplier() {
    return this.hasTrait("mutantArm") ? 1.25 : 1;
  }

  getCriticalChanceBonus() {
    return this.hasTrait("parasiteEye") ? 0.12 : 0;
  }

  getSpeedMultiplier() {
    return this.hasTrait("feralLegs") ? 1.2 : 1;
  }

  getMovementNoiseMultiplier() {
    return this.hasTrait("feralLegs") ? 2.2 : 1;
  }

  getLifeSteal() {
    return this.hasTrait("mutantHeart") ? 0.04 : 0;
  }

  getInfectionFloor() {
    return this.hasTrait("mutantHeart") ? 50 : 0;
  }
}
