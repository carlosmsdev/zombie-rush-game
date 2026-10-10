export interface ScentTrail {
  x: number;
  y: number;

  strength: number;

  timeRemaining: number;
}

export class ScentSystem {
  trails: ScentTrail[] = [];

  maxTrails: number = 45;

  update(delta: number) {
    for (const trail of this.trails) {
      trail.timeRemaining -= delta;

      trail.strength *= 0.998;
    }

    this.trails = this.trails.filter(
      (trail) => trail.timeRemaining > 0 && trail.strength > 0.05,
    );

    if (this.trails.length > this.maxTrails) {
      this.trails.splice(0, this.trails.length - this.maxTrails);
    }
  }

  addScent(
    x: number,
    y: number,
    strength: number = 1,
    duration: number = 9000,
  ) {
    this.trails.push({
      x,
      y,
      strength,
      timeRemaining: duration,
    });
  }

  getBestScentFor(x: number, y: number, maxDistance: number = 550) {
    let best: ScentTrail | null = null;

    let bestScore = 0;

    for (const trail of this.trails) {
      const dx = trail.x - x;

      const dy = trail.y - y;

      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > maxDistance) {
        continue;
      }

      const distanceFactor = 1 - distance / maxDistance;

      const score = trail.strength * distanceFactor;

      if (score > bestScore) {
        bestScore = score;

        best = trail;
      }
    }

    return best;
  }
}
