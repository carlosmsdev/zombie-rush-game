import Phaser from "phaser";

import "./style.css";

import { GameScene } from "./game/GameScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,

  width: 1000,
  height: 600,

  backgroundColor: "#080a0d",

  scene: [GameScene],
};

new Phaser.Game(config);
