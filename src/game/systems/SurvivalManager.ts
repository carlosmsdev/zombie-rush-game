export class SurvivalManager {
  elapsedTime: number = 0;

  gameDuration: number = 15 * 60 * 1000;

  extractionReady: boolean = false;

  update(delta: number) {
    this.elapsedTime += delta;

    if (this.elapsedTime >= this.gameDuration) {
      this.extractionReady = true;
    }
  }

  getElapsedSeconds() {
    return Math.floor(this.elapsedTime / 1000);
  }

  getDifficultyLevel() {
    return Math.floor(this.getElapsedSeconds() / 60) + 1;
  }

  getSpawnDelay() {
    const difficulty = this.getDifficultyLevel();

    return Math.max(280, 1200 - (difficulty - 1) * 70);
  }

  getFormattedTime() {
    const totalSeconds = this.getElapsedSeconds();

    const minutes = Math.floor(totalSeconds / 60);

    const seconds = totalSeconds % 60;

    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }
}
