import type { InfectionSystem } from "./InfectionSystem";

export class MutationSystem {
  active: boolean = false;

  duration: number = 15000;

  timeRemaining: number = 0;

  infectionPerSecond: number = 0.4;

  mutationCount: number = 0;

  private finishedPending: boolean = false;

  canActivate(infectionSystem: InfectionSystem) {
    return !this.active && infectionSystem.canMutate();
  }

  activate(infectionSystem: InfectionSystem) {
    if (!this.canActivate(infectionSystem)) {
      return false;
    }

    this.active = true;

    this.timeRemaining = this.duration;

    this.mutationCount += 1;

    // Ativar a mutação já tem
    // um pequeno custo.
    infectionSystem.addInfection(2);

    return true;
  }

  update(delta: number, infectionSystem: InfectionSystem) {
    if (!this.active) {
      return;
    }

    this.timeRemaining -= delta;

    const deltaSeconds = delta / 1000;

    infectionSystem.addInfection(this.infectionPerSecond * deltaSeconds);

    if (infectionSystem.isFullyInfected()) {
      this.stop();

      return;
    }

    if (this.timeRemaining <= 0) {
      this.stop();
    }
  }

  stop() {
    if (!this.active) {
      return;
    }

    this.active = false;

    this.timeRemaining = 0;

    this.finishedPending = true;
  }

  consumeFinished() {
    if (!this.finishedPending) {
      return false;
    }

    this.finishedPending = false;

    return true;
  }

  getSecondsRemaining() {
    return Math.ceil(this.timeRemaining / 1000);
  }

  getDamageMultiplier() {
    if (!this.active) {
      return 1;
    }

    return 1.75;
  }

  getSpeedMultiplier() {
    if (!this.active) {
      return 1;
    }

    return 1.35;
  }

  getExtraProjectiles() {
    if (!this.active) {
      return 0;
    }

    return 2;
  }

  getKnockbackMultiplier() {
    if (!this.active) {
      return 1;
    }

    return 1.5;
  }

  getLifeSteal() {
    if (!this.active) {
      return 0;
    }

    return 0.06;
  }
}
