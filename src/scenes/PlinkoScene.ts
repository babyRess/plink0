import { Ball } from '../entities/Ball';
import { GameConfig } from '../config/GameConfig';
import { HUD } from './ui/HUD';

export class PlinkoScene extends Phaser.Scene {
  private pegsXPosition: number[][] = [];
  private pegsPositions: Phaser.Math.Vector2[] = [];
  private balance: number = GameConfig.GAME.INITIAL_BALANCE;
  private activeBalls: Ball[] = [];
  private pegBoundaries: { left: number; right: number }[] = [];
  private payoutBoxes: Phaser.GameObjects.Rectangle[] = [];
  private payoutsPosition: Phaser.Math.Vector2[] = [];
  private hud!: HUD;

  constructor() {
    super({ key: 'PlinkoScene' });
  }

  preload() {}

  update() {
    this.updateBalls();
  }

  private updateBalls() {
    this.activeBalls = this.activeBalls.filter(ball => {
      if (!ball.gameObject) return false;

      for (const peg of this.pegsPositions) {
        const distance = this.distanceTwoPoints(
          ball.gameObject.x, 
          ball.gameObject.y, 
          peg.x, 
          peg.y
        );
        if (distance < GameConfig.GAME.PEG_RADIUS + GameConfig.GAME.BALL_RADIUS) {
          this.handleCollision(ball, peg);
          break;
        }
      }

      for (const payout of this.payoutsPosition) {
        const distance = this.distanceTwoPoints(
          ball.gameObject.x, 
          ball.gameObject.y, 
          payout.x, 
          payout.y
        );
        if (distance < (42 * 1.4) / 2 + GameConfig.GAME.BALL_RADIUS) {
          this.handlePayoutCollision(ball, payout);
          return false;
        }
      }

      this.updateBallPhysics(ball);

      if (ball.gameObject.y > this.cameras.main.height) {
        ball.destroy();
        return false;
      }

      return true;
    });
  }

  private updateBallPhysics(ball: Ball) {
    // Apply gravity first
    ball.velocity.y += GameConfig.PHYSICS.GRAVITY;
    
    // Apply friction to horizontal movement
    ball.velocity.x *= GameConfig.PHYSICS.FRICTION;

    // Apply speed limit after forces are applied
    const currentSpeed = Math.sqrt(ball.velocity.x ** 2 + ball.velocity.y ** 2);
    if (currentSpeed > GameConfig.PHYSICS.MAX_SPEED) {
      const scale = GameConfig.PHYSICS.MAX_SPEED / currentSpeed;
      ball.velocity.x *= scale;
      ball.velocity.y *= scale;
    }

    // Update position
    ball.gameObject.x += ball.velocity.x;
    ball.gameObject.y += ball.velocity.y;

    // Handle boundaries after position update
    const currentRow = Math.floor((ball.gameObject.y - 100) / GameConfig.GAME.PEG_SPACING);
    if (currentRow >= 1 && currentRow < this.pegBoundaries.length) {
      this.handleBoundaryCollision(ball, currentRow);
    }
  }

  private dropBall() {
    if (this.balance < GameConfig.GAME.COST_PER_PLAY) {
      return;
    }

    this.balance -= GameConfig.GAME.COST_PER_PLAY;
    this.updateHuD();

    const startX = this.cameras.main.width / 2 + Phaser.Math.FloatBetween(-20, 20);
    const newBall = new Ball(
      this, 
      startX, 
      50, 
      GameConfig.GAME.BALL_RADIUS
    );
    this.activeBalls.push(newBall);
  }

  private handleCollisionPayout(peg: Phaser.Math.Vector2) {
    const payoutIndex = this.payoutsPosition.indexOf(peg);
    const payoutBox = this.payoutBoxes[payoutIndex];
    this.tweens.add({
      targets: payoutBox,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 200,
      yoyo: true,
      ease: 'Quad.easeInOut',
      onComplete: () => {
        payoutBox.setScale(1);
      },
    });
    this.balance += GameConfig.GAME.COST_PER_PLAY * GameConfig.PAYOUT.MULTIPLIERS[payoutIndex];
    this.updateHuD();
  }

