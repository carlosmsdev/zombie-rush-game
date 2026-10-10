export class InfectionSystem {
  infection: number = 0;

  maxInfection: number = 100;

  mutationRequired: number = 90;

  addInfection(amount: number) {
    if (amount <= 0) {
      return;
    }

    this.infection += amount;

    this.infection = Math.min(this.infection, this.maxInfection);
  }

  reduceInfection(amount: number) {
    this.infection -= amount;

    this.infection = Math.max(0, this.infection);
  }

  getPercentage() {
    return this.infection / this.maxInfection;
  }

  isFullyInfected() {
    return this.infection >= this.maxInfection;
  }

  canMutate() {
    return this.infection >= this.mutationRequired && !this.isFullyInfected();
  }

  getDamageMultiplier() {
    if (this.infection >= 90) {
      return 1.25;
    }

    if (this.infection >= 75) {
      return 1.2;
    }

    if (this.infection >= 50) {
      return 1.1;
    }

    return 1;
  }

  getSpeedMultiplier() {
    if (this.infection >= 90) {
      return 1.15;
    }

    if (this.infection >= 75) {
      return 1.1;
    }

    if (this.infection >= 25) {
      return 1.05;
    }

    return 1;
  }

  getCriticalChanceBonus() {
    if (this.infection >= 90) {
      return 0.1;
    }

    if (this.infection >= 50) {
      return 0.05;
    }

    return 0;
  }

  getMaxHealthPenalty() {
    if (this.infection >= 75) {
      return 0.1;
    }

    return 0;
  }

  getStage() {
    if (this.infection >= 90) {
      return 4;
    }

    if (this.infection >= 75) {
      return 3;
    }

    if (this.infection >= 50) {
      return 2;
    }

    if (this.infection >= 25) {
      return 1;
    }

    return 0;
  }
}
