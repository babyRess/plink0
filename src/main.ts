import Phaser from 'phaser';
import { PlinkoScene } from './scenes/PlinkoScene';

const config = {
  type: Phaser.AUTO,
  width: 1600,
  height: 900,
  scene: PlinkoScene,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: true,
    },
  },
};

new Phaser.Game(config);