  private handleCollision(ball: Ball, peg: Phaser.Math.Vector2) {
    const dx = ball.gameObject.x - peg.x;
    const dy = ball.gameObject.y - peg.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const normalX = dx / distance;
    const normalY = dy / distance;

    const relativeVelocity = ball.velocity.x * normalX + ball.velocity.y * normalY;

    if (relativeVelocity < 0) {
      const impulse = -(1 + GameConfig.PHYSICS.BOUNCE_ENERGY_LOSS) * relativeVelocity;

      ball.velocity.x += impulse * normalX;
      ball.velocity.y += impulse * normalY;

      ball.velocity.x += Phaser.Math.FloatBetween(-0.3, 0.3);

      const separation = GameConfig.GAME.PEG_RADIUS + GameConfig.GAME.BALL_RADIUS - distance;
      ball.gameObject.x += normalX * separation;
      ball.gameObject.y += normalY * separation;
    }
  }

  private handlePayoutCollision(ball: Ball, payout: Phaser.Math.Vector2) {
    this.handleCollisionPayout(payout);
    ball.destroy();
  }

  private handleBoundaryCollision(ball: Ball, currentRow: number) {
    const boundaries = this.pegBoundaries[currentRow];
    const leftBoundary = boundaries.left - GameConfig.GAME.BALL_RADIUS;
    const rightBoundary = boundaries.right + GameConfig.GAME.BALL_RADIUS;

    const nextX = ball.gameObject.x + ball.velocity.x;
    if (nextX < leftBoundary) {
      ball.gameObject.x = leftBoundary;
      ball.velocity.x = Math.abs(ball.velocity.x) * GameConfig.PHYSICS.BOUNCE_ENERGY_LOSS;
    } else if (nextX > rightBoundary) {
      ball.gameObject.x = rightBoundary;
      ball.velocity.x = -Math.abs(ball.velocity.x) * GameConfig.PHYSICS.BOUNCE_ENERGY_LOSS;
    }
  }

  create() {
    this.cameras.main.setBackgroundColor(0xa2d2df);
    this.createPegs();
    this.createPayoutAreas();
    this.hud = new HUD(this, () => this.dropBall());
  }

  private createPegs() {
    const rows = 10;

    for (let row = 1; row < rows; row++) {
      this.pegsXPosition[row] = [];
      let rowLeftmost = Number.POSITIVE_INFINITY;
      let rowRightmost = Number.NEGATIVE_INFINITY;

      for (let col = 0; col <= row; col++) {
        const x = this.cameras.main.width / 2 + (col - row / 2) * GameConfig.GAME.PEG_SPACING;
        const y = 100 + row * GameConfig.GAME.PEG_SPACING;
        this.pegsPositions.push(new Phaser.Math.Vector2(x, y));

        rowLeftmost = Math.min(rowLeftmost, x);
        rowRightmost = Math.max(rowRightmost, x);

        if (row === rows - 1) {
          this.pegsXPosition[row].push(x);
        }

        this.add.circle(x, y, GameConfig.GAME.PEG_RADIUS, 0xffffff);
      }

      this.pegBoundaries[row] = { left: rowLeftmost, right: rowRightmost };
    }
  }

  private updateHuD() {
    this.hud.updateBalance(this.balance);
  }

  private distanceTwoPoints(x1: number, y1: number, x2: number, y2: number) {
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
  }

  private createPayoutAreas() {
    const payoutRow = this.pegsXPosition[this.pegsXPosition.length - 1];
    const boxWidth = 42 * 1.4;
    const boxHeight = 42 * 1.4;
    const boxSpacing = 8.5 * 1.4;
    const y = this.cameras.main.height - 106;
    const startX = payoutRow[0] + boxWidth / 2 + 3 * 1.4;

    for (let i = 0; i < 9; i++) {
      const x = startX + i * boxWidth + i * boxSpacing;
      const box = this.add.rectangle(x, y, boxWidth, boxHeight, 0xff0000);
      this.payoutBoxes.push(box);
      this.payoutsPosition.push(new Phaser.Math.Vector2(x, y));
      const text = this.add.text(x, y, `x${GameConfig.PAYOUT.MULTIPLIERS[i]}`, {
        fontSize: '20px',
        color: '#ffffff',
      });
      text.setOrigin(0.5, 0.5);
    }
  }
}
