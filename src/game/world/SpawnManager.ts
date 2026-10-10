import Phaser from "phaser";

import { WORLD_WIDTH, WORLD_HEIGHT } from "./World";

export class SpawnManager {
  scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  getSpawnPosition() {
    const camera = this.scene.cameras.main;

    const view = camera.worldView;

    const margin = 140;

    const side = Phaser.Math.Between(0, 3);

    let x = view.centerX;
    let y = view.centerY;

    switch (side) {
      case 0:
        x = Phaser.Math.Between(Math.floor(view.left), Math.floor(view.right));

        y = view.top - margin;

        break;

      case 1:
        x = view.right + margin;

        y = Phaser.Math.Between(Math.floor(view.top), Math.floor(view.bottom));

        break;

      case 2:
        x = Phaser.Math.Between(Math.floor(view.left), Math.floor(view.right));

        y = view.bottom + margin;

        break;

      default:
        x = view.left - margin;

        y = Phaser.Math.Between(Math.floor(view.top), Math.floor(view.bottom));

        break;
    }

    x = Phaser.Math.Clamp(x, 30, WORLD_WIDTH - 30);

    y = Phaser.Math.Clamp(y, 30, WORLD_HEIGHT - 30);

    return {
      x,
      y,
    };
  }
}
