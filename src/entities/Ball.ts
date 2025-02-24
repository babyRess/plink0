import { GameConfig } from '../config/GameConfig';

export class Ball {
  public gameObject: Phaser.GameObjects.Arc;
  public velocity: Phaser.Math.Vector2;

  constructor(scene: Phaser.Scene, x: number, y: number, radius: number) {
    this.gameObject = scene.add.circle(x, y, radius, 0x000000);
    this.gameObject.setStrokeStyle(2, 0x333333);
    
    const initialVelocityX = (Math.random() - 0.5) * GameConfig.PHYSICS.INITIAL_VELOCITY.X_RANGE;
    const initialVelocityY = GameConfig.PHYSICS.INITIAL_VELOCITY.Y;
    this.velocity = new Phaser.Math.Vector2(initialVelocityX, initialVelocityY);
  }

  destroy() {
    if (this.gameObject) {
      this.gameObject.destroy();
    }
  }
} 