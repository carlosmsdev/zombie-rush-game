export class ThreatSystem {
  noise: number = 0;

  maxNoise: number = 100;

  noiseDecayPerSecond: number = 2;

  rushActive: boolean = false;

  rushDuration: number = 25000;

  rushTimeRemaining: number = 0;

  rushCount: number = 0;

  private rushStartedPending: boolean = false;

  private rushEndedPending: boolean = false;

  update(delta: number) {
    if (this.rushActive) {
      this.updateRush(delta);

      return;
    }

    this.reduceNoise(this.noiseDecayPerSecond * (delta / 1000));
  }

  addNoise(amount: number) {
    if (amount <= 0) {
      return;
    }

    this.noise += amount;

    this.noise = Math.min(this.noise, this.maxNoise);

    if (this.noise >= this.maxNoise && !this.rushActive) {
      this.startRush();
    }
  }

  reduceNoise(amount: number) {
    this.noise -= amount;

    this.noise = Math.max(0, this.noise);
  }

  startRush() {
    if (this.rushActive) {
      return;
    }

    this.rushActive = true;

    this.rushTimeRemaining = this.rushDuration;

    this.rushCount += 1;

    this.rushStartedPending = true;
  }

  private updateRush(delta: number) {
    this.rushTimeRemaining -= delta;

    if (this.rushTimeRemaining > 0) {
      return;
    }

    this.finishRush();
  }

  private finishRush() {
    this.rushActive = false;

    this.rushTimeRemaining = 0;

    // Não volta para zero para
    // manter um pouco da tensão.
    this.noise = 30;

    this.rushEndedPending = true;
  }

  consumeRushStarted() {
    if (!this.rushStartedPending) {
      return false;
    }

    this.rushStartedPending = false;

    return true;
  }

  consumeRushEnded() {
    if (!this.rushEndedPending) {
      return false;
    }

    this.rushEndedPending = false;

    return true;
  }

  getNoisePercentage() {
    return this.noise / this.maxNoise;
  }

  getRushSecondsRemaining() {
    return Math.ceil(this.rushTimeRemaining / 1000);
  }

  getSpawnDelayMultiplier() {
    if (this.rushActive) {
      return 0.3;
    }

    if (this.noise >= 75) {
      return 0.7;
    }

    if (this.noise >= 50) {
      return 0.82;
    }

    if (this.noise >= 25) {
      return 0.92;
    }

    return 1;
  }

  getSpecialEnemyBonus() {
    if (this.rushActive) {
      return 25;
    }

    if (this.noise >= 75) {
      return 12;
    }

    if (this.noise >= 50) {
      return 6;
    }

    return 0;
  }

  getRewardMultiplier() {
    if (this.rushActive) {
      return 2;
    }

    return 1;
  }
}
