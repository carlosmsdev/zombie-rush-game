export interface SoundPulse {
  id: number;
  x: number;
  y: number;
  radius: number;
  strength: number;
  timeRemaining: number;
}

export class SoundSystem {
  pulses: SoundPulse[] = [];

  private nextId: number = 1;

  update(delta: number) {
    for (const pulse of this.pulses) {
      pulse.timeRemaining -= delta;
    }

    this.pulses = this.pulses.filter((pulse) => pulse.timeRemaining > 0);
  }

  addSound(
    x: number,
    y: number,
    radius: number,
    strength: number = 1,
    lifetime: number = 1800,
  ) {
    this.pulses.push({
      id: this.nextId++,
      x,
      y,
      radius,
      strength,
      timeRemaining: lifetime,
    });
  }

  getBestSoundFor(x: number, y: number) {
    let best: SoundPulse | null = null;

    let bestScore = 0;

    for (const pulse of this.pulses) {
      const dx = pulse.x - x;

      const dy = pulse.y - y;

      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > pulse.radius) {
        continue;
      }

      const distanceFactor = 1 - distance / pulse.radius;

      const score = pulse.strength * distanceFactor;

      if (score > bestScore) {
        bestScore = score;

        best = pulse;
      }
    }

    return best;
  }
}
