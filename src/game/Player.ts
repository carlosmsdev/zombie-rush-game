import Phaser from "phaser";

export class Player extends Phaser.GameObjects.Rectangle {
  speed: number = 250;

  health: number = 100;
  maxHealth: number = 100;

  cursors: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 50, 24, 0x00ff88);

    scene.add.existing(this);

    this.cursors = scene.input.keyboard!.addKeys({
      W: "W",
      A: "A",
      S: "S",
      D: "D",
    }) as {
      W: Phaser.Input.Keyboard.Key;
      A: Phaser.Input.Keyboard.Key;
      S: Phaser.Input.Keyboard.Key;
      D: Phaser.Input.Keyboard.Key;
    };
  }

  update(delta: number) {
    const deltaSeconds = delta / 1000;

    let directionX = 0;
    let directionY = 0;

    if (this.cursors.D.isDown) {
      directionX += 1;
    }

    if (this.cursors.A.isDown) {
      directionX -= 1;
    }

    if (this.cursors.S.isDown) {
      directionY += 1;
    }

    if (this.cursors.W.isDown) {
      directionY -= 1;
    }

    const direction = new Phaser.Math.Vector2(directionX, directionY);

    if (direction.length() > 0) {
      direction.normalize();

      this.x += direction.x * this.speed * deltaSeconds;

      this.y += direction.y * this.speed * deltaSeconds;
    }

    this.x = Phaser.Math.Clamp(this.x, 25, 975);

    this.y = Phaser.Math.Clamp(this.y, 12, 588);

    const pointer = this.scene.input.activePointer;

    this.rotation = Phaser.Math.Angle.Between(
      this.x,
      this.y,
      pointer.x,
      pointer.y,
    );
  }

  takeDamage(amount: number) {
    this.health -= amount;

    if (this.health < 0) {
      this.health = 0;
    }
  }

  isDead() {
    return this.health <= 0;
  }
}
