export interface BiomassPatch {
  id: number;

  x: number;

  y: number;

  amount: number;

  isNest: boolean;

  spawnTimer: number;
}

export class BiomassSystem {
  patches: BiomassPatch[] = [];

  nestThreshold: number = 10;

  mergeRadius: number = 150;

  nestSpawnInterval: number = 7000;

  private nextId: number = 1;

  private newNestQueue: BiomassPatch[] = [];

  addDeath(x: number, y: number, amount: number = 1) {
    let patch = this.findNearestPatch(x, y, this.mergeRadius);

    if (!patch) {
      patch = {
        id: this.nextId++,

        x,

        y,

        amount: 0,

        isNest: false,

        spawnTimer: this.nestSpawnInterval,
      };

      this.patches.push(patch);
    }

    patch.amount += amount;

    if (!patch.isNest && patch.amount >= this.nestThreshold) {
      patch.isNest = true;

      patch.spawnTimer = 2500;

      this.newNestQueue.push(patch);
    }

    return patch;
  }

  update(delta: number) {
    const readyToSpawn: BiomassPatch[] = [];

    for (const patch of this.patches) {
      if (!patch.isNest) {
        continue;
      }

      patch.spawnTimer -= delta;

      if (patch.spawnTimer > 0) {
        continue;
      }

      readyToSpawn.push(patch);

      const pressureBonus = Math.min(3000, patch.amount * 120);

      patch.spawnTimer = Math.max(3000, this.nestSpawnInterval - pressureBonus);
    }

    return readyToSpawn;
  }

  consumeNewNest() {
    return this.newNestQueue.shift() ?? null;
  }

  burnClosest(x: number, y: number, maxDistance: number = 120) {
    const patch = this.findNearestPatch(x, y, maxDistance);

    if (!patch) {
      return null;
    }

    this.patches = this.patches.filter((item) => item.id !== patch!.id);

    this.newNestQueue = this.newNestQueue.filter(
      (item) => item.id !== patch!.id,
    );

    return patch;
  }

  findNearestPatch(x: number, y: number, maxDistance: number) {
    let nearest: BiomassPatch | null = null;

    let nearestDistance = maxDistance;

    for (const patch of this.patches) {
      const dx = patch.x - x;

      const dy = patch.y - y;

      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= nearestDistance) {
        nearest = patch;

        nearestDistance = distance;
      }
    }

    return nearest;
  }
}
